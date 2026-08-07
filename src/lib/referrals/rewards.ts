/** Single source of truth for referral reward tiers — used by both the
 * attribution flow (grants) and the stats endpoint (progress display). */
export const REWARD_THRESHOLDS = [
  { atInviteCount: 1, days: 7, reason: "first_invite" },
  { atInviteCount: 5, days: 30, reason: "five_invites" },
] as const;
