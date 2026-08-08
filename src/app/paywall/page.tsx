import { createClient } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/supabase/signed-photo-urls";
import { getDisplayFirstName } from "@/lib/utils/display-name";
import { PaywallView, type PaywallData } from "@/components/paywall/paywall-view";

const DEMO_DATA: PaywallData = {
  isDemo: true,
  firstName: null,
  overall: 62,
  photo: 58,
  bio: 71,
  attractiveness: 65,
  conversation: 55,
  freeInsights: [
    "Ta première photo est ton plus gros point faible — elle te coûte des swipes avant même que quelqu'un lise ta bio.",
    "Ta bio est générique — elle ne donne rien de précis auquel les gens peuvent répondre.",
  ],
  recommendations: [],
  lockedCount: 5,
  bioExcerpt: null,
  photoCount: 0,
  datingApp: null,
  onboarding: {},
  photoPreviews: [],
  isSimulated: true,
};

const ONBOARDING_QUESTIONS = {
  objective: "What's your main objective?",
  weeklyMatches: "How many matches do you get weekly?",
  biggestProblem: "What's your biggest problem right now?",
  confidence: "How confident are you with your profile?",
} as const;

interface PaywallPageProps {
  searchParams: Promise<{ id?: string; checkout?: string }>;
}

export default async function PaywallPage({ searchParams }: PaywallPageProps) {
  const { id } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <PaywallView data={DEMO_DATA} />;
  }

  const analysisQuery = id
    ? supabase
        .from("analyses")
        .select(
          "id, profile_id, overall_score, photo_score, bio_score, attractiveness_score, conversation_score, free_insights, recommendations, is_simulated"
        )
        .eq("id", id)
        .maybeSingle()
    : supabase
        .from("analyses")
        .select(
          "id, profile_id, overall_score, photo_score, bio_score, attractiveness_score, conversation_score, free_insights, recommendations, is_simulated"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  const { data: analysis } = await analysisQuery;

  if (!analysis) {
    return <PaywallView data={DEMO_DATA} />;
  }

  const profileQuery = analysis.profile_id
    ? supabase.from("profiles").select("bio, photos, dating_app").eq("id", analysis.profile_id).maybeSingle()
    : supabase
        .from("profiles")
        .select("bio, photos, dating_app")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  const [{ data: profile }, { data: answers }, { data: photoAnalyses }] = await Promise.all([
    profileQuery,
    supabase.from("onboarding_answers").select("question, answer").eq("user_id", user.id),
    supabase
      .from("photo_analyses")
      .select("photo_path, position, score, cons, recommendation")
      .eq("analysis_id", analysis.id)
      .order("position", { ascending: true })
      .limit(2),
  ]);

  const findAnswer = (question: string) => answers?.find((a) => a.question === question)?.answer;

  const photoPaths = (photoAnalyses ?? []).map((p) => p.photo_path);
  const signedUrls = photoPaths.length > 0 ? await signPhotoUrls(supabase, photoPaths) : {};

  const data: PaywallData = {
    isDemo: false,
    firstName: getDisplayFirstName(user),
    overall: analysis.overall_score,
    photo: analysis.photo_score ?? 0,
    bio: analysis.bio_score ?? 0,
    attractiveness: analysis.attractiveness_score ?? 0,
    conversation: analysis.conversation_score ?? 0,
    freeInsights: analysis.free_insights,
    recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
    lockedCount: Array.isArray(analysis.recommendations) ? analysis.recommendations.length : 5,
    bioExcerpt: profile?.bio ? profile.bio.slice(0, 60) : null,
    photoCount: profile?.photos?.length ?? 0,
    datingApp: profile?.dating_app ?? null,
    onboarding: {
      objective: findAnswer(ONBOARDING_QUESTIONS.objective),
      weeklyMatches: findAnswer(ONBOARDING_QUESTIONS.weeklyMatches),
      biggestProblem: findAnswer(ONBOARDING_QUESTIONS.biggestProblem),
      confidence: findAnswer(ONBOARDING_QUESTIONS.confidence),
    },
    photoPreviews: (photoAnalyses ?? []).map((p) => ({
      position: p.position,
      score: p.score,
      mainIssue: p.cons?.[0] ?? p.recommendation,
      signedUrl: signedUrls[p.photo_path],
    })),
    isSimulated: analysis.is_simulated,
  };

  return <PaywallView data={data} />;
}
