import { AppShell } from "@/components/dashboard/app-shell";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return <AppShell>{children}</AppShell>;
}
