import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd } from "@/lib/seo/structured-data";
import { BLOG_POSTS, getBlogPost } from "@/lib/content/blog-posts";
import { buildMetadata } from "@/lib/seo/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          datePublished: post.publishedAt,
        })}
      />

      <Link href="/blog" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        All articles
      </Link>

      <article className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {new Date(post.publishedAt).toLocaleDateString("en-US", { dateStyle: "medium" })} · {post.readingMinutes} min read
        </p>

        <div className="mt-8 flex flex-col gap-8">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <div className="mt-2 flex flex-col gap-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <div className="mt-12 rounded-xl border border-primary/30 bg-accent p-6 text-center">
        <p className="font-medium text-accent-foreground">See what this looks like on your own profile</p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/auth/login">
              Analyze My Profile Free
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
