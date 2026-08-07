import type { Recommendation } from "@/types/database.types";

export interface AnalysisInput {
  /** Used to seed the deterministic RNG — same profile always scores the same. */
  seed: string;
  bio: string;
  photoCount: number;
  datingApp: string;
}

export interface AnalysisResult {
  overall_score: number;
  photo_score: number;
  bio_score: number;
  attractiveness_score: number;
  conversation_score: number;
  /** 1-2 short, ungated teasers shown on the free /results page. */
  free_insights: string[];
  /** Full breakdown — gated behind the paywall. */
  recommendations: Recommendation[];
}

/**
 * MVP stand-in for the real Mistral-powered analysis. Deterministic (same
 * input -> same output) and lightly informed by the actual profile (bio
 * length, photo count) so it *feels* like a real read rather than pure
 * noise — but there is no AI call here.
 *
 * Swap-out contract for the real pipeline: keep `AnalysisInput` as the
 * request shape and `AnalysisResult` as the response shape, and
 * `src/app/api/analyze/route.ts` doesn't need to change its calling code.
 */
export function simulateAnalysis(input: AnalysisInput): AnalysisResult {
  const rand = mulberry32(hashSeed(input.seed));

  const bioLength = input.bio.trim().length;
  const bioSignal = clamp(bioLength / 140, 0, 1); // ~140 chars reads as a "complete" bio
  const photoSignal = clamp(input.photoCount / 6, 0, 1); // 6 photos is the recommended max

  const bio_score = scoreFrom(rand, 35 + bioSignal * 45);
  const photo_score = scoreFrom(rand, 30 + photoSignal * 50);
  const attractiveness_score = scoreFrom(rand, 45 + photoSignal * 30);
  const conversation_score = scoreFrom(rand, 30 + bioSignal * 35 + photoSignal * 15);

  const overall_score = Math.round(
    photo_score * 0.35 + bio_score * 0.25 + attractiveness_score * 0.2 + conversation_score * 0.2
  );

  const free_insights = buildFreeInsights({ photo_score, bio_score, rand });
  const recommendations = buildRecommendations({
    photo_score,
    bio_score,
    attractiveness_score,
    conversation_score,
    datingApp: input.datingApp,
  });

  return {
    overall_score,
    photo_score,
    bio_score,
    attractiveness_score,
    conversation_score,
    free_insights,
    recommendations,
  };
}

function scoreFrom(rand: () => number, base: number) {
  const jitter = (rand() - 0.5) * 20; // +/-10 points of noise
  return Math.round(clamp(base + jitter, 12, 97));
}

function buildFreeInsights({
  photo_score,
  bio_score,
  rand,
}: {
  photo_score: number;
  bio_score: number;
  rand: () => number;
}): string[] {
  const insights: string[] = [];

  insights.push(
    photo_score < 60
      ? "Your first photo is your biggest weakness — it's costing you swipes before anyone reads your bio."
      : "Your photos are pulling their weight — the bigger opportunity is in how you close conversations."
  );

  const secondPool =
    bio_score < 60
      ? [
          "Your bio reads generic — it doesn't give people anything specific to reply to.",
          "There's no clear conversation starter in your bio right now.",
        ]
      : [
          "Your bio has personality — a few tweaks would make it convert even better.",
          "You're one strong opening line away from noticeably more replies.",
        ];

  insights.push(secondPool[Math.floor(rand() * secondPool.length)]);

  return insights;
}

function buildRecommendations({
  photo_score,
  bio_score,
  attractiveness_score,
  conversation_score,
  datingApp,
}: {
  photo_score: number;
  bio_score: number;
  attractiveness_score: number;
  conversation_score: number;
  datingApp: string;
}): Recommendation[] {
  const recs: Recommendation[] = [];

  recs.push({
    category: "photos",
    title:
      photo_score < 60
        ? "Replace your main photo with a solo, well-lit shot"
        : "Reorder your photos to lead with your strongest social proof",
    detail:
      photo_score < 60
        ? "Group photos and low light as the first image reduce swipe-right rate. A clear, smiling, solo photo as photo #1 consistently outperforms."
        : "Your best photo isn't in the #1 slot — moving it up is the single highest-leverage change you can make right now.",
  });

  recs.push({
    category: "photos",
    title: "Add one photo that shows a hobby or interest",
    detail:
      "Profiles with at least one activity photo (sport, travel, creative hobby) give matches something concrete to open a conversation with.",
  });

  recs.push({
    category: "bio",
    title: bio_score < 60 ? "Rewrite your bio around one specific story" : "Add a light call-to-action to your bio",
    detail:
      bio_score < 60
        ? "Generic bios ('love to travel, laugh a lot') blend in. One specific, slightly odd detail about you is far more memorable and easy to reply to."
        : `Ending your bio with a soft prompt (a question, a debate starter) gives ${datingApp === "other" ? "matches" : datingApp} users an easy first message to send.`,
  });

  recs.push({
    category: "conversation",
    title: conversation_score < 60 ? "Use 3 ready-made opening lines tailored to your profile" : "Fix your reply timing",
    detail:
      conversation_score < 60
        ? "Most conversations die in the first 2 messages. We generate openers based on your actual bio and photos so they don't sound copy-pasted."
        : "Your openers are fine — matches are going cold because of response timing. We'll show you a simple cadence that keeps conversations alive.",
  });

  recs.push({
    category: "photos",
    title: attractiveness_score < 60 ? "Improve lighting and camera distance" : "Test a seasonal outfit change",
    detail:
      attractiveness_score < 60
        ? "Natural daylight and a slight distance from the camera (not a close-up selfie) measurably improve how attractive a photo reads."
        : "Small styling changes every few weeks keep your profile feeling current without needing new photoshoots.",
  });

  return recs;
}

/** xmur3-style string hash -> 32-bit seed. */
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — deterministic, fast, good enough for UI-facing "randomness". */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
