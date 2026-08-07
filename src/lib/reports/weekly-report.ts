import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { signPhotoUrls } from "@/lib/supabase/signed-photo-urls";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface WeeklyReport {
  latestScore: number;
  weekAgoScore: number | null;
  scoreDelta: number | null;
  bestPhoto: { url: string; score: number } | null;
  worstPhoto: { url: string; score: number } | null;
  openers: string[];
  daysSinceLastAnalysis: number;
}

/**
 * Rotating bank of conversation openers — cycled by week number rather than
 * generated live, so the "3 new messages to test" in the weekly report costs
 * no AI credits and needs no storage. `analyses.created_at` already gives us
 * everything else, so this whole report is computed on read, no new table.
 */
const OPENER_BANK = [
  "Bon, il faut que je demande — c'est quoi l'histoire derrière ta troisième photo ?",
  "Tu as l'air d'être le genre de personne à avoir un avis tranché sur l'ananas sur la pizza. Convaincs-moi.",
  "Deux vérités et un mensonge : tu choisis, je devine.",
  "C'est quoi la dernière chose qui t'a fait éclater de rire ?",
  "Si on matchait juste sur ta bio, sur quoi on se disputerait en premier ?",
  "Sois honnête — le meilleur voyage que tu aies fait, et pourquoi.",
  "Sur quel sujet mineur es-tu prêt à mourir pour défendre ton avis ?",
  "Café, thé, ou tu es juste là pour le chaos ?",
  "Il y a un truc dans lequel tu es bizarrement doué ?",
  "Donne-moi ton meilleur dilemme : plage ou montagne ?",
  "C'est quoi au programme ce week-end qui t'excite vraiment ?",
  "Si tes amis devaient te décrire en trois mots, ce serait quoi ?",
  "C'est quoi une série ou un film que tu défendrais jusqu'au bout ?",
  "Raconte-moi la dernière chose dans laquelle tu t'es beaucoup trop investi.",
  "C'est quoi ta commande habituelle qui en dit long sur toi ?",
];

function weekIndex(date: Date): number {
  return Math.floor(date.getTime() / WEEK_MS);
}

function getWeeklyOpeners(count = 3): string[] {
  const start = (weekIndex(new Date()) * count) % OPENER_BANK.length;
  return Array.from({ length: count }, (_, i) => OPENER_BANK[(start + i) % OPENER_BANK.length]);
}

/**
 * Computes the weekly Dating Report entirely from data that already exists
 * (`analyses` history + `photo_analyses`) — no dedicated report table or
 * scheduled job needed. Returns null only when there's no analysis at all.
 */
export async function getWeeklyReport(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<WeeklyReport | null> {
  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, overall_score, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (!analyses || analyses.length === 0) return null;

  const latest = analyses[0];
  const cutoff = Date.now() - WEEK_MS;
  const weekAgo = analyses.find((a) => new Date(a.created_at).getTime() <= cutoff) ?? null;

  const { data: photos } = await supabase
    .from("photo_analyses")
    .select("photo_path, score")
    .eq("analysis_id", latest.id)
    .order("score", { ascending: false });

  let bestPhoto: WeeklyReport["bestPhoto"] = null;
  let worstPhoto: WeeklyReport["worstPhoto"] = null;

  if (photos && photos.length > 0) {
    const best = photos[0];
    const worst = photos[photos.length - 1];
    const urls = await signPhotoUrls(supabase, [best.photo_path, worst.photo_path]);
    bestPhoto = { url: urls[best.photo_path] ?? "", score: best.score };
    worstPhoto = photos.length > 1 ? { url: urls[worst.photo_path] ?? "", score: worst.score } : null;
  }

  return {
    latestScore: latest.overall_score,
    weekAgoScore: weekAgo?.overall_score ?? null,
    scoreDelta: weekAgo ? latest.overall_score - weekAgo.overall_score : null,
    bestPhoto,
    worstPhoto,
    openers: getWeeklyOpeners(),
    daysSinceLastAnalysis: Math.floor((Date.now() - new Date(latest.created_at).getTime()) / (24 * 60 * 60 * 1000)),
  };
}
