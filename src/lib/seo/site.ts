import type { Metadata } from "next";

import { clientEnv } from "@/lib/env";

export const SITE_NAME = "Flirtcraft";
export const SITE_URL = clientEnv.NEXT_PUBLIC_SITE_URL;
export const SITE_DESCRIPTION =
  "Envoie ton profil Tinder, Hinge ou Bumble et obtiens une analyse par IA avec des recommandations concrètes pour avoir plus de matchs.";

/**
 * Shared metadata builder so every page gets consistent OpenGraph/Twitter
 * card fields without repeating the whole block. Pass a page-relative
 * `path` (e.g. "/tinder-profile-review") for the canonical + OG url.
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
