import { createClient } from "@/lib/supabase/server";
import { ResultsView, type ResultsData } from "@/components/results/results-view";

const DEMO_RESULTS: ResultsData = {
  overall: 62,
  photo: 58,
  bio: 71,
  attractiveness: 65,
  conversation: 55,
  freeInsights: [
    "Ta première photo est ton plus gros point faible — elle te coûte des swipes avant même que quelqu'un lise ta bio.",
    "Ta bio est générique — elle ne donne rien de précis auquel les gens peuvent répondre.",
  ],
  lockedCount: 5,
  isDemo: true,
  isSimulated: true,
  biggestProblem: "aucun match",
};

interface ResultsPageProps {
  searchParams: Promise<{ id?: string; demo?: string }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { id } = await searchParams;

  if (id) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: analysis }, { data: problemAnswer }] = await Promise.all([
      supabase
        .from("analyses")
        .select(
          "overall_score, photo_score, bio_score, attractiveness_score, conversation_score, free_insights, recommendations, is_simulated"
        )
        .eq("id", id)
        .maybeSingle(),
      user
        ? supabase
            .from("onboarding_answers")
            .select("answer")
            .eq("user_id", user.id)
            .eq("question", "What's your biggest problem right now?")
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

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
        isSimulated: analysis.is_simulated,
        biggestProblem: problemAnswer?.answer,
      };
      return <ResultsView data={data} />;
    }
  }

  return <ResultsView data={DEMO_RESULTS} />;
}
