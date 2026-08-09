import { AppShell } from "@/components/dashboard/app-shell";

/**
 * Deliberately outside `app/dashboard/layout.tsx`'s subscription gate — an
 * affiliate doesn't need to be a paying Flirtcraft subscriber to see their
 * own commission dashboard. `src/lib/supabase/proxy.ts` still requires
 * authentication (see PROTECTED_PREFIXES).
 */
export default function AffiliateLayout({ children }: LayoutProps<"/affilie">) {
  return <AppShell>{children}</AppShell>;
}
