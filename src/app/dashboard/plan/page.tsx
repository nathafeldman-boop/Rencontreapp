import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PlanView } from "@/components/dashboard/plan/plan-view";

export default async function DatingPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plan } = await supabase
    .from("dating_plans")
    .select("days")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Tableau de bord
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon plan d&apos;amélioration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Un plan personnalisé sur 7 jours construit à partir de ta dernière analyse.
        </p>
      </div>

      <PlanView initialDays={plan?.days ?? null} />
    </div>
  );
}
