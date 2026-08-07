import { createClient } from "@/lib/supabase/server";
import { ResultsView, type ResultsData } from "@/components/results/results-view";

const DEMO_RESULTS: ResultsData = {
  overall: 62,
  photo: 58,
  bio: 71,
  attractiveness: 65,
  conversation: 55,
  freeInsights: [
    "Your first photo is your biggest weakness — it's costing you swipes before anyone reads your bio.",
    "Your bio reads generic — it doesn't give people anything specific to reply to.",
  ],
  lockedCount: 5,
  isDemo: true,
};

interface ResultsPageProps {
  searchParams: Promise<{ id?: string; demo?: string }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { id } = await searchParams;

  if (id) {
    const supabase = await createClient();
    const { data: analysis } = await supabase
      .from("analyses")
      .select("overall_score, photo_score, bio_score, attractiveness_score, conversation_score, free_insights, recommendations")
      .eq("id", id)
      .maybeSingle();

    if (analysis) {
      const data: ResultsData = {
        overall: analysis.overall_score,
        photo: analysis.photo_score ?? 0,
        bio: analysis.bio_score ?? 0,
        attractiveness: analysis.attractiveness_score ?? 0,
        conversation: analysis.conversation_score ?? 0,
        freeInsights: analysis.free_insights,
        lockedCount: Array.isArray(analysis.recommendations) ? analysis.recommendations.length : 5,
        isDemo: false,
      };
      return <ResultsView data={data} />;
    }
  }

  return <ResultsView data={DEMO_RESULTS} />;
}
