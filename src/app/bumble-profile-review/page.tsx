import type { Metadata } from "next";

import { AppReviewLanding } from "@/components/seo/app-review-landing";
import { getAppReview } from "@/lib/content/app-reviews";
import { buildMetadata } from "@/lib/seo/site";

const content = getAppReview("bumble-profile-review")!;

export const metadata: Metadata = buildMetadata({
  title: content.title,
  description: content.metaDescription,
  path: "/bumble-profile-review",
  keywords: ["analyse profil bumble", "avis profil bumble", "améliorer profil bumble", "coach profil bumble"],
});

export default function BumbleProfileReviewPage() {
  return <AppReviewLanding content={content} />;
}
