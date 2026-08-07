import { NextRequest, NextResponse } from "next/server";

import { REFERRAL_COOKIE } from "@/lib/referrals/cookies";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — long enough to cover a slow decision to sign up

/**
 * Referral link landing: `matchai.com/r/<code>`. Deliberately does no DB
 * lookup here — this just stamps the cookie and sends the visitor to the
 * normal landing page; the code is validated once, at signup time, in
 * `lib/referrals/attribute-signup.ts`. Keeps this route a single fast
 * redirect regardless of how many times a link gets clicked or scraped.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set(REFERRAL_COOKIE, code, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
