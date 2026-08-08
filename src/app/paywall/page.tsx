import { createClient } from "@/lib/supabase/server";
import { getDisplayFirstName } from "@/lib/utils/display-name";
import { PaywallView, type PaywallData } from "@/components/paywall/paywall-view";

const DEMO_DATA: PaywallData = {
  isDemo: true,
  firstName: null,
  overall: 62,
};

interface PaywallPageProps {
  searchParams: Promise<{ id?: string; checkout?: string }>;
}

export default async function PaywallPage({ searchParams }: PaywallPageProps) {
  const { id } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <PaywallView data={DEMO_DATA} />;
  }

  const analysisQuery = id
    ? supabase.from("analyses").select("overall_score").eq("id", id).maybeSingle()
    : supabase
        .from("analyses")
        .select("overall_score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  const { data: analysis } = await analysisQuery;

  if (!analysis) {
    return <PaywallView data={DEMO_DATA} />;
  }

  const data: PaywallData = {
    isDemo: false,
    firstName: getDisplayFirstName(user),
    overall: analysis.overall_score,
  };

  return <PaywallView data={data} />;
}
