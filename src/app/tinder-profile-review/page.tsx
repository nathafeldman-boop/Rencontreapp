import type { Metadata } from "next";

import { AppReviewLanding } from "@/components/seo/app-review-landing";
import { getAppReview } from "@/lib/content/app-reviews";
import { buildMetadata } from "@/lib/seo/site";

const content = getAppReview("tinder-profile-review")!;

export const metadata: Metadata = buildMetadata({
  title: content.title,
  description: content.metaDescription,
  path: "/tinder-profile-review",
  keywords: ["tinder profile review", "tinder profile analysis", "improve tinder profile", "ai tinder coach"],
});

export default function TinderProfileReviewPage() {
  return <AppReviewLanding content={content} />;
}
