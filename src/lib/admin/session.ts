import { randomBytes, randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";

export const ADMIN_SESSION_COOKIE = "flirtcraft_admin_session";
const SESSION_DURATION_DAYS = 30;
/** A session pinging within this window counts as "actuellement connecté" — no separate presence system. */
const ONLINE_WINDOW_MINUTES = 15;

export interface AdminSessionInfo {
  sessionId: string;
  codeId: string;
  label: string | null;
}

function generateToken() {
  return randomBytes(32).toString("hex");
}

/** Human-typable code: e.g. FC-7K29-QX4M. Avoids 0/O/1/I to reduce transcription errors. */
const CODE_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateAccessCode(): string {
  const chunk = () =>
    Array.from({ length: 4 }, () => CODE_CHARSET[randomInt(CODE_CHARSET.length)]).join("");
  return `FC-${chunk()}-${chunk()}`;
}

/**
 * Validates a code against admin_access_codes and, if valid, creates a
 * session row + returns its token. Caller is responsible for setting the
 * cookie (this function has no access to the response in a route handler).
 */
export async function createAdminSession(
  code: string
): Promise<{ token: string; expiresAt: Date } | { error: string }> {
  const admin = createAdminClient();

  const { data: accessCode } = await admin
    .from("admin_access_codes")
    .select("id, is_active, expires_at")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!accessCode || !accessCode.is_active) {
    return { error: "Code invalide." };
  }

  if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
    return { error: "Ce code a expiré." };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const { error: insertError } = await admin.from("admin_sessions").insert({
    token,
    access_code_id: accessCode.id,
    expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    return { error: "Impossible de créer la session — réessaie." };
  }

  await admin.from("admin_access_codes").update({ last_used_at: new Date().toISOString() }).eq("id", accessCode.id);

  return { token, expiresAt };
}

/** Reads the session cookie and returns the session if it's valid and not expired, refreshing last_seen_at. */
export async function getAdminSession(): Promise<AdminSessionInfo | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const admin = createAdminClient();
  const { data: session } = await admin
    .from("admin_sessions")
    .select("id, expires_at, access_code_id")
    .eq("token", token)
    .maybeSingle();

  if (!session || new Date(session.expires_at) < new Date()) {
    return null;
  }

  const [, { data: accessCode }] = await Promise.all([
    admin.from("admin_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", session.id),
    admin.from("admin_access_codes").select("label").eq("id", session.access_code_id).maybeSingle(),
  ]);

  return { sessionId: session.id, codeId: session.access_code_id, label: accessCode?.label ?? null };
}

/** Server-page guard — call at the top of every protected /admin page. */
export async function requireAdminSession(): Promise<AdminSessionInfo> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function destroyAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    const admin = createAdminClient();
    await admin.from("admin_sessions").delete().eq("token", token);
  }
}

/** "Qui est connecté en ce moment" — sessions seen within the last ONLINE_WINDOW_MINUTES, one row per code. */
export async function listOnlineAdmins() {
  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - ONLINE_WINDOW_MINUTES * 60 * 1000).toISOString();

  const { data: sessions } = await admin
    .from("admin_sessions")
    .select("access_code_id, last_seen_at")
    .gte("last_seen_at", cutoff)
    .order("last_seen_at", { ascending: false });

  if (!sessions || sessions.length === 0) return [];

  const codeIds = [...new Set(sessions.map((s) => s.access_code_id))];
  const { data: codes } = await admin.from("admin_access_codes").select("id, label").in("id", codeIds);
  const labelById = new Map((codes ?? []).map((c) => [c.id, c.label]));

  const seen = new Set<string>();
  const online: { label: string; lastSeenAt: string }[] = [];

  for (const session of sessions) {
    if (seen.has(session.access_code_id)) continue;
    seen.add(session.access_code_id);
    online.push({ label: labelById.get(session.access_code_id) ?? "Admin", lastSeenAt: session.last_seen_at });
  }

  return online;
}
