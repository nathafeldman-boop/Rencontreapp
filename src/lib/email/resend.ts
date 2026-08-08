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
  // referral attribution, the weekly/daily cron loops) — log and move on.
  // A dedicated, greppable line first: `reportError` prefixes everything
  // with the same generic "[Flirtcraft] Unhandled error", which buried a
  // 403 Resend domain-verification failure (every send failing) among
  // unrelated errors for days before anyone noticed no emails were going out.
  if (error) {
    console.error(`[Flirtcraft][email] Send failed — from=${serverEnv.RESEND_FROM_EMAIL} to=${to} subject="${subject}":`, error);
    reportError(error, { scope: "email", to, subject, from: serverEnv.RESEND_FROM_EMAIL });
  }
}
