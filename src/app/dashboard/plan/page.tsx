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
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Dating Improvement Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A personalized 7-day plan built from your latest analysis.
        </p>
      </div>

      <PlanView initialDays={plan?.days ?? null} />
    </div>
  );
}
