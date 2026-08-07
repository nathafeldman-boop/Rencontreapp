import { AppShell } from "@/components/dashboard/app-shell";

/**
 * Deliberately outside `app/dashboard/layout.tsx`'s subscription gate — a
 * free user needs to reach this page to get their invite link and start
 * earning referral rewards in the first place. `src/proxy.ts` still
 * requires authentication (see PROTECTED_PREFIXES).
 */
export default function ReferralsLayout({ children }: LayoutProps<"/referrals">) {
  return <AppShell>{children}</AppShell>;
}
