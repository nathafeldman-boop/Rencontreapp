interface RewardLike {
  expires_at: string;
}

/** Latest `expires_at` among still-unexpired rewards, or null. Pulled out of
 * any component body — the `react-hooks/purity` rule (rightly) disallows
 * calling `Date.now()` directly inside a render function. */
export function getActiveBonusUntil(rewards: RewardLike[]): string | null {
  const now = Date.now();
  return rewards
    .filter((r) => new Date(r.expires_at).getTime() > now)
    .reduce<string | null>((latest, r) => (!latest || r.expires_at > latest ? r.expires_at : latest), null);
}
