import { NextRequest } from "next/server";
import { z } from "zod";

import { getAdminSession, generateAccessCode } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({ label: z.string().max(60).optional() });

/** Generates a new admin access code — must already be logged in to mint another one. */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return apiError("Unauthorized", 401);
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const admin = createAdminClient();
  const code = generateAccessCode();

  const { error } = await admin.from("admin_access_codes").insert({ code, label: parsed.data.label || null });
  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess({ code }, 201);
}
