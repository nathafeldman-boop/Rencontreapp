import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getFunnelRedirect } from "@/lib/auth/funnel-redirect";
import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ redirect_to?: string }>;
}

/**
 * A server wrapper so an already-authenticated visitor is redirected onward
 * before the signup form ever renders — previously this page always showed
 * the "Crée ton compte" form regardless of session state, so a returning
 * (unpaid) user coming back from the landing page would sign in again and
 * land back on /onboarding, re-submitting answers/profile that already
 * existed instead of picking up where they left off.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect_to } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(redirect_to || (await getFunnelRedirect(supabase, user.id)));
  }

  return <LoginForm redirectTo={redirect_to} />;
}
