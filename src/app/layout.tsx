import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { PostHogProvider } from "@/lib/analytics/posthog-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, softwareApplicationJsonLd } from "@/lib/seo/structured-data";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { clientEnv } from "@/lib/env";
import { Footer } from "@/components/marketing/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Obtiens plus de matchs grâce à l'IA`, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Obtiens plus de matchs grâce à l'IA`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Obtiens plus de matchs grâce à l'IA`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Warm up connections to the origins every page needs, so the
            first real request to each (auth/session check, analytics) doesn't
            pay DNS+TLS setup cost on top of its own latency. */}
        <link rel="preconnect" href={clientEnv.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://eu.i.posthog.com" />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={softwareApplicationJsonLd()} />
      </head>
      <body className="min-h-full flex flex-col">
        <PostHogProvider>{children}</PostHogProvider>
        <Footer />
      </body>
    </html>
  );
}
