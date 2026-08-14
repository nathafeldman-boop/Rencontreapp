import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getFunnelRedirect } from "@/lib/auth/funnel-redirect";
import { OnboardingForm } from "./onboarding-form";

interface OnboardingPageProps {
  searchParams: Promise<{ restart?: string }>;
}

/**
 * A server wrapper so a user who already completed onboarding (has a
 * profile row) never sees the form again by accident — send them to
 * wherever they actually left off instead. `?restart=1` is the deliberate
 * exception: the free regenerate panel's "Tout recommencer" link, for
 * someone who realizes they answered the qualifying questions wrong.
 * Safe to replay now — both /api/onboarding and /api/profile upsert by
 * user rather than blind-inserting, so this reuses the existing rows
 * instead of leaving duplicates behind.
 */
export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { restart } = await searchParams;
  if (restart === "1") return <OnboardingForm />;

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
