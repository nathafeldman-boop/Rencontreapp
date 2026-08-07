import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/settings",
  "/onboarding",
  "/analyze",
  "/results",
  "/paywall",
  "/referrals",
  "/premium",
];

/**
 * Temporarily lets logged-out visitors browse gated routes so the app can be
 * reviewed end-to-end before launch without repeated sign-ins. Pages already
 * fall back to `user?.id ?? ""` / empty-state rendering when there's no user.
 * Flip back to `true` before going live.
 */
const AUTH_GATE_ENABLED = false;

/**
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated users away from protected routes. Called from
 * `src/proxy.ts` (Next.js 16 renamed `middleware.ts` -> `proxy.ts`).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (AUTH_GATE_ENABLED && !user && isProtected) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirect_to", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
