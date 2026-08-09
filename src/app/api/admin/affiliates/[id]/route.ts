import { NextRequest } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  active: z.boolean().optional(),
  markCommissionsPaid: z.boolean().optional(),
});

/**
 * Two independent admin actions on one affiliate, kept in a single route
 * since they're both simple field flips triggered from the same panel row:
 * toggling `active` (kills the tracking link / attribution without
 * deleting history) and marking every currently-`due` commission as `paid`
 * (a payout batch was just sent).
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return apiError("Unauthorized", 401);

  const { id } = await params;
  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiValidationError(parsed.error);

  const admin = createAdminClient();

  if (parsed.data.active !== undefined) {
    const { error } = await admin.from("affiliates").update({ active: parsed.data.active }).eq("id", id);
    if (error) return apiError(error.message, 500);
  }

  if (parsed.data.markCommissionsPaid) {
    const { error } = await admin
      .from("affiliate_commissions")
      .update({ status: "paid" })
      .eq("affiliate_id", id)
      .eq("status", "due");
    if (error) return apiError(error.message, 500);
  }

  return apiSuccess({ ok: true });
}
