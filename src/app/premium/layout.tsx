import { AppShell } from "@/components/dashboard/app-shell";

export default function PremiumLayout({ children }: LayoutProps<"/premium">) {
  return <AppShell>{children}</AppShell>;
}
