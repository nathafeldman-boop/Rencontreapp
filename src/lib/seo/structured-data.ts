import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: "Analyse et coaching de profil de rencontre par ton coach.",
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description:
      "Analyse de profil de rencontre par ton coach, optimisation photo, génération de bio et coaching de conversation pour Tinder, Hinge et Bumble.",
    offers: {
      "@type": "Offer",
      price: "7.99",
      priceCurrency: "EUR",
    },
  };
}

/** Homepage-only — Google associates a single WebSite entity with the domain from wherever it first sees it; the homepage is the conventional place. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** `items` in order from the homepage down to the current page (excluded from `position: 1`, which is always "Accueil"). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Accueil", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  datePublished,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}${path}`,
    datePublished,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}
