import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BLOG_POSTS } from "@/lib/content/blog-posts";
import { buildMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "Dating Tips & Profile Advice",
  description: "Practical, specific advice on Tinder matches, dating photos, and how AI can improve your dating profile.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Dating tips & profile advice</h1>
      <p className="mt-2 text-muted-foreground">Specific, practical guidance — not generic listicles.</p>

      <div className="mt-10 flex flex-col divide-y divide-border">
        {BLOG_POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex items-center justify-between gap-4 py-6">
            <div>
              <h2 className="font-medium group-hover:text-primary">{post.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString("en-US", { dateStyle: "medium" })} · {post.readingMinutes} min read
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </main>
  );
}
