import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/supabase/signed-photo-urls";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

const GENDER_LABEL: Record<string, string> = {
  male: "Homme",
  female: "Femme",
  non_binary: "Non-binaire",
  other: "Autre",
};

const DATING_APP_LABEL: Record<string, string> = {
  tinder: "Tinder",
  hinge: "Hinge",
  bumble: "Bumble",
  other: "Autre",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Honest, capped heuristic — not a promise. Weighs how much headroom the
 * weakest sub-score has (the app's own "weak link drags the score down"
 * philosophy, applied in reverse: fixing the weakest lever has the most
 * upside). Always rendered as "Score potentiel (estimation)".
 */
function estimatePotentialScore(overall: number, subs: number[]) {
  const weakest = Math.min(...subs);
  const weakestGain = clamp(78 - weakest, 0, 30);
  return Math.round(clamp(overall + weakestGain * 0.6, overall + 5, 95));
}

export default async function MyProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: userRow }, { data: profile }, { data: firstAnalysis }, { data: latestAnalysis }] = await Promise.all([
    supabase.from("users").select("age, gender, country").eq("id", user?.id ?? "").maybeSingle(),
    supabase
      .from("profiles")
      .select("bio, photos, dating_app")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("analyses")
      .select("overall_score")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("analyses")
      .select("overall_score, photo_score, bio_score, attractiveness_score, conversation_score")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profile || !latestAnalysis) {
    return (
      <EmptyState
        title="Pas encore de profil optimisé"
        description="Complète ton analyse pour voir ton profil complet ici."
        action={
          <Button asChild>
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        }
      />
    );
  }

  const photos = profile.photos ?? [];
  const signedUrls = photos.length > 0 ? await signPhotoUrls(supabase, photos) : {};

  const potential = estimatePotentialScore(latestAnalysis.overall_score, [
    latestAnalysis.photo_score ?? latestAnalysis.overall_score,
    latestAnalysis.bio_score ?? latestAnalysis.overall_score,
    latestAnalysis.attractiveness_score ?? latestAnalysis.overall_score,
    latestAnalysis.conversation_score ?? latestAnalysis.overall_score,
  ]);

  const before = firstAnalysis?.overall_score ?? latestAnalysis.overall_score;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ton profil optimisé, tel qu&apos;il est aujourd&apos;hui.</p>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((path, i) => (
            <div key={path} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary">
              {signedUrls[path] && (
                <Image src={signedUrls[path]} alt="" fill sizes="200px" className="object-cover" unoptimized />
              )}
              {i === 0 && <Badge className="absolute left-1.5 top-1.5 text-[10px]">Principale</Badge>}
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {userRow?.age && <span>{userRow.age} ans</span>}
            {userRow?.gender && <span>· {GENDER_LABEL[userRow.gender] ?? userRow.gender}</span>}
            {userRow?.country && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {userRow.country}
              </span>
            )}
            {profile.dating_app && <Badge variant="secondary">{DATING_APP_LABEL[profile.dating_app] ?? profile.dating_app}</Badge>}
          </div>

          {profile.bio && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</p>
              <p className="mt-1 text-sm">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:justify-around">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Score de départ</p>
            <p className="mt-2 text-4xl font-semibold">{before}</p>
            <p className="text-xs text-muted-foreground">ta toute première analyse</p>
          </div>
          <ArrowRight className="hidden size-6 shrink-0 text-muted-foreground sm:block" />
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground">Score actuel</p>
            <p className="mt-2 text-4xl font-semibold">{latestAnalysis.overall_score}</p>
            <p className="text-xs text-muted-foreground">recalculé à chaque changement</p>
          </div>
          <ArrowRight className="hidden size-6 shrink-0 text-muted-foreground sm:block" />
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Score potentiel</p>
            <p className="mt-2 text-4xl font-semibold text-primary">{potential}</p>
            <p className="text-xs text-muted-foreground">estimation</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Score de départ</span> : ta note le tout premier jour, figée
        pour te montrer ton chemin parcouru. <span className="font-medium text-foreground">Score actuel</span> :
        ta vraie note aujourd&apos;hui — elle bouge dès que tu modifies ta bio ou tes photos.{" "}
        <span className="font-medium text-foreground">Score potentiel</span> : une estimation de ce que tu peux
        atteindre en corrigeant ton plus gros point faible — pas une garantie de résultat.
      </p>

      <Button asChild className="w-fit">
        <Link href="/dashboard/optimize">
          Optimiser mon profil
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
