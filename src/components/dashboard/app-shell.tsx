"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Handshake,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  Wand2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { themedDatingApp } from "@/lib/theme/dating-app-theme";
import type { DatingApp } from "@/types/database.types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/progression", label: "Progression", icon: LineChart },
  { href: "/dashboard/optimize", label: "Optimisation", icon: Wand2 },
  { href: "/dashboard/ai", label: "Coach", icon: Sparkles },
  { href: "/dashboard/stats", label: "Statistiques", icon: TrendingUp },
  { href: "/dashboard/profile", label: "Mon profil", icon: User },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

const AFFILIATE_NAV_ITEM = { href: "/affilie", label: "Affiliation", icon: Handshake };

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, datingApp }: { children: React.ReactNode; datingApp?: DatingApp | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAffiliate, setIsAffiliate] = useState(false);

  // No page anywhere links to /affilie — an affiliate's only way in was a
  // one-off DM'd URL, which is exactly how one lost her way back to her own
  // dashboard. This adds a permanent, always-reachable entry point for
  // accounts that actually are affiliates; everyone else sees nothing new.
  useEffect(() => {
    let cancelled = false;
    async function checkAffiliate() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("affiliates").select("id").eq("user_id", user.id).maybeSingle();
      if (!cancelled && data) setIsAffiliate(true);
    }
    checkAffiliate();
    return () => {
      cancelled = true;
    };
  }, []);

  const navItems = isAffiliate ? [...NAV_ITEMS, AFFILIATE_NAV_ITEM] : NAV_ITEMS;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex flex-1" data-dating-app={themedDatingApp(datingApp)}>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card sm:flex">
        <Link href="/dashboard" className="flex items-center gap-2 px-6 py-6 font-semibold">
          <Image src="/brand/mark.png" alt="" width={28} height={28} className="shrink-0" priority />
          Flirtcraft
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive(pathname, item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          className="mx-3 mb-6 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <LogOut className="size-4" />
          Se déconnecter
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Image src="/brand/mark.png" alt="" width={20} height={20} className="shrink-0" priority />
            Flirtcraft
          </Link>
          <button
            onClick={handleSignOut}
            aria-label="Se déconnecter"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <LogOut className="size-4" />
          </button>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 px-6 py-10 pb-28 sm:pb-10">{children}</main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              isActive(pathname, item.href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
