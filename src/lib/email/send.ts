import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail, referralRewardEmail, weeklyReportEmail, dailyReminderEmail } from "@/lib/email/templates";
import { clientEnv } from "@/lib/env";
import type { WeeklyReport } from "@/lib/reports/weekly-report";

export function sendWelcomeEmail(to: string) {
  return sendEmail({
    to,
    subject: "Bienvenue sur Flirtcraft 👋",
    html: welcomeEmail(clientEnv.NEXT_PUBLIC_SITE_URL),
  });
}

export function sendReferralRewardEmail(to: string, rewardDays: number) {
  return sendEmail({
    to,
    subject: `${rewardDays} jours de Premium débloqués 🎁`,
    html: referralRewardEmail(clientEnv.NEXT_PUBLIC_SITE_URL, rewardDays),
  });
}

export function sendWeeklyReportEmail(to: string, report: WeeklyReport) {
  return sendEmail({
    to,
    subject: `Ton rapport hebdomadaire — ${report.latestScore}/100`,
    html: weeklyReportEmail(clientEnv.NEXT_PUBLIC_SITE_URL, report),
  });
}

export function sendDailyReminderEmail(to: string) {
  return sendEmail({
    to,
    subject: "Ton rappel quotidien Flirtcraft 📊",
    html: dailyReminderEmail(clientEnv.NEXT_PUBLIC_SITE_URL),
  });
}
