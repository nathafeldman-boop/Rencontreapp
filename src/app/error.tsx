"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reportError } from "@/lib/observability/report-error";

/**
 * Segment-level error boundary — Next.js renders this in place of any
 * page (or its children) that throws during render. `reset()` re-tries
 * the segment without a full reload; the home link is the universal
 * escape hatch since this boundary can be hit from anywhere in the tree.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest });
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That&apos;s on us, not you. Try again, or head back home.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>
          <RotateCw className="size-4" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
