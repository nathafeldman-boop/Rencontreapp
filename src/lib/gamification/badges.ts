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
    badges.push({ key: "photo_master", icon: "📸", label: "Maître de la photo" });
  }
  if (input.conversationScore >= 85) {
    badges.push({ key: "conversation_expert", icon: "💬", label: "Expert en conversation" });
  }
  if (input.scoreDelta !== null && input.scoreDelta >= 10) {
    badges.push({ key: "profile_upgrade", icon: "🔥", label: `Profil boosté — +${input.scoreDelta} points` });
  }
  if (input.overallScore >= 80) {
    badges.push({ key: "rising_star", icon: "⭐", label: "Étoile montante — score d'élite" });
  }
  if (input.planDaysTotal > 0 && input.planDaysDone === input.planDaysTotal) {
    badges.push({ key: "consistency", icon: "✅", label: "Régularité — plan complété en entier" });
  }
  if (input.bioGenerationCount >= 3) {
    badges.push({ key: "bio_wordsmith", icon: "✍️", label: "Plume affûtée" });
  }
  if (input.simulatorSessionCount >= 3) {
    badges.push({ key: "conversation_practice", icon: "🎯", label: "Entraînement conversation" });
  }

  return badges;
}

export interface Level {
  name: string;
  min: number;
  max: number;
}

const LEVELS: Level[] = [
  { name: "Débutant", min: 0, max: 40 },
  { name: "En progrès", min: 41, max: 60 },
  { name: "Solide", min: 61, max: 75 },
  { name: "Fort", min: 76, max: 89 },
  { name: "Élite", min: 90, max: 100 },
];

export function getLevel(overallScore: number): Level {
  return LEVELS.find((l) => overallScore >= l.min && overallScore <= l.max) ?? LEVELS[0];
}

export function nextLevel(overallScore: number): Level | null {
  const currentIndex = LEVELS.findIndex((l) => overallScore >= l.min && overallScore <= l.max);
  return currentIndex >= 0 && currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
}
