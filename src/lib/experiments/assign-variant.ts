import type { NextRequest, NextResponse } from "next/server";

import { VARIANT_COOKIE, isLandingVariant, pickRandomVariant } from "@/lib/experiments/landing-copy";

const VARIANT_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days — stable per-visitor bucketing

/**
 * Assigns a landing-page copy variant on first visit and makes it available
 * to the Server Component render for the *same* request (mutating
 * `request.cookies`, not just the outgoing response) — the standard
 * middleware pattern for cookies a page needs to read during its own render.
 */
export function assignLandingVariant(request: NextRequest, response: NextResponse) {
  const existing = request.cookies.get(VARIANT_COOKIE)?.value;
  if (isLandingVariant(existing)) return;

  const variant = pickRandomVariant();
  request.cookies.set(VARIANT_COOKIE, variant);
  response.cookies.set(VARIANT_COOKIE, variant, {
    maxAge: VARIANT_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}
