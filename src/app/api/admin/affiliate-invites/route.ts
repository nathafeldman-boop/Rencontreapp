import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  label: z.string().max(60).optional(),
  commissionRatePercent: z.number().min(1).max(100).optional(),
});

/**
 * Generates a one-time invite link for the real-world affiliate funnel:
 * the team closes a deal over DM, then sends `/affilie/rejoindre/<token>`
 * instead of manually creating the affiliate's account. The token itself
 * is the only secret — anyone holding the link can claim it once.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return apiError("Unauthorized", 401);

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiValidationError(parsed.error);

  const admin = createAdminClient();
  const token = randomBytes(20).toString("base64url");

  const { data: invite, error } = await admin
    .from("affiliate_invites")
    .insert({
      token,
      label: parsed.data.label || null,
      commission_rate: parsed.data.commissionRatePercent ? parsed.data.commissionRatePercent / 100 : undefined,
    })
    .select("id, token, label, commission_rate, created_at")
    .single();

  if (error) return apiError(error.message, 500);

  return apiSuccess({ invite }, 201);
}
