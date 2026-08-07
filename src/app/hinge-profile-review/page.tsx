import type { Metadata } from "next";

import { AppReviewLanding } from "@/components/seo/app-review-landing";
import { getAppReview } from "@/lib/content/app-reviews";
import { buildMetadata } from "@/lib/seo/site";

const content = getAppReview("hinge-profile-review")!;

export const metadata: Metadata = buildMetadata({
  title: content.title,
  description: content.metaDescription,
  path: "/hinge-profile-review",
  keywords: ["hinge profile review", "hinge profile analysis", "improve hinge profile", "ai hinge coach"],
});

export default function HingeProfileReviewPage() {
  return <AppReviewLanding content={content} />;
}
