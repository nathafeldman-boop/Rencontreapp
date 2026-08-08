import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { createAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin/session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({ code: z.string().min(4).max(40) });

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const result = await createAdminSession(parsed.data.code);
  if ("error" in result) {
    return apiError(result.error, 401);
  }

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: result.expiresAt,
  });

  return apiSuccess({ ok: true });
}
