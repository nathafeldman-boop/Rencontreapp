import { z } from "zod";

import { callMistralJson } from "@/lib/ai/mistral";
import type { BioStyle } from "@/types/database.types";

const STYLE_PROMPT: Record<BioStyle, string> = {
  funny: "playful and genuinely funny, with a light self-deprecating joke",
  mysterious: "intriguing and a little mysterious, leaves the reader curious",
  confident: "confident and direct, no hedging language",
  romantic: "warm and romantic, signals looking for something real",
  premium: "polished and aspirational, like a well-traveled, high-achieving person",
};

const FALLBACK_TEMPLATES: Record<BioStyle, string[]> = {
  funny: [
    "Professional dog-petter, amateur chef (ask me about the great risotto incident).",
    "Warning: will make you laugh at inconvenient times, like the third date.",
    "Currently accepting applications for someone to judge my questionable karaoke choices.",
    "I peaked at mini-golf in 2019 and I'm still riding that high.",
    "Looking for someone who thinks my puns are a feature, not a bug.",
  ],
  mysterious: [
    "Ask me about the trip that changed everything. I'll only tell you in person.",
    "Three truths and a very good lie — you find out which is which.",
    "I collect stories more than things. Want to be one?",
    "Not everything's on the profile. Some things are better discovered.",
    "There's a reason my friends call me the wildcard. I'll let you find out why.",
  ],
  confident: [
    "I know what I want, and I'm not afraid to go get it — that includes this.",
    "Direct, ambitious, and looking for someone who matches that energy.",
    "I don't do small talk well. Let's skip to the interesting part.",
    "Building something I'm proud of. Looking for someone building the same.",
    "I show up for the people I care about. Consistently. That's the whole pitch.",
  ],
  romantic: [
    "Believer in slow mornings, long dinners, and finding someone worth both.",
    "Looking for the kind of person you plan a future around, not just a weekend.",
    "Still believe in the big romantic gesture. Just need the right reason for one.",
    "Good conversation, better company — building toward something real.",
    "Not looking for perfect. Looking for someone worth the effort.",
  ],
  premium: [
    "Building a life I'm proud of — good work, good people, good stories to tell.",
    "Equal parts ambition and adventure. Looking for a partner in both.",
    "High standards, low drama. Let's see if we're a match.",
    "Passport's getting full. Looking for someone to fill the next page with.",
    "Curated life, open calendar. Let's find time for something good.",
  ],
};

interface GenerateBiosInput {
  sourceBio: string;
  style: BioStyle;
  datingApp: string;
  /** From lib/ai/user-context.ts — objective, biggest problem, etc. Optional so this still works standalone. */
  contextSummary?: string;
}

export async function generateBios(input: GenerateBiosInput): Promise<{ bios: string[]; isSimulated: boolean }> {
  try {
    const bios = await generateWithMistral(input);
    return { bios, isSimulated: false };
  } catch (err) {
    console.error("[generateBios] Falling back to templates:", err);
    return { bios: FALLBACK_TEMPLATES[input.style], isSimulated: true };
  }
}

async function generateWithMistral({ sourceBio, style, datingApp, contextSummary }: GenerateBiosInput): Promise<string[]> {
  const schema = z.object({ bios: z.array(z.string().min(10).max(300)).length(5) });

  const response = await callMistralJson<unknown>({
    model: "mistral-large-latest",
    temperature: 0.9,
    messages: [
      {
        role: "system",
        content:
          `You write ${datingApp} dating profile bios. Tone: ${STYLE_PROMPT[style]}. ` +
          "Each bio must be under 300 characters, specific rather than generic, and end with something " +
          "easy to reply to. If the user's context mentions a specific problem (e.g. conversations dying, " +
          "not enough matches), lean the bio toward fixing that specifically. Respond with ONLY JSON: " +
          '{ "bios": [5 distinct bio strings] }.',
      },
      {
        role: "user",
        content: [
          contextSummary && `What Flirtcraft already knows about this person:\n${contextSummary}`,
          sourceBio
            ? `Write 5 new bios inspired by this person's current bio (keep any real, specific details): "${sourceBio}"`
            : "Write 5 bios for someone who hasn't shared much about themselves yet — keep them broadly appealing but not generic.",
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });

  return schema.parse(response).bios;
}
