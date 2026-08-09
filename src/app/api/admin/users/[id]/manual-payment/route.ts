import { NextRequest } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  amountCents: z.number().int().positive(),
  note: z.string().max(200).optional(),
  paidAt: z.string().datetime().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Records an off-platform payment (cash, missed Stripe invoice, a
 * manually-granted premium account) against a user, so the admin LTV total
 * on /admin/user/[id] reflects reality even when Stripe has no invoice for
 * it. Admin-only — never touches `subscriptions`.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession();
  if (!session) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const admin = createAdminClient();
  const { error } = await admin.from("manual_payments").insert({
    user_id: id,
    amount_cents: parsed.data.amountCents,
    note: parsed.data.note || null,
    paid_at: parsed.data.paidAt ?? new Date().toISOString(),
  });

  if (error) {
    return apiError("Impossible d'enregistrer le paiement — réessaie.", 500);
  }

  return apiSuccess({ recorded: true }, 201);
}
