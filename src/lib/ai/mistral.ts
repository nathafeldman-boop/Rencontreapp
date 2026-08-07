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
}

/**
 * Thin wrapper around the Mistral chat completions endpoint. Supports
 * multimodal messages (text + image_url parts) for the vision-based photo
 * analysis in `analyze-profile.ts` — pass a vision-capable model
 * (e.g. "pixtral-large-latest") when a message includes image parts.
 */
export async function callMistral({
  model = "mistral-large-latest",
  messages,
  temperature = 0.3,
  responseFormat = "text",
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: MistralChatOptions) {
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
    throw new Error(`Mistral API error (${response.status}): ${errorBody}`);
  }

  return response.json() as Promise<{
    choices: { message: { content: string } }[];
  }>;
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
