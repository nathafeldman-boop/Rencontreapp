import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo/site";
import { APP_REVIEWS } from "@/lib/content/app-reviews";
import { BLOG_POSTS } from "@/lib/content/blog-posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/auth/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/ai-dating-coach`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/tinder-bio-generator`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cgv`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const reviewPages: MetadataRoute.Sitemap = APP_REVIEWS.map((review) => ({
    url: `${SITE_URL}/${review.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...reviewPages, ...blogPages];
}
