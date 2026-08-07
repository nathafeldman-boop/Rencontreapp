import { Camera, MessageCircle, Sparkles, Swords, CalendarCheck, Check, Minus, Trophy } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViewTracker } from "@/components/dashboard/view-tracker";
import { UpgradeCta } from "@/components/premium/upgrade-cta";
import { AnalyticsEvent } from "@/lib/analytics/events";

const MONTHLY_TOOLS = [
  {
    icon: Camera,
    label: "Photo Optimizer",
    detail: "Unlimited photo-by-photo scoring and ordering advice, refreshed anytime you swap a photo.",
  },
  {
    icon: Sparkles,
    label: "Bio Generator",
    detail: "Unlimited AI-written bios tailored to your voice, goal, and dating app.",
  },
  {
    icon: MessageCircle,
    label: "Conversation Coach",
    detail: "Unlimited reply suggestions across Flirt, Funny, Natural, and Confident modes.",
  },
  {
    icon: Swords,
    label: "Match Simulator",
    detail: "Practice real conversations with an AI match and get a scored breakdown after every session.",
  },
  {
    icon: CalendarCheck,
    label: "Improvement Plan",
    detail: "A personalized day-by-day plan that adapts to your goal and biggest sticking point.",
  },
  {
    icon: Trophy,
    label: "Score tracking & badges",
    detail: "Full score history, levels, and badges as your profile improves week over week.",
  },
];

const COMPARISON_ROWS: { label: string; free: string | boolean; premium: string | boolean }[] = [
  { label: "Dating Score overview", free: true, premium: true },
  { label: "Full score breakdown (photo, bio, attractiveness, conversation)", free: false, premium: true },
  { label: "Personalized recommendations", free: "2 free insights", premium: "Unlimited" },
  { label: "Photo Optimizer", free: false, premium: true },
  { label: "Bio Generator", free: false, premium: true },
  { label: "Conversation Coach (4 modes)", free: false, premium: true },
  { label: "Match Simulator", free: false, premium: true },
  { label: "Personalized Improvement Plan", free: false, premium: true },
  { label: "Score history, levels & badges", free: false, premium: true },
  { label: "Shareable Dating Score card", free: false, premium: true },
  { label: "Invite friends for rewards", free: true, premium: true },
];

export default async function PremiumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const hasBillingAccount = Boolean(subscription?.stripe_customer_id);

  return (
    <div className="flex flex-col gap-8">
      <ViewTracker event={AnalyticsEvent.PaywallViewed} properties={{ trigger: "premium_page" }} />

      <div className="text-center">
        <Badge variant="accent">Premium</Badge>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Everything you get, every month</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One subscription, five AI tools, and a coach that gets sharper the more you use it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MONTHLY_TOOLS.map((tool) => (
          <Card key={tool.label}>
            <CardContent className="flex gap-3 pt-6">
              <tool.icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{tool.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tool.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Free vs Premium</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Feature</th>
                  <th className="px-4 py-3 text-center font-medium">Free</th>
                  <th className="px-4 py-3 text-center font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{row.label}</td>
                    <td className="px-4 py-3 text-center">
                      <ComparisonCell value={row.free} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ComparisonCell value={row.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto w-full max-w-sm">
        <UpgradeCta hasBillingAccount={hasBillingAccount} />
        <p className="mt-3 text-center text-xs text-muted-foreground">Cancel anytime. No commitment.</p>
      </div>
    </div>
  );
}

function ComparisonCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-primary" />;
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/50" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}
