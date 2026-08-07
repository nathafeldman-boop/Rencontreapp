"use client";

import { useEffect, useState } from "react";

import { DEFAULT_VARIANT, LANDING_COPY, VARIANT_COOKIE, isLandingVariant, type LandingVariant } from "@/lib/experiments/landing-copy";

function readVariantCookie(): LandingVariant | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${VARIANT_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isLandingVariant(value) ? value : null;
}

/**
 * The landing page is statically generated (see app/page.tsx) so it loads
 * fast from a cold TikTok click — no per-request cookie read on the server.
 * The variant `src/proxy.ts` assigned is applied here instead, after
 * hydration: first render always matches the static HTML (`DEFAULT_VARIANT`,
 * no mismatch), then swaps in the real variant. That trades a brief flash
 * for keeping the page cacheable.
 */
export function useLandingVariant() {
  const [variant, setVariant] = useState<LandingVariant>(DEFAULT_VARIANT);

  useEffect(() => {
    // One-time read of a browser-only value (no server equivalent to sync
    // against, no external subscription to attach) — done here rather than
    // in a lazy useState initializer specifically so the first client
    // render still matches the static server HTML and doesn't hydrate-mismatch.
    const fromCookie = readVariantCookie();
    if (fromCookie && fromCookie !== variant) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVariant(fromCookie);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { variant, copy: LANDING_COPY[variant] };
}
