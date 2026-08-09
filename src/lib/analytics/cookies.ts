/** No heavy imports here on purpose — read by src/proxy.ts on every request. */
export const LANDING_REFERRER_COOKIE = "mai_referrer";
export const LANDING_UTM_COOKIE = "mai_utm";

/** Anonymous visitor id — lets pre-signup events (landing view, etc.) be persisted and later claimed at signup. */
export const ANON_ID_COOKIE = "mai_anon";
