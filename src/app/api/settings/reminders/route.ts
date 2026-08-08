import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  enabled: z.boolean(),
});

/** Sets the daily stats-reminder email opt-in — shown once on the dashboard, changeable later from Settings. */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { error } = await supabase
    .from("users")
    .update({ daily_reminder_enabled: parsed.data.enabled })
    .eq("id", user.id);

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess({ enabled: parsed.data.enabled });
}
