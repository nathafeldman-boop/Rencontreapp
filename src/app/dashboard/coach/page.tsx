import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CoachView } from "@/components/dashboard/coach/coach-view";

export default function ConversationCoachPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/ai" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Coach
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Coach de conversation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Colle ta conversation en cours — obtiens 3 réponses parmi lesquelles choisir.
        </p>
      </div>

      <CoachView />
    </div>
  );
}
