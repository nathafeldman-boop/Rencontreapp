import { serverEnv } from "@/lib/env";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 30_000;

type MistralContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: string };

interface MistralChatMessage {
  role: "system" | "user" | "assistant";
  content: string | MistralContentPart[];
}

interface MistralChatOptions {
  model?: string;
  messages: MistralChatMessage[];
  temperature?: number;
  responseFormat?: "json_object" | "text";
  timeoutMs?: number;
  /** Extra attempts on a timeout/network error or 5xx — never on a 4xx, which a retry can't fix. Default 1. */
  retries?: number;
}

type MistralApiError = Error & { status?: number; retryAfterMs?: number };

async function requestMistral(
  { model, messages, temperature, responseFormat, timeoutMs }: Required<Omit<MistralChatOptions, "retries">>
) {
  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serverEnv.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      ...(responseFormat === "json_object" ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const error: MistralApiError = new Error(`Mistral API error (${response.status}): ${errorBody}`);
    error.status = response.status;

    const retryAfterHeader = response.headers.get("retry-after");
    if (retryAfterHeader) {
      const seconds = Number(retryAfterHeader);
      error.retryAfterMs = Number.isFinite(seconds)
        ? seconds * 1000
        : Math.max(0, new Date(retryAfterHeader).getTime() - Date.now());
    }

    throw error;
  }

  return response.json() as Promise<{
    choices: { message: { content: string } }[];
  }>;
}

/**
 * Thin wrapper around the Mistral chat completions endpoint. Supports
 * multimodal messages (text + image_url parts) for the vision-based photo
 * analysis in `analyze-profile.ts` — pass a vision-capable model (see
 * `VISION_MODEL_CANDIDATES` / `withVisionModelFallback` below) when a
 * message includes image parts.
 *
 * Retries (by default once) on a timeout, network failure, 5xx, or 429 —
 * every caller already falls back to a deterministic simulation on any
 * thrown error (see the `isSimulated` pattern throughout `lib/ai/`), so
 * this only exists to absorb a transient blip before paying that cost.
 * 429 specifically honors the `Retry-After` header when Mistral sends one;
 * other retries use exponential backoff. Any other 4xx is a real client
 * error (bad request, invalid model, auth) that a retry can't fix, so it
 * throws immediately.
 */
export async function callMistral({
  model = "mistral-large-latest",
  messages,
  temperature = 0.3,
  responseFormat = "text",
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retries = 1,
}: MistralChatOptions) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestMistral({ model, messages, temperature, responseFormat, timeoutMs });
    } catch (err) {
      lastError = err;
      const { status, retryAfterMs } = err as MistralApiError;
      const isRateLimited = status === 429;
      const isClientError = typeof status === "number" && status >= 400 && status < 500 && !isRateLimited;
      if (isClientError || attempt === retries) throw err;

      const backoffMs = retryAfterMs ?? 400 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError;
}

/** Calls Mistral with `response_format: json_object` and parses the result. */
export async function callMistralJson<T>(options: Omit<MistralChatOptions, "responseFormat">): Promise<T> {
  const result = await callMistral({ ...options, responseFormat: "json_object" });
  const content = result.choices[0]?.message.content;

  if (!content) {
    throw new Error("Mistral returned an empty response.");
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("Mistral returned invalid JSON.");
  }
}

/**
 * Vision-capable model candidates, tried in order. Checked against Mistral's
 * docs on 2026-08-08: "mistral-large-latest" is text-only (it silently
 * ignores image parts instead of erroring, which is what produced ~15/100
 * scores in prod — see analyze-profile.ts), "pixtral-large-latest" has been
 * fully removed, and "pixtral-large-2411" is deprecated (2026-02-27) with
 * Mistral steering integrations toward Medium 3.5. Re-verify this list
 * against docs.mistral.ai/capabilities/vision before it's next touched —
 * Mistral has churned vision model names before.
 */
export const VISION_MODEL_CANDIDATES = [
  "mistral-medium-latest", // Mistral Medium 3.5 — current recommended multimodal model
  "pixtral-large-2411", // deprecated but still served as a pinned version; kept as a second attempt
  "mistral-large-latest", // NOT vision-capable — last resort so a request never hard-fails outright
] as const;

function isInvalidModelError(err: unknown): boolean {
  const status = (err as MistralApiError).status;
  if (status !== 400) return false;
  const message = (err as Error).message ?? "";
  return /invalid.{0,10}model|model.{0,10}not.{0,10}found|unknown model|model_not_found/i.test(message);
}

/**
 * Runs `call` once per candidate model, in order, falling through to the
 * next ONLY when Mistral rejects the model name itself (400 invalid_model —
 * e.g. an alias Mistral has fully removed, like the old "pixtral-large-latest"
 * that broke every real analysis in prod). Every other failure — 429 rate
 * limit, timeout, 5xx, or a downstream schema/parse error thrown by the
 * caller after a successful response — propagates immediately instead of
 * being swallowed into "just try a worse model".
 */
export async function withVisionModelFallback<T>(
  call: (model: string) => Promise<T>,
  models: readonly string[] = VISION_MODEL_CANDIDATES
): Promise<T> {
  let lastError: unknown;

  for (const model of models) {
    try {
      const result = await call(model);
      console.info(`[mistral] Vision request served by model: ${model}`);
      return result;
    } catch (err) {
      if (!isInvalidModelError(err)) throw err;
      console.warn(`[mistral] Model "${model}" rejected as invalid (400) — trying next vision candidate.`, err);
      lastError = err;
    }
  }

  throw lastError;
}
