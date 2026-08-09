import { z } from "zod";

import { callMistralJson } from "@/lib/ai/mistral";
import { lenientString } from "@/lib/ai/lenient-string";
import { HINGE_PROMPT_OPTIONS, type ProfilePrompt } from "@/lib/profile-prompts";
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
    "Caresseur de chiens professionnel, cuisinier amateur (demande-moi l'histoire du risotto raté).",
    "Attention : je te ferai rire à des moments inopportuns, genre au troisième rendez-vous.",
    "J'accepte les candidatures pour juger mes choix de karaoké discutables.",
    "J'ai atteint mon pic au mini-golf en 2019 et je vis encore sur cette gloire.",
    "Je cherche quelqu'un qui trouve mes jeux de mots charmants et pas juste fatigants.",
  ],
  mysterious: [
    "Demande-moi le voyage qui a tout changé. Je ne le raconte qu'en personne.",
    "Trois vérités et un très bon mensonge — à toi de deviner lesquels.",
    "Je collectionne les histoires plus que les objets. Tu veux en devenir une ?",
    "Tout n'est pas sur le profil. Certaines choses se découvrent mieux en vrai.",
    "Si mes amis m'appellent l'imprévisible, il y a une raison. Je te laisse la découvrir.",
  ],
  confident: [
    "Je sais ce que je veux, et je n'ai pas peur d'aller le chercher — toi y compris.",
    "Direct, ambitieux, et je cherche quelqu'un avec la même énergie.",
    "Les banalités, très peu pour moi. Passons directement à ce qui est intéressant.",
    "Je construis quelque chose dont je suis fier. Je cherche quelqu'un qui fait pareil.",
    "Je suis présent pour les gens qui comptent pour moi. Toujours. C'est tout mon argument.",
  ],
  romantic: [
    "Croyant des matins tranquilles, des longs dîners, et de trouver quelqu'un qui les mérite.",
    "Je cherche le genre de personne pour qui on planifie un avenir, pas juste un week-end.",
    "Je crois encore aux grands gestes romantiques. Il me faut juste la bonne raison d'en faire un.",
    "Bonne conversation, meilleure compagnie — je construis vers quelque chose de vrai.",
    "Je ne cherche pas la perfection. Je cherche quelqu'un qui mérite l'effort.",
  ],
  premium: [
    "Je construis une vie dont je suis fier — du bon travail, des gens bien, de belles histoires à raconter.",
    "Moitié ambition, moitié aventure. Je cherche un partenaire pour les deux.",
    "Standards élevés, zéro drame. Voyons si on matche.",
    "Mon passeport se remplit. Je cherche quelqu'un pour en écrire la prochaine page.",
    "Vie organisée, agenda ouvert. Trouvons du temps pour quelque chose de bien.",
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
  // Truncate instead of reject on an overlong bio (see lenient-string.ts),
  // and tolerate 3-5 bios instead of requiring exactly 5 — a single overlong
  // or missing bio used to throw out all 5 otherwise-good ones.
  const schema = z.object({ bios: z.array(lenientString(300, 10)).min(3).max(5) });

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
          '{ "bios": [5 distinct bio strings] }. Every bio must be written in French (français), never in ' +
          "English, regardless of what language these instructions are written in.",
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

const PROMPT_FALLBACK: ProfilePrompt[] = [
  { prompt: "Un fait peu connu sur moi…", answer: "Je peux réciter le générique d'une série entière par cœur, ne me lance pas là-dessus." },
  { prompt: "Mon rencard idéal…", answer: "Un truc simple où on peut vraiment parler — brunch, balade, peu importe tant que la conversation coule." },
  { prompt: "Je cherche quelqu'un qui…", answer: "Sait rire de tout, même de lui-même, et qui n'a pas peur de proposer un vrai rendez-vous." },
];

interface GeneratePromptAnswersInput {
  sourceBio: string;
  datingApp: string;
  contextSummary?: string;
}

/**
 * Hinge-specific: generates 3 prompt+answer cards instead of a free-text
 * bio. Reuses the same fallback-on-failure pattern as generateBios.
 */
export async function generatePromptAnswers(
  input: GeneratePromptAnswersInput
): Promise<{ answers: ProfilePrompt[]; isSimulated: boolean }> {
  try {
    const answers = await generatePromptAnswersWithMistral(input);
    return { answers, isSimulated: false };
  } catch (err) {
    console.error("[generatePromptAnswers] Falling back to templates:", err);
    return { answers: PROMPT_FALLBACK, isSimulated: true };
  }
}

async function generatePromptAnswersWithMistral({
  sourceBio,
  datingApp,
  contextSummary,
}: GeneratePromptAnswersInput): Promise<ProfilePrompt[]> {
  // min(2) rather than a hard length(3) — an otherwise-good response with
  // 2 solid answers shouldn't be thrown away over a missing third (same
  // reasoning as the conversation coach's suggestions schema). `answer`
  // truncates instead of rejecting on overflow (see lenient-string.ts).
  const schema = z.object({
    answers: z
      .array(z.object({ prompt: z.string().min(1), answer: lenientString(150, 3) }))
      .min(2)
      .max(3),
  });

  const response = await callMistralJson<unknown>({
    model: "mistral-large-latest",
    temperature: 0.9,
    messages: [
      {
        role: "system",
        content:
          `You write ${datingApp} dating profile prompt answers, in the exact style of Hinge's prompt/answer ` +
          "format (this person's app uses prompts instead of a single free-text bio). Pick exactly 3 prompts " +
          "from this list that best fit the person (vary them — don't pick 3 similar ones): " +
          `${HINGE_PROMPT_OPTIONS.join(" | ")}. ` +
          "Write one short, specific, punchy answer per prompt (under 150 characters each) — never generic, " +
          "never a full sentence restating the prompt. If the user's context mentions a specific problem " +
          "(e.g. conversations dying, not enough matches), let it inform tone but never state it outright. " +
          'Respond with ONLY JSON: { "answers": [{ "prompt": one of the prompts above verbatim, "answer" }] } ' +
          "(exactly 3 items). Every prompt and answer must be written in French (français), never in English, " +
          "regardless of what language these instructions are written in.",
      },
      {
        role: "user",
        content: [
          contextSummary && `What Flirtcraft already knows about this person:\n${contextSummary}`,
          sourceBio
            ? `This person's current bio/notes (use any real, specific details, ignore the free-text format): "${sourceBio}"`
            : "This person hasn't shared much about themselves yet — keep answers broadly appealing but not generic.",
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });

  return schema.parse(response).answers;
}
