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

export interface ConversationScoreResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  whatYouCouldHaveDone: string;
  bestPossibleReply: string;
}

export async function scoreConversation(
  messages: MatchMessage[],
  contextSummary?: string
): Promise<ConversationScoreResult & { isSimulated: boolean }> {
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
): Promise<ConversationScoreResult> {
  const schema = z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string().min(1).max(160)).min(1).max(4),
    weaknesses: z.array(z.string().min(1).max(160)).min(1).max(4),
    what_you_could_have_done: z.string().min(10).max(300),
    best_possible_reply: z.string().min(1).max(300),
  });

  const response = await callMistralJson<unknown>({
    model: "mistral-large-latest",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You just finished roleplaying as a dating match in a practice conversation. Now switch roles: " +
          "score the human user's conversation skills 0-100 (humor, confidence, engagement, ability to keep " +
          "the conversation going). Be honest, not just encouraging — a mediocre conversation should score " +
          "accordingly. If the user's known context mentions a specific problem they're working on, connect " +
          "your feedback to it directly instead of giving generic advice. " +
          'Respond with ONLY JSON: { "score": number, "strengths": string[] (1-3 short, specific things they ' +
          'did well), "weaknesses": string[] (1-3 short, specific things that held the conversation back), ' +
          '"what_you_could_have_done": string (one concrete alternative approach for the weakest moment), ' +
          '"best_possible_reply": string (the single best reply they could have sent at their last message, ' +
          "written exactly as they'd type it) }.",
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

  const parsed = schema.parse(response);
  return {
    score: parsed.score,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    whatYouCouldHaveDone: parsed.what_you_could_have_done,
    bestPossibleReply: parsed.best_possible_reply,
  };
}

function heuristicScore(messages: MatchMessage[]): ConversationScoreResult {
  const userMessages = messages.filter((m) => m.role === "user");
  const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / Math.max(1, userMessages.length);
  const score = Math.round(Math.min(95, 40 + userMessages.length * 4 + Math.min(20, avgLength / 4)));
  const lastUserMessage = userMessages[userMessages.length - 1]?.content ?? "";

  return {
    score,
    strengths:
      userMessages.length >= 4
        ? ["Tu as maintenu un vrai échange plutôt qu'une conversation à sens unique."]
        : ["Tu as osé lancer la conversation."],
    weaknesses:
      userMessages.length < 4
        ? ["La conversation s'est arrêtée tôt — moins de place pour créer une vraie connexion avant de proposer un rendez-vous."]
        : ["Certaines relances restent un peu génériques plutôt que de rebondir sur un détail précis dit par ton match."],
    whatYouCouldHaveDone:
      userMessages.length < 4
        ? "Pose une question ouverte sur un détail précis de sa réponse précédente pour prolonger l'échange avant de conclure."
        : "Rebondis sur un détail spécifique que ton match a mentionné plutôt que de poser une question générique.",
    bestPossibleReply: lastUserMessage
      ? "Essaie une relance qui reprend un mot précis de sa dernière réponse plutôt qu'une question fermée."
      : "Envoie une accroche qui réagit à quelque chose de concret dans son profil plutôt qu'un simple \"salut\".",
  };
}
