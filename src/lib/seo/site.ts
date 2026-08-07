import type { Metadata } from "next";

import { clientEnv } from "@/lib/env";

export const SITE_NAME = "MatchAI";
export const SITE_URL = clientEnv.NEXT_PUBLIC_SITE_URL;
export const SITE_DESCRIPTION =
  "Upload your Tinder, Hinge, or Bumble profile and get an AI-powered analysis with concrete recommendations to get more matches.";

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
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
