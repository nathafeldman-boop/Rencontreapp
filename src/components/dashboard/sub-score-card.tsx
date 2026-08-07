import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

function tierExplanation(label: string, score: number) {
  if (score >= 80) return `${label} is a real strength on your profile right now.`;
  if (score >= 60) return `${label} is solid, with clear room to push higher.`;
  return `${label} is holding your matches back the most.`;
}

export function SubScoreCard({
  label,
  score,
  recommendation,
  improveHref,
}: {
  label: string;
  score: number;
  recommendation?: string;
  improveHref: string;
}) {
  return (
    <Card className="transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-medium">
          {label}
          <span className="text-lg font-semibold">{score}/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Progress value={score} />
        <p className="text-sm text-muted-foreground">{tierExplanation(label, score)}</p>
        {recommendation && (
          <p className="rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">{recommendation}</p>
        )}
        <Button variant="outline" size="sm" className="w-fit" asChild>
          <Link href={improveHref}>
            Improve this
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
