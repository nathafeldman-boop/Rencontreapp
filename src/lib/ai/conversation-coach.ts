import { z } from "zod";

import { callMistralJson } from "@/lib/ai/mistral";
import type { ConversationSuggestion, CoachMode } from "@/types/database.types";

const MODE_PROMPT: Record<Exclude<CoachMode, "auto">, string> = {
  flirt: "flirty and openly interested — confident attraction, not shy about it",
  funny: "genuinely funny — a joke or playful bit, not just '😂'",
  natural: "natural and low-key — easy, unforced, like texting a friend",
  confident: "confident and direct — no hedging, no over-explaining",
};

/** CoachMode names the UI choice ("Flirt"); ConversationSuggestion.tone is the older adjective form ("flirty"). */
const MODE_TO_TONE: Record<Exclude<CoachMode, "auto">, ConversationSuggestion["tone"]> = {
  flirt: "flirty",
  funny: "funny",
  natural: "natural",
  confident: "confident",
};

const FALLBACK: Record<CoachMode, ConversationSuggestion[]> = {
  auto: [
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
  ],
  flirt: [
    {
      tone: "flirty",
      message: "Careful, keep talking like that and I'll have to ask for your number.",
      explanation: "Direct but playful — signals interest without being heavy.",
    },
    {
      tone: "flirty",
      message: "I was doing fine until you sent that. Now I'm distracted.",
      explanation: "Flattery with a light, confident delivery invites more of the same energy back.",
    },
    {
      tone: "flirty",
      message: "Okay, that's officially the best part of my day so far.",
      explanation: "Warm and specific enough to feel genuine rather than a stock line.",
    },
  ],
  funny: [
    {
      tone: "funny",
      message: "I'm contractually obligated to say something charming here, give me a second.",
      explanation: "Self-aware humor is low-risk and almost always lands.",
    },
    {
      tone: "funny",
      message: "Okay but is this a green flag or are we speedrunning a red one, I need to know now.",
      explanation: "Playful and current — invites a joke back rather than a one-word reply.",
    },
    {
      tone: "funny",
      message: "Noted for the record: you're funnier than my last three matches combined.",
      explanation: "Compliment wrapped in a joke — light enough to not feel intense.",
    },
  ],
  natural: [
    {
      tone: "natural",
      message: "Haha okay, I wasn't expecting that answer.",
      explanation: "Simple and genuine — keeps things moving without trying too hard.",
    },
    {
      tone: "natural",
      message: "Wait, tell me more about that.",
      explanation: "Easy, curious follow-up that hands the conversation back naturally.",
    },
    {
      tone: "natural",
      message: "That's actually a really good point, hadn't thought about it that way.",
      explanation: "Low-key and conversational, like texting a friend.",
    },
  ],
  confident: [
    {
      tone: "confident",
      message: "I like where this is going. Let's grab a drink and keep it going in person.",
      explanation: "Direct ask, no hedging — confidence reads well over text.",
    },
    {
      tone: "confident",
      message: "I don't usually say this early, but I think we'd get along well.",
      explanation: "Assured statement of interest without over-explaining.",
    },
    {
      tone: "confident",
      message: "You seem like you don't waste time. Same. What are you doing Friday?",
      explanation: "Matches directness with directness — filters for someone who appreciates it.",
    },
  ],
};

export async function getConversationSuggestions(
  conversationText: string,
  mode: CoachMode = "auto",
  contextSummary?: string
): Promise<{ suggestions: ConversationSuggestion[]; isSimulated: boolean }> {
  try {
    const suggestions = await callMistralForSuggestions(conversationText, mode, contextSummary);
    return { suggestions, isSimulated: false };
  } catch (err) {
    console.error("[getConversationSuggestions] Falling back to templates:", err);
    return { suggestions: FALLBACK[mode], isSimulated: true };
  }
}

async function callMistralForSuggestions(
  conversationText: string,
  mode: CoachMode,
  contextSummary?: string
): Promise<ConversationSuggestion[]> {
  const toneEnum = mode === "auto" ? (["funny", "flirty", "natural"] as const) : ([MODE_TO_TONE[mode]] as const);
  const schema = z.object({
    suggestions: z
      .array(
        z.object({
          tone: z.enum(toneEnum),
          message: z.string().min(3).max(300),
          explanation: z.string().min(10).max(300),
        })
      )
      .length(3),
  });

  const instructions =
    mode === "auto"
      ? "Suggest exactly 3 replies the user could send next: one funny, one flirty, one natural/low-key."
      : `Suggest exactly 3 different reply options, all in this style: ${MODE_PROMPT[mode]}. ` +
        `Vary the wording/approach between the 3, but keep every one of them tagged "tone": "${MODE_TO_TONE[mode]}".`;

  const response = await callMistralJson<unknown>({
    model: "mistral-large-latest",
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content:
          "You are a dating conversation coach. Given a pasted conversation (most recent message last), " +
          `${instructions} Each needs a short explanation of why it works. Respond with ONLY JSON matching ` +
          '{ "suggestions": [{ "tone", "message", "explanation" }] } (exactly 3 items).',
      },
      {
        role: "user",
        content: [
          contextSummary && `What Flirtcraft already knows about this person:\n${contextSummary}`,
          `Conversation so far:\n${conversationText}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });

  return schema.parse(response).suggestions;
}
