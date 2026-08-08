import { NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getWeeklyReport } from "@/lib/reports/weekly-report";
import { sendWeeklyReportEmail } from "@/lib/email/send";
import { apiError, apiSuccess } from "@/lib/api/response";
import { serverEnv } from "@/lib/env";

/**
 * Triggered weekly by Vercel Cron (see vercel.json). Vercel sends
 * `Authorization: Bearer <CRON_SECRET>` automatically when CRON_SECRET is
 * set as a project env var — this route rejects anything else so the
 * endpoint can't be used to mass-email users on demand.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return apiError("Unauthorized", 401);
  }

  const supabase = createAdminClient();

  const { data: rows } = await supabase.from("analyses").select("user_id");
  const userIds = [...new Set((rows ?? []).map((r) => r.user_id))];

  let sent = 0;
  for (const userId of userIds) {
    const report = await getWeeklyReport(supabase, userId);
    if (!report) continue;

    const { data: user } = await supabase.auth.admin.getUserById(userId);
    if (!user.user?.email) continue;

    await sendWeeklyReportEmail(user.user.email, report);
    sent++;
  }

  return apiSuccess({ usersChecked: userIds.length, emailsSent: sent });
}
