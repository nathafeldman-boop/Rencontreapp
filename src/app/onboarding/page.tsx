import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getFunnelRedirect } from "@/lib/auth/funnel-redirect";
import { OnboardingForm } from "./onboarding-form";

/**
 * A server wrapper so a user who already completed onboarding (has a
 * profile row) never sees the form again — both /api/onboarding and
 * /api/profile `insert` rather than `upsert`, so replaying this page
 * created duplicate onboarding_answers/profiles rows for the same account.
 * Send them to wherever they actually left off instead.
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (profile) {
      redirect(await getFunnelRedirect(supabase, user.id));
    }
  }

  return <OnboardingForm />;
}
