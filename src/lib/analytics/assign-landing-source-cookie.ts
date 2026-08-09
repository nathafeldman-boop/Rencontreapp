import type { NextRequest, NextResponse } from "next/server";

import { LANDING_REFERRER_COOKIE, LANDING_UTM_COOKIE } from "@/lib/analytics/cookies";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * First-touch marketing attribution: stamps referrer host / utm_source
 * cookies on a visitor's first hit, read later at signup (see
 * lib/auth/handle-new-signup.ts) to populate users.signup_referrer /
 * signup_utm_source for the admin "Origine" field. Skipped once already
 * set — first touch wins, same convention as assignCreatorCookie. Only the
 * referrer's *host* is kept (not the full URL/query string) — enough to
 * classify "Google search" vs "Instagram" vs "direct" without retaining
 * anything closer to a visitor's actual search terms.
 */
export function assignLandingSourceCookie(request: NextRequest, response: NextResponse) {
  if (request.cookies.get(LANDING_REFERRER_COOKIE) || request.cookies.get(LANDING_UTM_COOKIE)) return;

  const utmSource = request.nextUrl.searchParams.get("utm_source");
  const referrerHeader = request.headers.get("referer");

  let externalReferrerHost: string | null = null;
  if (referrerHeader) {
    try {
      const host = new URL(referrerHeader).host;
      externalReferrerHost = host === request.nextUrl.host ? null : host;
    } catch {
      externalReferrerHost = null;
    }
  }

  if (!externalReferrerHost && !utmSource) return;

  if (externalReferrerHost) {
    response.cookies.set(LANDING_REFERRER_COOKIE, externalReferrerHost, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }
  if (utmSource) {
    response.cookies.set(LANDING_UTM_COOKIE, utmSource, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }
}
