import { NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendRelaunchFixedEmail } from "@/lib/email/send";
import { apiError, apiSuccess } from "@/lib/api/response";
import { serverEnv } from "@/lib/env";

/**
 * One-off, targeted re-engagement send — NOT a recurring campaign. Triggered
 * once by the Vercel Cron entry in vercel.json pinned to a single date
 * (2026-08-14 06:00 UTC = 08:00 Paris), same bearer-token gate as the other
 * cron routes. Targets specific users whose reported issue has since been
 * fixed, by user id — add to the list only after the underlying bug is
 * actually resolved, never as a blanket "re-engage anyone unhappy" tool.
 * Safe to delete this route (and its vercel.json entry) once it has run.
 */
const TARGET_USER_IDS = [
  // Reported the Photo Optimizer's score jumping around on every reorder
  // click — fixed by debouncing the rescore (see photo-optimizer-view.tsx).
  "d2ad61ab-9f71-40b7-a77f-c004cefc4e18",
];

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return apiError("Unauthorized", 401);
  }

  const supabase = createAdminClient();

  let sent = 0;
  for (const userId of TARGET_USER_IDS) {
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    if (!user.user?.email) continue;

    await sendRelaunchFixedEmail(user.user.email);
    sent++;
  }

  return apiSuccess({ usersTargeted: TARGET_USER_IDS.length, emailsSent: sent });
}
