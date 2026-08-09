export type InAppBrowserApp = "tiktok" | "instagram" | "facebook" | null;
export type MobilePlatform = "ios" | "android" | "other";

/**
 * TikTok/Instagram/Facebook's in-app browsers routinely break Google OAuth
 * (Google blocks sign-in inside recognized embedded webviews) and users
 * have no idea they need to escape to a real browser — this is the same
 * failure mode that caused signup drop-off on a previous project. Detect
 * it from the UA so callers can route around it instead of silently
 * failing at the Google button.
 */
export function detectInAppBrowser(userAgent: string): InAppBrowserApp {
  const ua = userAgent.toLowerCase();
  if (ua.includes("bytedancewebview") || ua.includes("tiktok") || ua.includes("musical_ly")) return "tiktok";
  if (ua.includes("instagram")) return "instagram";
  if (ua.includes("fban") || ua.includes("fbav")) return "facebook";
  return null;
}

export function detectMobilePlatform(userAgent: string): MobilePlatform {
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  if (/android/i.test(userAgent)) return "android";
  return "other";
}

/**
 * Android only: wraps a URL so the OS opens it in Chrome instead of the
 * current in-app webview — `intent://` URLs are resolved by Android
 * itself, bypassing the webview entirely, *if* the webview actually hands
 * off the unrecognized scheme to the OS instead of swallowing it. TikTok
 * and Instagram have both hardened their in-app browsers against exactly
 * this escape trick in some app versions, so this isn't guaranteed to
 * work — `package=` + `S.browser_fallback_url` is the more complete,
 * more broadly-supported form (vs a bare `intent://…#Intent;scheme=https;end`),
 * but there's no version of this URL that a webview choosing not to
 * forward it at all can be made to work with. No reliable equivalent
 * exists for iOS either way (Apple doesn't expose one to plain web
 * pages), so iOS gets on-screen instructions instead.
 */
export function androidEscapeUrl(httpsUrl: string): string {
  const withoutScheme = httpsUrl.replace(/^https?:\/\//, "");
  const fallback = encodeURIComponent(httpsUrl);
  return `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}
