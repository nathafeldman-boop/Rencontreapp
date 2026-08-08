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
  { day: 1, title: "Upgrade your main photo", description: "Swap in your highest-scoring photo as your lead image." },
  { day: 2, title: "Rewrite your bio", description: "Use the Bio Generator to try a style you haven't used before." },
  { day: 3, title: "Clean up your photo lineup", description: "Run \"Build my best profile\" and remove your weakest photo." },
  { day: 4, title: "Practice your opener", description: "Run one session in the Match Simulator focused on your first message." },
  { day: 5, title: "Test new conversation starters", description: "Use the Conversation Coach on a real stalled conversation." },
  { day: 6, title: "Re-check your attractiveness score", description: "Add or reorder a photo that shows you in a social setting." },
  { day: 7, title: "Re-run your full analysis", description: "See how much your score moved this week." },
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
          'Respond with ONLY JSON: { "days": [{ "day": 1-7, "title", "description" }] } (exactly 7 items).',
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
