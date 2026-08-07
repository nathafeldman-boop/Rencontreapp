export interface AppReviewContent {
  slug: "tinder-profile-review" | "hinge-profile-review" | "bumble-profile-review";
  appName: "Tinder" | "Hinge" | "Bumble";
  title: string;
  metaDescription: string;
  headline: string;
  intro: string;
  painPoints: string[];
  faq: { question: string; answer: string }[];
}

export const APP_REVIEWS: AppReviewContent[] = [
  {
    slug: "tinder-profile-review",
    appName: "Tinder",
    title: "Free Tinder Profile Review — AI Analysis",
    metaDescription:
      "Get a free AI-powered review of your Tinder profile. See exactly which photos are costing you swipes and how to fix your bio in under 60 seconds.",
    headline: "Get your Tinder profile reviewed by AI, free",
    intro:
      "Tinder is almost entirely decided in the first half-second — your lead photo does most of the work. Upload your profile and get a photo-by-photo breakdown of what's helping and what's costing you swipes.",
    painPoints: [
      "Your main photo isn't converting swipes, but you don't know if it's the lighting, the framing, or the photo itself.",
      "You're not sure if your bio is helping or just taking up space.",
      "You get some matches but conversations die within 2-3 messages.",
    ],
    faq: [
      {
        question: "Is the Tinder profile review really free?",
        answer:
          "Yes — the first analysis (overall score plus a couple of specific insights) is free. A full breakdown with every recommendation unlocks with MatchAI Premium.",
      },
      {
        question: "How long does the Tinder review take?",
        answer: "About 60 seconds after you upload your photos and bio.",
      },
      {
        question: "Does this work if I already have matches?",
        answer:
          "Yes. The review is just as useful for improving conversation rate and match quality as it is for someone starting from zero.",
      },
    ],
  },
  {
    slug: "hinge-profile-review",
    appName: "Hinge",
    title: "Free Hinge Profile Review — AI Analysis",
    metaDescription:
      "Get a free AI-powered review of your Hinge profile — photos, prompts, and overall profile strength scored in under 60 seconds.",
    headline: "Get your Hinge profile reviewed by AI, free",
    intro:
      "Hinge rewards specificity — vague prompts and generic photos blend into everyone else's profile. Upload yours and see exactly which parts are working and which are getting scrolled past.",
    painPoints: [
      "Your prompts read like everyone else's — nothing specific enough to reply to.",
      "You're getting likes but not enough conversations start.",
      "You don't know if your photo order is actually helping or hurting.",
    ],
    faq: [
      {
        question: "Is the Hinge profile review really free?",
        answer:
          "Yes — the first analysis (overall score plus a couple of specific insights) is free. A full breakdown with every recommendation unlocks with MatchAI Premium.",
      },
      {
        question: "Does the review cover my prompts specifically?",
        answer:
          "Your bio/prompt text is scored for originality, personality, and how easy it is to reply to, alongside your photos.",
      },
      {
        question: "How is this different from just asking a friend?",
        answer:
          "It's specific, consistent, and based on the same photo and bio patterns that actually predict match and reply rates — not a one-off opinion.",
      },
    ],
  },
  {
    slug: "bumble-profile-review",
    appName: "Bumble",
    title: "Free Bumble Profile Review — AI Analysis",
    metaDescription:
      "Get a free AI-powered review of your Bumble profile. See what's making it easy — or hard — for a match to open the conversation first.",
    headline: "Get your Bumble profile reviewed by AI, free",
    intro:
      "On Bumble, she messages first — which means your profile needs to make that easy. Upload yours and see exactly what's working and what's making people hesitate.",
    painPoints: [
      "You get matches, but almost nobody sends the first message.",
      "Your bio doesn't give anyone an easy opening line.",
      "You're not sure which photo should actually be leading your profile.",
    ],
    faq: [
      {
        question: "Is the Bumble profile review really free?",
        answer:
          "Yes — the first analysis (overall score plus a couple of specific insights) is free. A full breakdown with every recommendation unlocks with MatchAI Premium.",
      },
      {
        question: "Can this help more people message me first?",
        answer:
          "Yes — that's one of the specific things the bio and photo analysis is scored on: how easy your profile makes it to send that first message.",
      },
      {
        question: "Does it work for men and women?",
        answer: "Yes, the analysis adapts to the gender and goals you provide during onboarding.",
      },
    ],
  },
];

export function getAppReview(slug: string) {
  return APP_REVIEWS.find((review) => review.slug === slug);
}
