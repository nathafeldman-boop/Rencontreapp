import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingCard } from "@/components/settings/billing-card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, stripe_customer_id")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Réglages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ton compte et ton abonnement.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </CardContent>
      </Card>

      <BillingCard
        plan={subscription?.plan ?? null}
        status={subscription?.status ?? null}
        currentPeriodEnd={subscription?.current_period_end ?? null}
        hasBillingAccount={Boolean(subscription?.stripe_customer_id)}
      />
    </div>
  );
}
