import { z } from "zod";

import { callMistralJson } from "@/lib/ai/mistral";
import type { PlanDay, Recommendation } from "@/types/database.types";

interface GeneratePlanInput {
  scores: { photo: number; bio: number; attractiveness: number; conversation: number };
  recommendations: Recommendation[];
  biggestProblem?: string;
  objective?: string;
}

const FALLBACK_DAYS: Omit<PlanDay, "done">[] = [
  { day: 1, title: "Améliore ta photo principale", description: "Mets ta photo la mieux notée en première position." },
  { day: 2, title: "Réécris ta bio", description: "Utilise le Bio Generator pour essayer un style que tu n'as pas encore testé." },
  { day: 3, title: "Fais le tri dans tes photos", description: "Lance \"Construire mon meilleur profil\" et retire ta photo la plus faible." },
  { day: 4, title: "Entraîne-toi sur ton accroche", description: "Fais une session dans le Simulateur de match centrée sur ton premier message." },
  { day: 5, title: "Teste de nouvelles relances", description: "Utilise le Coach de conversation sur une vraie conversation qui stagne." },
  { day: 6, title: "Revérifie ton score d'attractivité", description: "Ajoute ou réordonne une photo qui te montre dans un contexte social." },
  { day: 7, title: "Relance ton analyse complète", description: "Regarde de combien ton score a bougé cette semaine." },
];

export async function generateDatingPlan(input: GeneratePlanInput): Promise<{ days: PlanDay[]; isSimulated: boolean }> {
  try {
    const days = await generateWithMistral(input);
    return { days, isSimulated: false };
  } catch (err) {
    console.error("[generateDatingPlan] Falling back to template plan:", err);
    return { days: FALLBACK_DAYS.map((d) => ({ ...d, done: false })), isSimulated: true };
  }
}

async function generateWithMistral(input: GeneratePlanInput): Promise<PlanDay[]> {
  const schema = z.object({
    days: z
      .array(z.object({ day: z.number().int().min(1).max(7), title: z.string().max(80), description: z.string().max(200) }))
      .length(7),
  });

  const weakest = Object.entries(input.scores).sort((a, b) => a[1] - b[1])[0];

  const response = await callMistralJson<unknown>({
    model: "mistral-large-latest",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content:
          "You are a dating coach building a 7-day action plan for a Flirtcraft user. Each day is one small, " +
          "concrete, doable action (not vague advice) that uses Flirtcraft's own tools (Photo Optimizer, Bio " +
          "Generator, Conversation Coach, Match Simulator) where relevant. Build momentum: easiest wins first. " +
          'Respond with ONLY JSON: { "days": [{ "day": 1-7, "title", "description" }] } (exactly 7 items). ' +
          "Every title and description must be written in French (français), never in English, regardless of " +
          "what language these instructions are written in.",
      },
      {
        role: "user",
        content:
          `Scores — photos: ${input.scores.photo}, bio: ${input.scores.bio}, attractiveness: ${input.scores.attractiveness}, conversation: ${input.scores.conversation}. ` +
          `Weakest area: ${weakest[0]}. ` +
          (input.objective ? `Main objective: ${input.objective}. ` : "") +
          (input.biggestProblem ? `Self-reported biggest problem: ${input.biggestProblem}. ` : "") +
          `Known recommendations: ${input.recommendations.map((r) => r.title).join("; ")}`,
      },
    ],
  });

  return schema.parse(response).days.map((d) => ({ ...d, done: false }));
}
