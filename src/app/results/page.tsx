import { Suspense } from "react";

import { ResultsView } from "@/components/results/results-view";

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsView />
    </Suspense>
  );
}
