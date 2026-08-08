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
