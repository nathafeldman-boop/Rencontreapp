import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MatchSimulatorView } from "@/components/dashboard/simulator/match-simulator-view";

export default function MatchSimulatorPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Match Simulator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practice a conversation with an AI match, then get your score.
        </p>
      </div>

      <MatchSimulatorView />
    </div>
  );
}
