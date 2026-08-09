"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SITE_NAME } from "@/lib/seo/site";

export function Footer() {
  const pathname = usePathname();

  // The dashboard is an app shell with its own nav (incl. a mobile bottom
  // tab bar) — a marketing footer there both looks out of place and can
  // visually collide with the fixed tabs.
  if (pathname?.startsWith("/dashboard")) return null;

  // /deeplink is a fullscreen, single-CTA interstitial (TikTok/Instagram
  // in-app-browser traffic) — a footer would just add scroll below the
  // fixed full-viewport content for no reason.
  if (pathname?.startsWith("/deeplink")) return null;

  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. Tous droits réservés.
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/mentions-legales" className="hover:text-foreground">
            Mentions légales
          </Link>
          <Link href="/cgv" className="hover:text-foreground">
            CGV
          </Link>
        </nav>
      </div>
    </footer>
  );
}
