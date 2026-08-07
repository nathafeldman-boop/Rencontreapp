import Link from "next/link";
import { ArrowRight, Camera, MessageCircle, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * Placeholder widgets — wired to `analyses` / `subscriptions` once the AI
 * pipeline and Stripe Checkout are built.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An overview of your profile and your progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest overall score</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-2xl font-semibold text-primary-foreground">
            62
          </div>
          <div className="flex-1 space-y-3">
            <ScoreLine label="Photos" value={58} />
            <ScoreLine label="Bio" value={71} />
            <ScoreLine label="Conversation" value={55} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction href="/onboarding" icon={Camera} label="Run a new analysis" />
        <QuickAction href="/results" icon={Sparkles} label="View my recommendations" />
        <QuickAction href="/settings" icon={MessageCircle} label="Manage my subscription" />
      </div>
    </div>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Camera;
  label: string;
}) {
  return (
    <Button variant="outline" className="h-auto justify-between py-4" asChild>
      <Link href={href}>
        <span className="flex items-center gap-2">
          <Icon className="size-4" />
          {label}
        </span>
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}
