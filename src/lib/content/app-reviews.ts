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
    title: "Analyse de profil Tinder gratuite — par IA",
    metaDescription:
      "Obtiens une analyse gratuite de ton profil Tinder par IA. Découvre exactement quelles photos te coûtent des matchs et comment corriger ta bio en moins de 60 secondes.",
    headline: "Fais analyser ton profil Tinder par une IA, gratuitement",
    intro:
      "Sur Tinder, tout se joue presque entièrement dans la première demi-seconde — ta photo principale fait l'essentiel du travail. Envoie ton profil et obtiens un décryptage photo par photo de ce qui t'aide et de ce qui te coûte des swipes.",
    painPoints: [
      "Ta photo principale ne convertit pas les swipes, mais tu ne sais pas si c'est la lumière, le cadrage, ou la photo elle-même.",
      "Tu n'es pas sûr(e) que ta bio t'aide ou si elle ne fait qu'occuper de la place.",
      "Tu as des matchs, mais les conversations meurent après 2-3 messages.",
    ],
    faq: [
      {
        question: "L'analyse de profil Tinder est-elle vraiment gratuite ?",
        answer:
          "Oui — la première analyse (score global plus quelques recommandations spécifiques) est gratuite. Le décryptage complet avec toutes les recommandations se débloque avec Flirtcraft Premium.",
      },
      {
        question: "Combien de temps prend l'analyse Tinder ?",
        answer: "Environ 60 secondes après l'envoi de tes photos et de ta bio.",
      },
      {
        question: "Est-ce que ça fonctionne si j'ai déjà des matchs ?",
        answer:
          "Oui. L'analyse est tout aussi utile pour améliorer ton taux de conversation et la qualité de tes matchs que pour quelqu'un qui part de zéro.",
      },
    ],
  },
  {
    slug: "hinge-profile-review",
    appName: "Hinge",
    title: "Analyse de profil Hinge gratuite — par IA",
    metaDescription:
      "Obtiens une analyse gratuite de ton profil Hinge par IA — photos, prompts, et solidité globale du profil notés en moins de 60 secondes.",
    headline: "Fais analyser ton profil Hinge par une IA, gratuitement",
    intro:
      "Hinge récompense la spécificité — les prompts vagues et les photos génériques se fondent dans la masse. Envoie ton profil et vois exactement quelles parties fonctionnent et lesquelles se font scroller.",
    painPoints: [
      "Tes prompts ressemblent à ceux de tout le monde — rien d'assez précis pour donner envie de répondre.",
      "Tu reçois des likes, mais pas assez de conversations démarrent.",
      "Tu ne sais pas si l'ordre de tes photos t'aide vraiment ou te dessert.",
    ],
    faq: [
      {
        question: "L'analyse de profil Hinge est-elle vraiment gratuite ?",
        answer:
          "Oui — la première analyse (score global plus quelques recommandations spécifiques) est gratuite. Le décryptage complet avec toutes les recommandations se débloque avec Flirtcraft Premium.",
      },
      {
        question: "L'analyse couvre-t-elle spécifiquement mes prompts ?",
        answer:
          "Le texte de ta bio et de tes prompts est noté sur l'originalité, la personnalité, et la facilité à y répondre, en plus de tes photos.",
      },
      {
        question: "En quoi est-ce différent de demander à un ami ?",
        answer:
          "C'est précis, cohérent, et basé sur les mêmes schémas de photos et de bio qui prédisent réellement les taux de match et de réponse — pas un avis isolé.",
      },
    ],
  },
  {
    slug: "bumble-profile-review",
    appName: "Bumble",
    title: "Analyse de profil Bumble gratuite — par IA",
    metaDescription:
      "Obtiens une analyse gratuite de ton profil Bumble par IA. Découvre ce qui facilite — ou complique — le premier message pour un match.",
    headline: "Fais analyser ton profil Bumble par une IA, gratuitement",
    intro:
      "Sur Bumble, c'est elle qui écrit en premier — ce qui veut dire que ton profil doit rendre ça facile. Envoie le tien et vois exactement ce qui fonctionne et ce qui fait hésiter.",
    painPoints: [
      "Tu as des matchs, mais presque personne n'envoie le premier message.",
      "Ta bio ne donne aucune accroche facile pour démarrer la conversation.",
      "Tu ne sais pas quelle photo devrait vraiment être en tête de ton profil.",
    ],
    faq: [
      {
        question: "L'analyse de profil Bumble est-elle vraiment gratuite ?",
        answer:
          "Oui — la première analyse (score global plus quelques recommandations spécifiques) est gratuite. Le décryptage complet avec toutes les recommandations se débloque avec Flirtcraft Premium.",
      },
      {
        question: "Est-ce que ça peut aider plus de gens à m'écrire en premier ?",
        answer:
          "Oui — c'est l'un des points précis sur lesquels l'analyse de la bio et des photos est notée : à quel point ton profil facilite l'envoi de ce premier message.",
      },
      {
        question: "Est-ce que ça fonctionne pour les hommes et les femmes ?",
        answer: "Oui, l'analyse s'adapte au genre et aux objectifs que tu indiques pendant l'onboarding.",
      },
    ],
  },
];

export function getAppReview(slug: string) {
  return APP_REVIEWS.find((review) => review.slug === slug);
}
