import { createClient } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/supabase/signed-photo-urls";
import { OptimizeView } from "@/components/dashboard/optimize/optimize-view";
import { stripProblemPrefix } from "@/lib/utils/recommendations";
import type { Recommendation } from "@/types/database.types";

export default async function OptimizePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, bio")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: latestAnalysis } = await supabase
    .from("analyses")
    .select("id, bio_score, recommendations")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const recommendations = (latestAnalysis?.recommendations ?? []) as Recommendation[];
  const bioRecommendation = recommendations.find((r) => r.category === "bio");

  const { data: photoAnalyses } = latestAnalysis
    ? await supabase
        .from("photo_analyses")
        .select("*")
        .eq("analysis_id", latestAnalysis.id)
        .order("position", { ascending: true })
    : { data: null };

  const signedUrls = photoAnalyses ? await signPhotoUrls(supabase, photoAnalyses.map((p) => p.photo_path)) : {};

  const photos = (photoAnalyses ?? []).map((p) => ({
    path: p.photo_path,
    url: signedUrls[p.photo_path] ?? "",
    score: p.score,
    pros: p.pros,
    cons: p.cons,
    recommendation: p.recommendation,
    suggestedRole: p.suggested_role,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Optimise ton profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ton profil peut encore être optimisé — modifie ta bio et tes photos ici.</p>
      </div>

      <OptimizeView
        currentBio={profile?.bio ?? ""}
        bioScore={latestAnalysis?.bio_score ?? undefined}
        bioProblem={bioRecommendation ? stripProblemPrefix(bioRecommendation.title) : undefined}
        photos={photos}
        hasAnalysis={Boolean(latestAnalysis)}
      />
    </div>
  );
}
