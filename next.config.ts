import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

/**
 * Every external origin the browser actually talks to, gathered by
 * grepping the client bundle rather than guessed:
 *  - Supabase project URL: auth/session calls (every page) + direct
 *    browser uploads to Storage (onboarding photo upload, photo
 *    optimizer) + signed photo URLs rendered as <img src>.
 *  - PostHog: event capture only (posthog-js is bundled into our own JS,
 *    not loaded from a CDN, so it doesn't need a script-src entry).
 * Stripe and Mistral are NOT here on purpose: Stripe Checkout is a full
 * page redirect (window.location.assign), never an iframe or client-side
 * Stripe.js call, and Mistral is only ever called server-side.
 */
const csp = [
  "default-src 'self'",
  // Next.js's own hydration/RSC bootstrap and the JSON-LD blocks in
  // layout.tsx are inline — a nonce-based CSP would let us drop
  // 'unsafe-inline' here, but that needs per-request wiring through
  // middleware; this is the pragmatic first hardening pass.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabaseUrl ? ` ${supabaseUrl}` : ""}`,
  "font-src 'self' data:",
  `connect-src 'self'${supabaseUrl ? ` ${supabaseUrl}` : ""} ${posthogHost}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // lucide-react ships one module per icon; this keeps named imports like
  // `import { Camera } from "lucide-react"` from pulling in more than the
  // icons actually used on each page — meaningful on an icon-heavy landing.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
