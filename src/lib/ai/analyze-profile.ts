import { z } from "zod";

import { callMistralJson } from "@/lib/ai/mistral";
import { simulateAnalysis } from "@/lib/ai/simulate-analysis";
import type { Recommendation } from "@/types/database.types";

export interface PhotoAnalysisResult {
  photo_path: string;
  position: number;
  score: number;
  confidence_score: number;
  attractiveness_score: number;
  technical_score: number;
  pros: string[];
  cons: string[];
  recommendation: string;
  suggested_role: "primary" | "secondary" | "remove";
}

export interface ProfileAnalysisResult {
  overall_score: number;
  photo_score: number;
  bio_score: number;
  attractiveness_score: number;
  conversation_score: number;
  free_insights: string[];
  recommendations: Recommendation[];
  photoAnalyses: PhotoAnalysisResult[];
  isSimulated: boolean;
}

export interface AnalyzeProfileInput {
  seed: string;
  bio: string;
  datingApp: string;
  photos: { path: string; signedUrl: string }[];
  onboarding: {
    objective?: string;
    weeklyMatches?: string;
    biggestProblem?: string;
    confidence?: string;
  };
}

const scoreSchema = z.number().min(0).max(100);

const mistralPhotoSchema = z.object({
  index: z.number().int().min(0),
  score: scoreSchema,
  confidence_score: scoreSchema,
  attractiveness_score: scoreSchema,
  technical_score: scoreSchema,
  pros: z.array(z.string()).max(4),
  cons: z.array(z.string()).max(4),
  recommendation: z.string(),
  suggested_role: z.enum(["primary", "secondary", "remove"]),
});

const mistralResponseSchema = z.object({
  overall_score: scoreSchema,
  photo_score: scoreSchema,
  bio_score: scoreSchema,
  attractiveness_score: scoreSchema,
  conversation_score: scoreSchema,
  free_insights: z.array(z.string()).min(1).max(3),
  recommendations: z
    .array(z.object({ category: z.enum(["photos", "bio", "conversation"]), title: z.string(), detail: z.string() }))
    .min(3)
    .max(8),
  bio_rewrite: z.string(),
  photos: z.array(mistralPhotoSchema),
});

/**
 * Real profile analysis via Mistral's vision-capable model. Falls back to
 * the deterministic simulation (see simulate-analysis.ts) on any failure —
 * missing API key, network error, or a response that doesn't match the
 * expected schema — so the product keeps working end to end. Callers get
 * `isSimulated` back and should persist it verbatim on the `analyses` row.
 */
export async function analyzeProfile(input: AnalyzeProfileInput): Promise<ProfileAnalysisResult> {
  try {
    return await analyzeWithMistral(input);
  } catch (err) {
    console.error("[analyzeProfile] Falling back to simulated analysis:", err);
    return simulatedFallback(input);
  }
}

async function analyzeWithMistral(input: AnalyzeProfileInput): Promise<ProfileAnalysisResult> {
  if (input.photos.length === 0) {
    throw new Error("No photos to analyze");
  }

  const onboardingSummary = [
    input.onboarding.objective && `Main objective: ${input.onboarding.objective}`,
    input.onboarding.weeklyMatches && `Current weekly matches: ${input.onboarding.weeklyMatches}`,
    input.onboarding.biggestProblem && `Biggest self-reported problem: ${input.onboarding.biggestProblem}`,
    input.onboarding.confidence && `Self-rated confidence: ${input.onboarding.confidence}`,
  ]
    .filter(Boolean)
    .join("\n");

  const photoLabels = input.photos.map((_, i) => `Photo ${i} follows:`);

  const response = await callMistralJson<unknown>({
    model: "pixtral-large-latest",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "You are MatchAI's dating profile coach. Analyze the user's dating app profile (bio + photos) " +
          "and respond with ONLY a JSON object matching this exact schema: " +
          "{ overall_score, photo_score, bio_score, attractiveness_score, conversation_score (all 0-100 ints), " +
          "free_insights (1-2 short strings), " +
          "recommendations (array of 4-6 { category: 'photos'|'bio'|'conversation', title, detail }), " +
          "bio_rewrite (a rewritten, improved version of the bio), " +
          "photos (array, one entry per input photo, in the same order, each " +
          "{ index (0-based, matching input order), score, confidence_score, attractiveness_score, " +
          "technical_score (all 0-100 ints), pros (max 3 short strings), cons (max 3 short strings), " +
          "recommendation (one actionable sentence), suggested_role: 'primary'|'secondary'|'remove' } ). " +
          "Be honest and specific, not generic. Exactly one photo should be 'primary'.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Dating app: ${input.datingApp}\nBio: "${input.bio || "(empty)"}"\n${onboardingSummary}\n\n${input.photos.length} photos follow, in order.`,
          },
          ...input.photos.flatMap((photo, i) => [
            { type: "text" as const, text: photoLabels[i] },
            { type: "image_url" as const, image_url: photo.signedUrl },
          ]),
        ],
      },
    ],
  });

  const parsed = mistralResponseSchema.parse(response);

  const recommendations: Recommendation[] = [
    ...parsed.recommendations,
    { category: "bio", title: "Try this bio instead", detail: parsed.bio_rewrite },
  ];

  const photoAnalyses: PhotoAnalysisResult[] = parsed.photos.map((p) => ({
    photo_path: input.photos[p.index]?.path ?? input.photos[0].path,
    position: p.index,
    score: p.score,
    confidence_score: p.confidence_score,
    attractiveness_score: p.attractiveness_score,
    technical_score: p.technical_score,
    pros: p.pros,
    cons: p.cons,
    recommendation: p.recommendation,
    suggested_role: p.suggested_role,
  }));

  return {
    overall_score: parsed.overall_score,
    photo_score: parsed.photo_score,
    bio_score: parsed.bio_score,
    attractiveness_score: parsed.attractiveness_score,
    conversation_score: parsed.conversation_score,
    free_insights: parsed.free_insights,
    recommendations,
    photoAnalyses,
    isSimulated: false,
  };
}

function simulatedFallback(input: AnalyzeProfileInput): ProfileAnalysisResult {
  const result = simulateAnalysis({
    seed: input.seed,
    bio: input.bio,
    photoCount: input.photos.length,
    datingApp: input.datingApp,
  });

  const photoAnalyses: PhotoAnalysisResult[] = input.photos.map((photo, i) => ({
    photo_path: photo.path,
    position: i,
    score: Math.max(20, result.photo_score + (i === 0 ? 8 : -4 * i)),
    confidence_score: result.attractiveness_score,
    attractiveness_score: result.attractiveness_score,
    technical_score: result.photo_score,
    pros: i === 0 ? ["Clear, well-framed shot"] : ["Adds variety to your profile"],
    cons: i === 0 ? [] : ["Could be replaced with a stronger shot"],
    recommendation: i === 0 ? "Keep this as your lead photo." : "Consider whether this photo earns its slot.",
    suggested_role: i === 0 ? "primary" : i < 3 ? "secondary" : "remove",
  }));

  return { ...result, photoAnalyses, isSimulated: true };
}
