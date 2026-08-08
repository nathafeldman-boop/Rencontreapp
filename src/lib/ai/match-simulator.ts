import { z } from "zod";

import { callMistral, callMistralJson } from "@/lib/ai/mistral";
import type { MatchMessage, MatchPersona } from "@/types/database.types";

const FALLBACK_REPLIES = [
  "Haha okay, I wasn't expecting that answer.",
  "Wait, tell me more about that.",
  "Okay you're actually kind of funny, noted.",
  "Hmm, I'll allow it. What else you got?",
  "That's a bold opinion, I respect it though.",
];

export async function getPersonaReply(
  persona: MatchPersona,
  messages: MatchMessage[]
): Promise<{ reply: string; isSimulated: boolean }> {
  try {
    const reply = await callMistralForReply(persona, messages);
    return { reply, isSimulated: false };
  } catch (err) {
    console.error("[getPersonaReply] Falling back to canned reply:", err);
    const fallback = FALLBACK_REPLIES[messages.length % FALLBACK_REPLIES.length];
    return { reply: fallback, isSimulated: true };
  }
}

async function callMistralForReply(persona: MatchPersona, messages: MatchMessage[]): Promise<string> {
  const result = await callMistral({
    model: "mistral-large-latest",
    temperature: 0.9,
    messages: [
      {
        role: "system",
        content:
          `You are roleplaying as a dating app match: ${persona.gender}, personality: ${persona.personality}. ` +
          "This is a practice mode for the real user to train their conversation skills. Stay fully in character, " +
          "keep replies short (1-3 sentences) like a real text conversation, and react naturally — reward good " +
          "energy and humor, and cool off on boring or low-effort messages, just like a real match would.",
      },
      ...messages.map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  const reply = result.choices[0]?.message.content;
  if (!reply) throw new Error("Empty reply from Mistral");
  return reply;
}

export async function scoreConversation(
  messages: MatchMessage[],
  contextSummary?: string
): Promise<{ score: number; feedback: string; isSimulated: boolean }> {
  try {
    const result = await callMistralForScore(messages, contextSummary);
    return { ...result, isSimulated: false };
  } catch (err) {
    console.error("[scoreConversation] Falling back to heuristic score:", err);
    return { ...heuristicScore(messages), isSimulated: true };
  }
}

async function callMistralForScore(
  messages: MatchMessage[],
  contextSummary?: string
): Promise<{ score: number; feedback: string }> {
  const schema = z.object({ score: z.number().min(0).max(100), feedback: z.string().min(10).max(400) });

  const response = await callMistralJson<unknown>({
    model: "mistral-large-latest",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You just finished roleplaying as a dating match in a practice conversation. Now switch roles: " +
          "score the human user's conversation skills 0-100 (humor, confidence, engagement, ability to keep " +
          "the conversation going) and give one short paragraph of specific, constructive feedback. If the " +
          "user's known context mentions a specific problem they're working on, connect your feedback to it " +
          "directly instead of giving generic advice. " +
          'Respond with ONLY JSON: { "score": number, "feedback": string }.',
      },
      {
        role: "user",
        content: [
          contextSummary && `What Flirtcraft already knows about this person:\n${contextSummary}`,
          messages.map((m) => `${m.role === "user" ? "User" : "Match"}: ${m.content}`).join("\n"),
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });

  return schema.parse(response);
}

function heuristicScore(messages: MatchMessage[]): { score: number; feedback: string } {
  const userMessages = messages.filter((m) => m.role === "user");
  const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / Math.max(1, userMessages.length);
  const score = Math.round(Math.min(95, 40 + userMessages.length * 4 + Math.min(20, avgLength / 4)));

  return {
    score,
    feedback:
      userMessages.length < 4
        ? "You wrapped up early — longer conversations give you more room to build rapport before asking for the date."
        : "Solid back-and-forth. Keep leaning into specific, curious follow-up questions to keep the energy up.",
  };
}
