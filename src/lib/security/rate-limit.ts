import { NextResponse, type NextRequest } from "next/server";

/**
 * Fixed-window rate limiting for mutating API routes, enforced in
 * `src/proxy.ts` before the request ever reaches a Route Handler.
 *
 * This is an in-memory limiter — real, and enough to blunt casual abuse
 * and runaway client bugs at MVP scale, but it resets per server instance
 * and doesn't coordinate across regions. Before scaling past a single
 * instance (see README "Launch checklist"), move this to Upstash Redis or
 * a platform-level limiter (Vercel Firewall / Cloudflare) — the
 * `checkRateLimit` call site in `proxy.ts` doesn't need to change either
 * way.
 */
interface RouteLimit {
  /** Path prefix this rule applies to. First match wins — order matters. */
  prefix: string;
  limit: number;
  windowMs: number;
}

const ROUTE_LIMITS: RouteLimit[] = [
  { prefix: "/api/stripe/checkout", limit: 5, windowMs: 60_000 },
  { prefix: "/api/onboarding", limit: 10, windowMs: 60_000 },
  { prefix: "/api/profile", limit: 15, windowMs: 60_000 },
  { prefix: "/api/analyze", limit: 5, windowMs: 60_000 },
  { prefix: "/api/ai/", limit: 20, windowMs: 60_000 },
  { prefix: "/api/stats", limit: 30, windowMs: 60_000 },
  { prefix: "/api/", limit: 30, windowMs: 60_000 }, // catch-all for the rest
];

const hits = new Map<string, { count: number; resetAt: number }>();

// Periodically forget stale keys so the map doesn't grow unbounded on a
// long-lived instance.
const SWEEP_INTERVAL_MS = 5 * 60_000;
let lastSweep = Date.now();
function sweepIfDue(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of hits) {
    if (entry.resetAt < now) hits.delete(key);
  }
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/**
 * Returns a 429 response if this request should be blocked, or `null` to
 * let it through. Scoped to `/api/*` only — page navigations never hit
 * this. GET routes are included: `/api/stats` and `/api/share/score-card`
 * are public and unauthenticated, and the latter does real CPU work
 * (`next/og` image generation) per request, so both need protection just
 * as much as the mutating routes do.
 */
export function checkRateLimit(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith("/api/")) return null;

  const rule = ROUTE_LIMITS.find((r) => request.nextUrl.pathname.startsWith(r.prefix));
  if (!rule) return null;

  const now = Date.now();
  sweepIfDue(now);

  const key = `${clientIp(request)}:${rule.prefix}`;
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + rule.windowMs });
    return null;
  }

  entry.count += 1;
  if (entry.count > rule.limit) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests — slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  return null;
}
