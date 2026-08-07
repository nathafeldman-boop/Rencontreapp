import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CoachView } from "@/components/dashboard/coach/coach-view";

export default function ConversationCoachPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conversation Coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your conversation so far — get 3 replies to choose from.
        </p>
      </div>

      <CoachView />
    </div>
  );
}
