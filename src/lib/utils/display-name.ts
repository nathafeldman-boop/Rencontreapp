interface DisplayNameUser {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

/**
 * Best-effort first name for a personalized greeting. There's no `name`
 * column on `public.users` (see 0001_init.sql) — Google OAuth sign-ins
 * carry a name in Supabase's `user_metadata`, magic-link sign-ins don't, so
 * this falls back to a cleaned-up local part of the email rather than
 * requiring a schema change just for a greeting.
 */
export function getDisplayFirstName(user: DisplayNameUser | null | undefined): string | null {
  if (!user) return null;

  const metadata = user.user_metadata ?? {};
  const metaName = metadata.full_name ?? metadata.name ?? metadata.given_name;
  if (typeof metaName === "string" && metaName.trim()) {
    return capitalize(metaName.trim().split(/\s+/)[0]);
  }

  const local = user.email?.split("@")[0];
  const cleaned = local?.replace(/[._\-+0-9]+/g, " ").trim().split(/\s+/)[0];
  return cleaned ? capitalize(cleaned) : null;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
