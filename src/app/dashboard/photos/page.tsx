import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/supabase/signed-photo-urls";
import { PhotoOptimizerView } from "@/components/dashboard/photos/photo-optimizer-view";

export default async function PhotoOptimizerPage() {
  const supabase = await createClient();

  const { data: latestAnalysis } = await supabase
    .from("analyses")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Tableau de bord
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Photo Optimizer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Notation IA photo par photo, avec un rôle recommandé pour chacune.
        </p>
      </div>

      <PhotoOptimizerView initialPhotos={photos} hasAnalysis={Boolean(latestAnalysis)} />
    </div>
  );
}
