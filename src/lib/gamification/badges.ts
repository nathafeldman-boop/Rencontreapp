export interface Badge {
  key: string;
  icon: string;
  label: string;
}

export interface BadgeInput {
  overallScore: number;
  photoScore: number;
  conversationScore: number;
  scoreDelta: number | null;
  planDaysDone: number;
  planDaysTotal: number;
  bioGenerationCount: number;
  simulatorSessionCount: number;
}

/**
 * Pure function — no DB access — so the criteria stay easy to read and
 * test in isolation. Callers (dashboard page) fetch the raw counts once
 * and pass them in.
 */
export function computeBadges(input: BadgeInput): Badge[] {
  const badges: Badge[] = [];

  if (input.photoScore >= 85) {
    badges.push({ key: "photo_master", icon: "📸", label: "Photo Master" });
  }
  if (input.conversationScore >= 85) {
    badges.push({ key: "conversation_expert", icon: "💬", label: "Conversation Expert" });
  }
  if (input.scoreDelta !== null && input.scoreDelta >= 10) {
    badges.push({ key: "profile_upgrade", icon: "🔥", label: `Profile Upgrade — +${input.scoreDelta} points` });
  }
  if (input.overallScore >= 80) {
    badges.push({ key: "rising_star", icon: "⭐", label: "Rising Star — top-tier score" });
  }
  if (input.planDaysTotal > 0 && input.planDaysDone === input.planDaysTotal) {
    badges.push({ key: "consistency", icon: "✅", label: "Consistency — full plan completed" });
  }
  if (input.bioGenerationCount >= 3) {
    badges.push({ key: "bio_wordsmith", icon: "✍️", label: "Bio Wordsmith" });
  }
  if (input.simulatorSessionCount >= 3) {
    badges.push({ key: "conversation_practice", icon: "🎯", label: "Conversation Practice" });
  }

  return badges;
}

export interface Level {
  name: string;
  min: number;
  max: number;
}

const LEVELS: Level[] = [
  { name: "Getting Started", min: 0, max: 40 },
  { name: "Improving", min: 41, max: 60 },
  { name: "Solid", min: 61, max: 75 },
  { name: "Strong", min: 76, max: 89 },
  { name: "Elite", min: 90, max: 100 },
];

export function getLevel(overallScore: number): Level {
  return LEVELS.find((l) => overallScore >= l.min && overallScore <= l.max) ?? LEVELS[0];
}

export function nextLevel(overallScore: number): Level | null {
  const currentIndex = LEVELS.findIndex((l) => overallScore >= l.min && overallScore <= l.max);
  return currentIndex >= 0 && currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
}
