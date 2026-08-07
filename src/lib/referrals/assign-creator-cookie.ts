import type { NextRequest, NextResponse } from "next/server";

import { CREATOR_COOKIE, REFERRAL_COOKIE } from "@/lib/referrals/cookies";

const CREATOR_PATH = /^\/creator\/([a-z0-9-]+)/i;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * First-touch attribution for /creator/<slug> landing pages: stamps the
 * `mai_creator` cookie (read later by lib/referrals/attribute-signup.ts at
 * signup) unless the visitor already carries a referral or creator cookie
 * from an earlier visit — first touch wins rather than last click.
 */
export function assignCreatorCookie(request: NextRequest, response: NextResponse) {
  const match = request.nextUrl.pathname.match(CREATOR_PATH);
  if (!match) return;
  if (request.cookies.get(REFERRAL_COOKIE) || request.cookies.get(CREATOR_COOKIE)) return;

  const slug = match[1];
  request.cookies.set(CREATOR_COOKIE, slug);
  response.cookies.set(CREATOR_COOKIE, slug, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}
