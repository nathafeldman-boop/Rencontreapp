import { NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendDailyReminderEmail } from "@/lib/email/send";
import { apiError, apiSuccess } from "@/lib/api/response";
import { serverEnv } from "@/lib/env";

/**
 * Triggered daily by Vercel Cron (see vercel.json). Same bearer-token gate
 * as /api/cron/weekly-report-emails — only opted-in users (see
 * /api/settings/reminders) get an email.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return apiError("Unauthorized", 401);
  }

  const supabase = createAdminClient();

  const { data: rows } = await supabase.from("users").select("id").eq("daily_reminder_enabled", true);
  const userIds = (rows ?? []).map((r) => r.id);

  let sent = 0;
  for (const userId of userIds) {
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    if (!user.user?.email) continue;

    await sendDailyReminderEmail(user.user.email);
    sent++;
  }

  return apiSuccess({ usersChecked: userIds.length, emailsSent: sent });
}
