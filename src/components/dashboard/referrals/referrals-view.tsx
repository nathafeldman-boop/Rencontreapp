"use client";

import Link from "next/link";
import { Check, Copy, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

interface Reward {
  reward_days: number;
  reason: string;
  granted_at: string;
  expires_at: string;
}

interface NextThreshold {
  atInviteCount: number;
  days: number;
  reason: string;
}

const REASON_LABEL: Record<string, string> = {
  first_invite: "Premier ami invité",
  five_invites: "Cinq amis invités",
};

export function ReferralsView({
  referralUrl,
  inviteCount,
  rewards,
  activeBonusUntil,
  nextThreshold,
}: {
  referralUrl: string;
  inviteCount: number;
  rewards: Reward[];
  activeBonusUntil: string | null;
  nextThreshold: NextThreshold | null;
}) {
  const { copiedKey, copy } = useClipboardCopy();
  const copied = copiedKey === "referral-link";

  async function copyLink() {
    await copy(referralUrl, "referral-link");
    track(AnalyticsEvent.ReferralLinkCopied, {});
  }

  const progress = nextThreshold ? Math.min(100, (inviteCount / nextThreshold.atInviteCount) * 100) : 100;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invite tes amis, gagne du Premium</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          1 ami rejoint → +7 jours de Premium. 5 amis → +1 mois offert.
        </p>
      </div>

      {activeBonusUntil && (
        <Badge variant="accent" className="w-fit gap-1.5">
          <Gift className="size-3.5" />
          Premium débloqué jusqu&apos;au {new Date(activeBonusUntil).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
        </Badge>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ton lien d&apos;invitation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input readOnly value={referralUrl} className="font-mono text-xs" />
            <Button variant="outline" onClick={copyLink} className="shrink-0">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-muted-foreground">
                {inviteCount} ami{inviteCount === 1 ? "" : "s"} inscrit{inviteCount === 1 ? "" : "s"}
              </span>
              {nextThreshold && (
                <span className="font-medium">
                  {nextThreshold.atInviteCount - inviteCount} de plus pour +{nextThreshold.days} jours
                </span>
              )}
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Récompenses obtenues</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {rewards.map((reward) => (
              <div key={reward.reason} className="flex items-center justify-between text-sm">
                <span>{REASON_LABEL[reward.reason] ?? reward.reason}</span>
                <span className="text-muted-foreground">+{reward.reward_days} jours</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/dashboard">Retour au tableau de bord</Link>
      </Button>
    </div>
  );
}
