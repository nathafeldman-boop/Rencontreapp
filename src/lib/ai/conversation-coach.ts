import { z } from "zod";

import { callMistralJson } from "@/lib/ai/mistral";
import type { ConversationSuggestion } from "@/types/database.types";

const FALLBACK: ConversationSuggestion[] = [
  {
    tone: "funny",
    message: "Strong opening. I'll allow it — but only if you can beat me at trivia. Terms and conditions apply.",
    explanation: "Playful challenge invites a reply and keeps the tone light without trying too hard.",
  },
  {
    tone: "flirty",
    message: "Hi you. I was going to play it cool but that felt like a waste of a good opener.",
    explanation: "Direct interest signals confidence, and the self-aware line keeps it from feeling too intense.",
  },
  {
    tone: "natural",
    message: "Hey! How's your week going so far?",
    explanation: "Low-pressure and easy to answer — good when you want to keep momentum without overthinking it.",
  },
];

export async function getConversationSuggestions(
  conversationText: string
): Promise<{ suggestions: ConversationSuggestion[]; isSimulated: boolean }> {
  try {
    const suggestions = await callMistralForSuggestions(conversationText);
    return { suggestions, isSimulated: false };
  } catch (err) {
    console.error("[getConversationSuggestions] Falling back to templates:", err);
    return { suggestions: FALLBACK, isSimulated: true };
  }
}

async function callMistralForSuggestions(conversationText: string): Promise<ConversationSuggestion[]> {
  const schema = z.object({
    suggestions: z
      .array(
        z.object({
          tone: z.enum(["funny", "flirty", "natural"]),
          message: z.string().min(3).max(300),
          explanation: z.string().min(10).max(300),
        })
      )
      .length(3),
  });

  const response = await callMistralJson<unknown>({
    model: "mistral-large-latest",
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content:
          "You are a dating conversation coach. Given a pasted conversation (most recent message last), " +
          "suggest exactly 3 replies the user could send next: one funny, one flirty, one natural/low-key. " +
          "Each needs a short explanation of why it works. Respond with ONLY JSON matching " +
          '{ "suggestions": [{ "tone": "funny"|"flirty"|"natural", "message", "explanation" }] } (exactly 3 items).',
      },
      { role: "user", content: conversationText },
    ],
  });

  return schema.parse(response).suggestions;
}
