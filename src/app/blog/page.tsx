import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BLOG_POSTS } from "@/lib/content/blog-posts";
import { buildMetadata } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "Conseils de rencontre & astuces de profil",
  description: "Des conseils pratiques et précis sur les matchs Tinder, les photos de rencontre, et comment ton coach peut améliorer ton profil.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <JsonLd data={breadcrumbJsonLd([{ name: "Blog", path: "/blog" }])} />
      <h1 className="text-3xl font-semibold tracking-tight">Conseils de rencontre & astuces de profil</h1>
      <p className="mt-2 text-muted-foreground">Des conseils précis et pratiques — pas des listes génériques.</p>

      <div className="mt-10 flex flex-col divide-y divide-border">
        {BLOG_POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex items-center justify-between gap-4 py-6">
            <div>
              <h2 className="font-medium group-hover:text-primary">{post.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })} · {post.readingMinutes} min de lecture
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </main>
  );
}
