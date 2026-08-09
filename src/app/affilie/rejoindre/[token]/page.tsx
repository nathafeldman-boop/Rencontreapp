import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClaimInviteForm } from "@/components/dashboard/affiliate/claim-invite-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Link2Off } from "lucide-react";

interface ClaimInvitePageProps {
  params: Promise<{ token: string }>;
}

/**
 * Landing spot for an affiliate invite link generated in /admin. `/affilie`
 * is already in `PROTECTED_PREFIXES` (see src/lib/supabase/proxy.ts), so an
 * unauthenticated visitor is bounced to /auth/login?redirect_to=this-url
 * and lands back here once signed in — no separate "please log in" branch
 * needed, `user` below is guaranteed non-null.
 */
export default async function ClaimInvitePage({ params }: ClaimInvitePageProps) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("affiliate_invites")
    .select("commission_rate, used_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite || invite.used_at) {
    return (
      <EmptyState
        icon={Link2Off}
        title="Ce lien d'invitation n'est plus valide"
        description="Il a peut-être déjà été utilisé — contacte l'équipe Flirtcraft pour en obtenir un nouveau."
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existingAffiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  if (existingAffiliate) redirect("/affilie");

  return <ClaimInviteForm token={token} commissionRatePercent={Math.round(invite.commission_rate * 100)} />;
}
