import type { Metadata } from "next";

import { SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { DeeplinkView } from "@/components/marketing/deeplink-view";

interface DeeplinkPageProps {
  searchParams: Promise<{ img?: string; title?: string; source?: string; dest?: string; campaign?: string; cta?: string }>;
}

const DEFAULT_TITLE = "Ton profil te fait-il perdre des matchs ?";
const DEFAULT_IMG = "/opengraph-image";
const DEFAULT_CTA = "Rejoins Flirtcraft";
const ALLOWED_SOURCES = ["tiktok", "instagram"] as const;

function sanitizeSource(source: string | undefined): string {
  const normalized = source?.toLowerCase().trim();
  return (ALLOWED_SOURCES as readonly string[]).includes(normalized ?? "") ? normalized! : "social";
}

/** Only ever a same-site relative path — never let `dest` become an open redirect. */
function sanitizeDest(dest: string | undefined): string {
  if (dest && dest.startsWith("/") && !dest.startsWith("//")) return dest;
  return "/";
}

function buildDestUrl(dest: string, source: string, campaign: string | undefined): string {
  const url = new URL(dest, SITE_URL);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  if (campaign) url.searchParams.set("utm_campaign", campaign.slice(0, 60));
  return url.toString();
}

/**
 * Interstitial shown when a TikTok/Instagram in-app browser opens a
 * Flirtcraft link — those embedded browsers routinely break Google OAuth
 * (Google blocks sign-in inside known embedded webviews) and can behave
 * oddly with cookies, so dropping a cold social visitor straight onto
 * /auth/login risks silently losing them. This page recreates the post
 * they just saw (image + caption) and funnels them through one deliberate
 * tap instead. Not indexed — this is a traffic-routing page, not content.
 *
 * Query params: img (path to the post image, ideally same-origin — see
 * fetch-photo-as-data-url.ts-style CSP concerns, external CDN hotlinks can
 * get blocked by img-src), title (post caption), source (tiktok|instagram),
 * dest (relative path to send them to after the tap, default "/"),
 * campaign (optional utm_campaign), cta (optional button label override).
 */
export async function generateMetadata({ searchParams }: DeeplinkPageProps): Promise<Metadata> {
  const params = await searchParams;
  const title = params.title?.slice(0, 200) || DEFAULT_TITLE;
  const img = params.img || DEFAULT_IMG;

  return {
    title: `${title} — ${SITE_NAME}`,
    robots: { index: false, follow: false },
    openGraph: { title, images: [{ url: img }] },
    twitter: { card: "summary_large_image", title, images: [img] },
  };
}

export default async function DeeplinkPage({ searchParams }: DeeplinkPageProps) {
  const params = await searchParams;

  const title = params.title?.slice(0, 200) || DEFAULT_TITLE;
  const img = params.img || DEFAULT_IMG;
  const source = sanitizeSource(params.source);
  const dest = sanitizeDest(params.dest);
  const ctaLabel = params.cta?.slice(0, 40) || DEFAULT_CTA;
  const destUrl = buildDestUrl(dest, source, params.campaign);

  return <DeeplinkView img={img} title={title} ctaLabel={ctaLabel} source={source} destUrl={destUrl} />;
}
