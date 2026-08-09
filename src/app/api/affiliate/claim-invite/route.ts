import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  token: z.string().min(1),
  displayName: z.string().trim().min(1).max(60),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,32}$/, "Le lien doit faire 3 à 32 caractères : lettres minuscules, chiffres, tirets."),
});

/**
 * Completes the self-serve affiliate signup: the visitor already
 * authenticated (this route requires it) after clicking an invite link
 * generated in /admin, and is now submitting their pseudo + chosen
 * tracking code. Consumes the invite so it can't be reused.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiError("Unauthorized", 401);

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiValidationError(parsed.error);

  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("affiliate_invites")
    .select("id, commission_rate, used_at")
    .eq("token", parsed.data.token)
    .maybeSingle();

  if (!invite || invite.used_at) {
    return apiError("Ce lien d'invitation n'est plus valide.", 404);
  }

  const { data: existing } = await admin.from("affiliates").select("id").eq("user_id", user.id).maybeSingle();
  if (existing) {
    return apiError("Tu as déjà un compte affilié — retrouve ton dashboard sur /affilie.", 400);
  }

  const { data: affiliate, error } = await admin
    .from("affiliates")
    .insert({
      user_id: user.id,
      code: parsed.data.code,
      display_name: parsed.data.displayName,
      commission_rate: invite.commission_rate,
    })
    .select("id")
    .single();

  if (error) {
    const message = error.code === "23505" ? "Ce nom de lien est déjà pris — choisis-en un autre." : error.message;
    return apiError(message, 400);
  }

  await admin
    .from("affiliate_invites")
    .update({ used_at: new Date().toISOString(), used_by_affiliate_id: affiliate.id })
    .eq("id", invite.id);

  return apiSuccess({ ok: true });
}
