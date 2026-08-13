import type { WeeklyReport } from "@/lib/reports/weekly-report";

const BRAND_FROM = "#ec4899";
const BRAND_TO = "#8b5cf6";

function baseLayout(body: string, preheader: string) {
  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <span style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 32px 0;">
                <span style="font-size:18px;font-weight:700;background:linear-gradient(135deg,${BRAND_FROM},${BRAND_TO});-webkit-background-clip:text;background-clip:text;color:${BRAND_FROM};">Flirtcraft</span>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 32px;color:#1f2937;font-size:15px;line-height:1.6;">
                ${body}
              </td>
            </tr>
          </table>
          <p style="margin-top:20px;font-size:12px;color:#9ca3af;">Flirtcraft — Analyse et coaching de profil de rencontre par ton coach.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 24px;border-radius:9999px;background:${BRAND_FROM};color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;">${label}</a>`;
}

export function welcomeEmail(siteUrl: string) {
  return baseLayout(
    `<p style="margin:0 0 4px;font-size:17px;font-weight:600;">Bienvenue sur Flirtcraft 👋</p>
     <p style="margin:0 0 12px;color:#6b7280;">Ton compte est prêt. Envoie tes photos et ta bio pour obtenir ton premier Dating Score en moins d'une minute.</p>
     ${button("Lancer mon analyse", `${siteUrl}/onboarding`)}`,
    "Ton compte Flirtcraft est prêt — lance ta première analyse."
  );
}

export function referralRewardEmail(siteUrl: string, rewardDays: number) {
  return baseLayout(
    `<p style="margin:0 0 4px;font-size:17px;font-weight:600;">Tu viens de débloquer ${rewardDays} jours de Premium 🎁</p>
     <p style="margin:0 0 12px;color:#6b7280;">Un(e) ami(e) que tu as invité(e) a rejoint Flirtcraft. Ton Premium a été prolongé automatiquement — rien à faire de ton côté.</p>
     ${button("Voir mon compte", `${siteUrl}/dashboard`)}`,
    `Tu as débloqué ${rewardDays} jours de Premium sur Flirtcraft.`
  );
}

export function dailyReminderEmail(siteUrl: string) {
  return baseLayout(
    `<p style="margin:0 0 4px;font-size:17px;font-weight:600;">Ton point du jour 📊</p>
     <p style="margin:0 0 12px;color:#6b7280;">Tinder et Meetic ne permettent pas de connexion automatique — prends
     30 secondes pour mettre à jour tes matchs, conversations et dates du jour toi-même. Un nouveau match ?
     Demande à ton coach quoi répondre avant de te lancer.</p>
     ${button("Mettre à jour mes stats", `${siteUrl}/dashboard/stats`)}
     <p style="margin:16px 0 0;"><a href="${siteUrl}/dashboard/ai" style="color:#ec4899;text-decoration:none;font-weight:600;">Ou va directement parler à ton coach →</a></p>
     <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">Tu peux désactiver ce rappel à tout moment depuis Réglages.</p>`,
    "Ton rappel quotidien Flirtcraft — mets à jour tes stats en 30 secondes."
  );
}

export function relaunchFixedEmail(siteUrl: string) {
  return baseLayout(
    `<p style="margin:0 0 4px;font-size:17px;font-weight:600;">Ton avis compte 🙏</p>
     <p style="margin:0 0 12px;color:#6b7280;">On a vu que ton expérience sur le Photo Optimizer n'était pas top —
     le score d'une même photo pouvait changer plusieurs fois de suite sans raison, juste en réorganisant tes
     photos. On a trouvé le problème et corrigé : le score ne se recalcule plus qu'une fois, une fois que tu as
     fini de choisir ton ordre.</p>
     <p style="margin:0 0 12px;color:#6b7280;">Ce n'est pas un simple message — c'est réellement corrigé. On voulait
     te le dire et te proposer de retenter, avec toute l'attention que ça mérite cette fois.</p>
     ${button("Retourner sur mon profil", `${siteUrl}/dashboard/photos`)}`,
    "On a corrigé ce qui n'allait pas — reviens y jeter un œil."
  );
}

export function weeklyReportEmail(siteUrl: string, report: WeeklyReport) {
  const deltaLine =
    report.scoreDelta === null
      ? ""
      : `<p style="margin:8px 0 0;color:${report.scoreDelta >= 0 ? "#16a34a" : "#6b7280"};font-weight:600;">${
          report.scoreDelta >= 0 ? "+" : ""
        }${report.scoreDelta} points cette semaine</p>`;

  const openersList = report.openers
    .map((o) => `<li style="margin:0 0 8px;">${o}</li>`)
    .join("");

  return baseLayout(
    `<p style="margin:0 0 4px;font-size:17px;font-weight:600;">Ton rapport hebdomadaire</p>
     <p style="margin:0 0 4px;color:#6b7280;">Ton Dating Score actuel :</p>
     <p style="margin:0;font-size:32px;font-weight:700;">${report.latestScore}<span style="font-size:16px;color:#9ca3af;">/100</span></p>
     ${deltaLine}
     <p style="margin:20px 0 8px;font-weight:600;">3 accroches à tester cette semaine</p>
     <ul style="margin:0;padding-left:18px;color:#374151;">${openersList}</ul>
     ${button("Voir mon rapport complet", `${siteUrl}/dashboard`)}`,
    `Ton Dating Score cette semaine : ${report.latestScore}/100`
  );
}
