import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Flirtcraft",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col bg-secondary/20">{children}</div>;
}
