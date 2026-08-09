import { createClient } from "@/lib/supabase/server";
import { clientEnv } from "@/lib/env";
import { AffiliateView } from "@/components/dashboard/affiliate/affiliate-view";
import { EmptyState } from "@/components/ui/empty-state";
import { Handshake } from "lucide-react";

export default async function AffiliatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, code, commission_rate, display_name")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  if (!affiliate) {
    return (
      <EmptyState
        icon={Handshake}
        title="Pas encore de compte affilié"
        description="Ce programme est réservé aux partenaires Flirtcraft — contacte l'équipe si tu penses devoir y avoir accès."
      />
    );
  }

  const [{ count: clickCount }, { count: signupCount }, { data: commissions }] = await Promise.all([
    supabase.from("affiliate_clicks").select("*", { count: "exact", head: true }).eq("affiliate_id", affiliate.id),
    supabase
      .from("affiliate_referrals")
      .select("*", { count: "exact", head: true })
      .eq("affiliate_id", affiliate.id),
    supabase
      .from("affiliate_commissions")
      .select("amount_cents, commission_cents, status, created_at")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false }),
  ]);

  const saleCount = commissions?.length ?? 0;
  const dueCents = (commissions ?? []).filter((c) => c.status === "due").reduce((sum, c) => sum + c.commission_cents, 0);
  const paidCents = (commissions ?? []).filter((c) => c.status === "paid").reduce((sum, c) => sum + c.commission_cents, 0);

  return (
    <AffiliateView
      displayName={affiliate.display_name}
      trackingUrl={`${clientEnv.NEXT_PUBLIC_SITE_URL}/aff/${affiliate.code}`}
      commissionRate={affiliate.commission_rate}
      clickCount={clickCount ?? 0}
      signupCount={signupCount ?? 0}
      saleCount={saleCount}
      dueCents={dueCents}
      paidCents={paidCents}
      commissions={commissions ?? []}
    />
  );
}
