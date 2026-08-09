import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { AFFILIATE_COOKIE } from "@/lib/affiliates/cookies";
import { REFERRAL_COOKIE, CREATOR_COOKIE } from "@/lib/referrals/cookies";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — matches /r/<code> and /creator/<slug>

/**
 * Affiliate tracking link: `flirtcraft.app/aff/<code>`. Unlike `/r/<code>`
 * (no DB lookup on click, by design), this one does look the code up and
 * logs a row in `affiliate_clicks` — the affiliate program's whole pitch is
 * "you can see your click count", so the click has to actually be counted.
 * An explicit link click always wins over whatever attribution cookie the
 * visitor already carried (same "last explicit click wins" rule as
 * `/r/<code>`), and clears the other two so a visitor is never attributed
 * to more than one program at once.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const response = NextResponse.redirect(new URL("/", request.url));

  const admin = createAdminClient();
  const { data: affiliate } = await admin
    .from("affiliates")
    .select("id")
    .eq("code", code.toLowerCase())
    .eq("active", true)
    .maybeSingle();

  if (!affiliate) return response;

  await admin.from("affiliate_clicks").insert({ affiliate_id: affiliate.id });

  response.cookies.set(AFFILIATE_COOKIE, code.toLowerCase(), {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
  response.cookies.delete(REFERRAL_COOKIE);
  response.cookies.delete(CREATOR_COOKIE);

  return response;
}
