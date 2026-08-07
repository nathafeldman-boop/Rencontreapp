import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { assignLandingVariant } from "@/lib/experiments/assign-variant";
import { assignCreatorCookie } from "@/lib/referrals/assign-creator-cookie";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function proxy(request: NextRequest) {
  const limited = checkRateLimit(request);
  if (limited) return limited;

  const response = await updateSession(request);
  assignLandingVariant(request, response);
  assignCreatorCookie(request, response);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization
     * files, so the Supabase session cookie stays fresh on every navigation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
