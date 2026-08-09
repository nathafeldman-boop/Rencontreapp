import { NextRequest } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,32}$/, "Le code doit faire 3 à 32 caractères : lettres minuscules, chiffres, tirets."),
  commissionRatePercent: z.number().min(1).max(100).optional(),
});

/**
 * Creates an affiliate by linking an existing Flirtcraft account (looked up
 * by email in `public.users`, not `auth.users` — same table the rest of
 * the admin panel already reads) to a tracking code. The person has to
 * have signed up on the site first; this is deliberate rather than
 * self-serve, same reasoning as `creators` being DB-managed.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return apiError("Unauthorized", 401);

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiValidationError(parsed.error);

  const admin = createAdminClient();

  const { data: user } = await admin
    .from("users")
    .select("id")
    .eq("email", parsed.data.email.trim().toLowerCase())
    .maybeSingle();

  if (!user) {
    return apiError("Aucun compte Flirtcraft avec cet email — la personne doit d'abord s'inscrire sur le site.", 404);
  }

  const { data: affiliate, error } = await admin
    .from("affiliates")
    .insert({
      user_id: user.id,
      code: parsed.data.code,
      commission_rate: parsed.data.commissionRatePercent ? parsed.data.commissionRatePercent / 100 : undefined,
    })
    .select("id, code, commission_rate, active, created_at")
    .single();

  if (error) {
    const message = error.code === "23505" ? "Ce code ou cet email est déjà utilisé par un autre affilié." : error.message;
    return apiError(message, 400);
  }

  return apiSuccess({ affiliate }, 201);
}
