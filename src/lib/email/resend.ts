import { Resend } from "resend";

import { serverEnv } from "@/lib/env";
import { reportError } from "@/lib/observability/report-error";

let client: Resend | null = null;

function getClient() {
  if (!client) client = new Resend(serverEnv.RESEND_API_KEY);
  return client;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const { error } = await getClient().emails.send({
    from: serverEnv.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  });

  // Email failures shouldn't break the flow that triggered them (signup,
  // referral attribution, the weekly cron loop) — log and move on.
  if (error) reportError(error, { scope: "email", to, subject });
}
