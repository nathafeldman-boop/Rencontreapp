import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MatchSimulatorView } from "@/components/dashboard/simulator/match-simulator-view";

export default function MatchSimulatorPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/ai" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        FlirtCraft AI
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Simulateur de match</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entraîne-toi à discuter avec un match IA, puis obtiens ton score.
        </p>
      </div>

      <MatchSimulatorView />
    </div>
  );
}
