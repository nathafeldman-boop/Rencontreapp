import { serverEnv } from "@/lib/env";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

interface MistralChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface MistralChatOptions {
  model?: string;
  messages: MistralChatMessage[];
  temperature?: number;
  responseFormat?: "json_object" | "text";
}

/**
 * Thin wrapper around the Mistral chat completions endpoint. This is
 * infrastructure only — no profile-analysis prompts or scoring logic yet.
 * That lands with the `/api/analyze` implementation in a later step.
 */
export async function callMistral({
  model = "mistral-large-latest",
  messages,
  temperature = 0.3,
  responseFormat = "text",
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
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Mistral API error (${response.status}): ${errorBody}`);
  }

  return response.json() as Promise<{
    choices: { message: { content: string } }[];
  }>;
}
