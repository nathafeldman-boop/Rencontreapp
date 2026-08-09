import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { StatsView, type DatingStatRow } from "@/components/dashboard/stats/stats-view";

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("dating_stats")
    .select("id, platform, period_start, period_end, likes, matches, conversations, replies, dates, created_at")
    .eq("user_id", user?.id ?? "")
    .order("period_start", { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tes statistiques</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suis tes likes, matchs, conversations et dates dans le temps.
        </p>
        <Link
          href="/dashboard/progression"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Voir l&apos;effet sur ton Dating Score
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <StatsView initialStats={(data ?? []) as DatingStatRow[]} />
    </div>
  );
}
