import { NextRequest } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  amountCents: z.number().int().positive(),
  note: z.string().max(200).optional(),
  paidAt: z.string().datetime().optional(),
  affiliateCode: z.string().trim().toLowerCase().max(32).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Records an off-platform payment (cash, missed Stripe invoice, a
 * manually-granted premium account) against a user, so the admin LTV total
 * on /admin/user/[id] reflects reality even when Stripe has no invoice for
 * it. Admin-only — never touches `subscriptions`.
 *
 * Optionally attributes the payment to an affiliate (same commission math
 * as the real Stripe webhook path — see lib/affiliates/record-commission.ts
 * — for a sale that never went through checkout.session.completed, e.g. a
 * manually-granted account or a payment collected outside Stripe). Keyed on
 * `manual:<manual_payments.id>` instead of a Stripe session id so it can
 * never collide with (or be confused for) a real one.
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
  const { data: payment, error } = await admin
    .from("manual_payments")
    .insert({
      user_id: id,
      amount_cents: parsed.data.amountCents,
      note: parsed.data.note || null,
      paid_at: parsed.data.paidAt ?? new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !payment) {
    return apiError("Impossible d'enregistrer le paiement — réessaie.", 500);
  }

  let affiliateAttributed = false;
  if (parsed.data.affiliateCode) {
    const { data: affiliate } = await admin
      .from("affiliates")
      .select("id, commission_rate")
      .eq("code", parsed.data.affiliateCode)
      .eq("active", true)
      .maybeSingle();

    if (affiliate) {
      const commissionCents = Math.round(parsed.data.amountCents * affiliate.commission_rate);
      if (commissionCents > 0) {
        const { error: commissionError } = await admin.from("affiliate_commissions").insert({
          affiliate_id: affiliate.id,
          referred_user_id: id,
          stripe_checkout_session_id: `manual:${payment.id}`,
          amount_cents: parsed.data.amountCents,
          commission_cents: commissionCents,
        });
        affiliateAttributed = !commissionError;
      }
    }
  }

  return apiSuccess({ recorded: true, affiliateAttributed }, 201);
}
