import Link from "next/link";

import { SITE_NAME } from "@/lib/seo/site";

export function Footer() {
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
