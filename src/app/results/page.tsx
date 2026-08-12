import { createClient } from "@/lib/supabase/server";
import { ResultsView, type ResultsData } from "@/components/results/results-view";
import type { Recommendation } from "@/types/database.types";

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
  recommendations: [
    {
      category: "photos",
      title: "Problème n°1 : ta photo principale ne te met pas en valeur",
      detail: "Elle est prise de trop loin et mal éclairée (Photos : 58/100) — remplace-la par une photo nette, en lumière naturelle, où ton visage est clairement visible.",
    },
    {
      category: "bio",
      title: "Problème n°2 : ta bio ne donne rien à quoi répondre",
      detail: "Elle reste générique (Bio : 71/100) — ajoute un détail précis et un peu inhabituel sur toi pour donner une vraie accroche de conversation.",
    },
    {
      category: "conversation",
      title: "Gain rapide",
      detail: "Termine ta bio par une question légère — ça transforme ton profil en amorce de conversation plutôt qu'en simple description.",
    },
    {
      category: "photos",
      title: "Plus gros potentiel",
      detail: "Ajoute une photo qui te montre en train de faire quelque chose de précis (sport, hobby) — ça donne un sujet de conversation concret et prouve que ta première photo n'est pas un coup de chance.",
    },
    {
      category: "bio",
      title: "Version optimisée de ta bio",
      detail: "Passionné de rando le week-end, en pleine reconversion vers le dev — je cherche quelqu'un pour découvrir les meilleurs brunchs de la ville. Tu as un spot à me conseiller ?",
    },
  ],
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

    const [{ data: analysis }, { data: problemAnswer }, { data: profile }] = await Promise.all([
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
      user
        ? supabase
            .from("profiles")
            .select("dating_app")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (analysis) {
      const data: ResultsData = {
        id,
        overall: analysis.overall_score,
        photo: analysis.photo_score ?? 0,
        bio: analysis.bio_score ?? 0,
        attractiveness: analysis.attractiveness_score ?? 0,
        conversation: analysis.conversation_score ?? 0,
        freeInsights: analysis.free_insights,
        recommendations: Array.isArray(analysis.recommendations) ? (analysis.recommendations as Recommendation[]) : [],
        isDemo: false,
        isSimulated: analysis.is_simulated,
        biggestProblem: problemAnswer?.answer,
        datingApp: profile?.dating_app,
      };
      return <ResultsView data={data} />;
    }
  }

  return <ResultsView data={DEMO_RESULTS} />;
}
