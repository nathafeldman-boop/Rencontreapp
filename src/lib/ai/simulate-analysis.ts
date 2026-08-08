import type { Recommendation } from "@/types/database.types";

export interface AnalysisInput {
  /** Used to seed the deterministic RNG — same profile always scores the same. */
  seed: string;
  bio: string;
  photoCount: number;
  datingApp: string;
  /** Optional — folded into recommendation copy when available, for light personalization. */
  onboarding?: {
    objective?: string;
    biggestProblem?: string;
  };
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
 * MVP stand-in for the real Mistral-powered analysis (used whenever
 * MISTRAL_API_KEY is missing or the API call fails). No real language
 * understanding here — it's a deterministic heuristic, not an LLM — but the
 * calibration and voice follow the same "moteur d'analyse" rules as the real
 * prompt in analyze-profile.ts: harsh, honest, never inflated, and entirely
 * in French. Same input -> same output.
 *
 * Swap-out contract for the real pipeline: keep `AnalysisInput` as the
 * request shape and `AnalysisResult` as the response shape, and
 * `src/app/api/analyze/route.ts` doesn't need to change its calling code.
 */
export function simulateAnalysis(input: AnalysisInput): AnalysisResult {
  const rand = mulberry32(hashSeed(input.seed));

  const bio = input.bio.trim();
  const bioAnalysis = analyzeBioText(bio);
  const photoSignal = clamp(input.photoCount / 6, 0, 1); // 6 photos is the recommended max

  const bio_score = scoreFrom(rand, bioAnalysis.base, 8);
  const photo_score = scoreFrom(rand, 25 + photoSignal * 45, 12);
  const attractiveness_score = scoreFrom(rand, 40 + photoSignal * 25, 12);
  const conversation_score = scoreFrom(rand, bioAnalysis.base * 0.6 + photoSignal * 20, 10);

  const subscores = { photo_score, bio_score, attractiveness_score, conversation_score };
  const weakest = Math.min(photo_score, bio_score, attractiveness_score, conversation_score);
  const weightedAvg = photo_score * 0.35 + bio_score * 0.25 + attractiveness_score * 0.2 + conversation_score * 0.2;
  // A major weakness must drag the overall score down, not get averaged away.
  const weakLinkPenalty = weakest < 55 ? clamp((55 - weakest) * 0.5, 0, 22) : 0;
  const overall_score = Math.round(clamp(weightedAvg - weakLinkPenalty, 5, 98));

  const free_insights = buildFreeInsights({ subscores, rand });
  const recommendations = buildRecommendations({
    subscores,
    bioAnalysis,
    datingApp: input.datingApp,
    onboarding: input.onboarding,
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

interface BioAnalysis {
  /** Pre-jitter base score, already reflecting clichés/specificity/red flags. */
  base: number;
  isEmpty: boolean;
  isTooShort: boolean;
  genericHits: number;
  hasRedFlagTone: boolean;
}

const GENERIC_PHRASES = [
  "j'aime voyager",
  "profiter de la vie",
  "vivre l'instant présent",
  "sortir entre amis",
  "sortir avec mes amis",
  "sortir avec mes potes",
  "j'aime rire",
  "bonne humeur",
  "simple et naturel",
  "je suis quelqu'un de",
  "à l'écoute",
  "toujours partant",
  "ouvert d'esprit",
  "carpe diem",
  "bon vivant",
  "j'aime la vie",
  "vivre à fond",
];

const RED_FLAG_MARKERS = ["que du kiff", "pas sérieux", "pas de sérieux", "juste du fun", "no bullshit", "no bs"];

/**
 * Bucketed rather than purely additive — matches the calibration bands from
 * the spec directly (generic clichés -> 10-30, correct-but-plain -> 30-50,
 * specific/personal -> 60-75+) instead of an ad-hoc formula that can drift
 * away from those targets as penalties stack.
 */
function analyzeBioText(bio: string): BioAnalysis {
  const lower = bio.toLowerCase();
  const length = bio.length;
  const isEmpty = length === 0;
  const isTooShort = length > 0 && length < 25;

  const genericHits = GENERIC_PHRASES.reduce((count, phrase) => (lower.includes(phrase) ? count + 1 : count), 0);
  const hasRedFlagTone = RED_FLAG_MARKERS.some((marker) => lower.includes(marker));

  const emojiCount = [...bio.matchAll(/\p{Extended_Pictographic}/gu)].length;
  const hasMultipleSentences = (bio.match(/[.!?]/g) || []).length >= 2;
  const hasDigit = /\d/.test(bio);
  const wordCount = bio.split(/\s+/).filter(Boolean).length;

  let base: number;
  if (isEmpty) {
    base = 8;
  } else if (isTooShort) {
    base = 18;
  } else if (hasRedFlagTone) {
    base = 20;
  } else if (genericHits >= 2) {
    base = 18; // clichéd, no personality — matches the spec's own "generic bio" example
  } else if (genericHits === 1) {
    base = 32; // borderline generic
  } else {
    // No clichés detected — reward actual specificity instead of just the
    // absence of red flags, so a genuinely good bio can reach the 60-75 band.
    base = 45;
    if (hasMultipleSentences) base += 12;
    if (hasDigit) base += 6;
    if (wordCount >= 15) base += 8;
    if (length > 260) base -= 5; // rambling without structure reads worse, not better
  }

  const emojiPenalty = emojiCount > 3 ? clamp((emojiCount - 3) * 4, 0, 16) : 0;

  return { base: clamp(base - emojiPenalty, 5, 90), isEmpty, isTooShort, genericHits, hasRedFlagTone };
}

function scoreFrom(rand: () => number, base: number, jitterSpread: number) {
  const jitter = (rand() - 0.5) * jitterSpread * 2;
  return Math.round(clamp(base + jitter, 5, 98));
}

function buildFreeInsights({
  subscores,
  rand,
}: {
  subscores: { photo_score: number; bio_score: number; attractiveness_score: number; conversation_score: number };
  rand: () => number;
}): string[] {
  const insights: string[] = [];
  const { photo_score, bio_score } = subscores;

  insights.push(
    photo_score < 55
      ? `Ta photo principale est ton plus gros point faible (Photos : ${photo_score}/100) — elle te coûte des matchs avant même que quelqu'un lise ta bio.`
      : `Tes photos tiennent la route (${photo_score}/100) — la marge de progression est surtout dans la façon dont tu termines tes conversations.`
  );

  const secondPool =
    bio_score < 55
      ? [
          `Ta bio est générique (${bio_score}/100) — elle ne donne rien de précis auquel répondre.`,
          `Il n'y a aucune accroche claire à répondre dans ta bio (${bio_score}/100).`,
        ]
      : [
          `Ta bio a de la personnalité (${bio_score}/100) — quelques ajustements et elle convertira encore mieux.`,
          `Tu es à une phrase d'accroche près d'obtenir sensiblement plus de réponses.`,
        ];

  insights.push(secondPool[Math.floor(rand() * secondPool.length)]);

  return insights;
}

function buildRecommendations({
  subscores,
  bioAnalysis,
  datingApp,
  onboarding,
}: {
  subscores: { photo_score: number; bio_score: number; attractiveness_score: number; conversation_score: number };
  bioAnalysis: BioAnalysis;
  datingApp: string;
  onboarding?: { objective?: string; biggestProblem?: string };
}): Recommendation[] {
  const { photo_score, bio_score, attractiveness_score, conversation_score } = subscores;

  // Rank the three weakest dimensions — these become "Problème n°1/2/3".
  const ranked = (
    [
      { category: "photos" as const, score: photo_score, label: "Photos" },
      { category: "bio" as const, score: bio_score, label: "Bio" },
      { category: "photos" as const, score: attractiveness_score, label: "Attractivité" },
      { category: "conversation" as const, score: conversation_score, label: "Conversation" },
    ] satisfies { category: Recommendation["category"]; score: number; label: string }[]
  )
    .slice()
    .sort((a, b) => a.score - b.score);

  const recs: Recommendation[] = [];

  ranked.slice(0, 3).forEach((entry, i) => {
    recs.push(buildProblemRecommendation(i + 1, entry, bioAnalysis, datingApp));
  });

  recs.push({
    category: "photos",
    title: "Quick win",
    detail:
      photo_score < 55
        ? "Remplace ta photo principale par un plan solo, net, bien éclairé, où ton visage est clairement visible. C'est le changement le plus facile avec le plus d'impact immédiat sur ton taux de swipe."
        : "Réordonne tes photos pour mettre ta meilleure en premier — c'est le changement le plus simple à fort effet immédiat, souvent négligé.",
  });

  recs.push({
    category: bio_score < 55 ? "bio" : "conversation",
    title: "Biggest opportunity",
    detail:
      bio_score < 55
        ? `Réécris entièrement ta bio autour d'un détail précis et spécifique à toi, pas une liste de qualités. C'est le levier avec le plus gros potentiel d'impact sur ton profil actuel (Bio : ${bio_score}/100).`
        : `Ajoute une accroche ou une question en fin de bio pour donner aux utilisateurs de ${datingApp === "other" ? "l'app" : datingApp} un premier message facile à envoyer — c'est le levier au plus fort potentiel restant.`,
  });

  if (onboarding?.biggestProblem) {
    recs.push({
      category: "conversation",
      title: "Basé sur ce que tu as indiqué",
      detail: `Tu as signalé "${onboarding.biggestProblem}" comme ton plus gros problème actuel — c'est cohérent avec ce que montre ton profil, et c'est exactement ce que les recommandations ci-dessus adressent en priorité.`,
    });
  }

  return recs;
}

function buildProblemRecommendation(
  rank: number,
  entry: { category: Recommendation["category"]; score: number; label: string },
  bioAnalysis: BioAnalysis,
  datingApp: string
): Recommendation {
  const title = `Problème n°${rank} : ${entry.label} (${entry.score}/100)`;

  if (entry.label === "Bio") {
    let detail: string;
    if (bioAnalysis.isEmpty) {
      detail = "Ta bio est vide. Un profil sans bio se prive d'un canal entier de différenciation et de conversation — c'est un des freins les plus lourds à corriger.";
    } else if (bioAnalysis.isTooShort) {
      detail = "Ta bio est trop courte pour donner quoi que ce soit de concret à quelqu'un qui hésite à matcher. Vise au moins 2-3 phrases avec un détail spécifique et mémorable.";
    } else if (bioAnalysis.hasRedFlagTone) {
      detail = "Le ton de ta bio (désinvolte, orienté 'juste du fun') filtre une grande partie des profils sérieux et peut lire comme un manque d'effort plutôt que comme de l'authenticité.";
    } else if (bioAnalysis.genericHits > 0) {
      detail = `Ta bio contient des formulations qu'on retrouve sur des milliers d'autres profils ("j'aime voyager", "profiter de la vie"...). Rien ne te différencie ni ne donne de sujet de conversation précis.`;
    } else {
      detail = "Ta bio manque de spécificité — elle ne raconte rien d'assez précis ou mémorable pour donner envie de répondre en premier.";
    }
    return { category: "bio", title, detail };
  }

  if (entry.label === "Photos") {
    return {
      category: "photos",
      title,
      detail:
        entry.score < 55
          ? "Photo principale peu engageante, cadrage ou lumière faibles, ou trop de photos de groupe en premier — ça réduit ton taux de swipe avant même que ta bio soit lue."
          : "Tes photos sont correctes individuellement mais manquent de variété ou de cohérence d'ensemble (même contexte, même expression) — ça ne montre pas assez de facettes de ta personnalité.",
    };
  }

  if (entry.label === "Attractivité") {
    return {
      category: "photos",
      title,
      detail:
        "L'ensemble de tes photos ne met pas suffisamment en valeur ta présence — lumière, distance à l'objectif ou posture à retravailler pour que chaque photo serve réellement le profil.",
    };
  }

  return {
    category: "conversation",
    title,
    detail:
      entry.score < 55
        ? `La plupart des conversations meurent dans les 2 premiers messages sur ${datingApp === "other" ? "les apps de rencontre" : datingApp} quand le profil ne donne aucune accroche exploitable — c'est le cas ici.`
        : "Le potentiel de conversation est correct mais reste générique — rien dans le profil ne facilite un premier message spécifique plutôt qu'un 'salut ça va'.",
  };
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
