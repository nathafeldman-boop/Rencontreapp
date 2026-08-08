export interface BlogSection {
  heading: string;
  body: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  sections: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-get-more-tinder-matches",
    title: "Comment obtenir plus de matchs sur Tinder",
    excerpt:
      "Les matchs ne viennent pas de la chance — ils viennent d'un profil structuré pour convertir les swipes. Voici ce qui fait vraiment bouger le chiffre.",
    publishedAt: "2026-01-15",
    readingMinutes: 6,
    sections: [
      {
        heading: "Ta première photo fait 80% du travail",
        body: [
          "Sur Tinder, les gens décident de swiper à droite en moins d'une seconde, presque entièrement sur la base de ta première photo. Si cette photo est une photo de groupe, un selfie flou, ou prise dans une mauvaise lumière, tout le reste de ton profil — ta bio, tes autres photos, ta vraie personnalité — n'est jamais vu.",
          "La correction est mécanique, pas esthétique : choisis une photo seul(e), bien éclairée (la lumière naturelle du jour bat n'importe quoi en intérieur), où ton visage est clairement visible et où tu ne plisses pas les yeux ni ne clignes des paupières. Pas besoin d'un shooting professionnel. Il faut juste que ce soit sans ambiguïté.",
        ],
      },
      {
        heading: "Montre de la diversité dans tes autres photos",
        body: [
          "Une fois que quelqu'un ouvre ton profil, tes photos restantes ont un rôle différent : prouver que la première photo n'était pas un coup de chance, et donner de quoi ouvrir une conversation. Une photo de toi en train de faire quelque chose de précis — un sport, un hobby, un voyage — est bien plus utile qu'un deuxième selfie, parce que c'est assez concret pour susciter un commentaire.",
          "Trois à six photos, c'est le bon équilibre. Moins de trois se lit comme un manque d'effort ou une volonté de cacher quelque chose ; plus de six commence à diluer tes meilleures images.",
        ],
      },
      {
        heading: "Écris une bio à laquelle on a envie de répondre",
        body: [
          "« J'aime voyager, j'aime rire » décrit à peu près la moitié de Tinder et ne donne à un match rien à répondre. Une bio qui nomme un détail précis et légèrement inhabituel sur toi — une opinion tranchée, un voyage récent, une compétence bizarrement spécifique — est à la fois plus mémorable et plus facile à relancer.",
          "Terminer par une question légère ou une accroche (même quelque chose d'aussi simple que « convaincs-moi que l'ananas a sa place sur la pizza ») transforme ta bio en amorce de conversation plutôt qu'en cul-de-sac.",
        ],
      },
      {
        heading: "Aligne ton profil sur ce que tu veux vraiment",
        body: [
          "Un profil optimisé purement pour le volume de matchs et un profil optimisé pour des matchs compatibles, ce n'est pas la même chose. Si tu cherches quelque chose de sérieux, être précis à ce sujet (sans être trop insistant) filtre les personnes qui veulent la même chose, ce qui veut dire moins de matchs mais de meilleure qualité.",
          "C'est exactement ce que l'analyse gratuite de Flirtcraft vérifie en premier — à quel point tes photos, ta bio et ton objectif déclaré fonctionnent réellement ensemble, pas seulement si tes photos sont « bonnes ».",
        ],
      },
    ],
  },
  {
    slug: "best-tinder-photos",
    title: "Les meilleures photos Tinder à utiliser (et ce qu'il faut éviter)",
    excerpt:
      "Toutes les bonnes photos ne sont pas de bonnes photos Tinder. Voici ce qui fonctionne vraiment, photo par photo.",
    publishedAt: "2026-01-22",
    readingMinutes: 5,
    sections: [
      {
        heading: "Photo 1 : seul(e), nette, bien éclairée",
        body: [
          "Ta photo principale doit répondre instantanément à une question : à quoi ressembles-tu ? Les photos de groupe forcent un jeu de devinettes (« lequel es-tu ? ») qu'une grande partie des gens ne prendra pas la peine de résoudre. La lumière naturelle — en extérieur, près d'une fenêtre — surpasse systématiquement l'éclairage artificiel d'intérieur.",
        ],
      },
      {
        heading: "Photos 2-3 : contexte et langage corporel",
        body: [
          "Une photo qui montre ta silhouette et ton ambiance générale dans un cadre réel (en train de marcher, à un événement, en train de faire quelque chose) paraît plus authentique qu'une photo posée façon studio. C'est aussi là qu'un vrai sourire — pas forcé — fait une différence mesurable ; les gens repèrent inconsciemment la différence.",
        ],
      },
      {
        heading: "Photos 4-6 : centres d'intérêt et preuve sociale",
        body: [
          "C'est là que les photos de hobbies, de voyage, et occasionnellement avec des amis (sans être au premier plan, mais présents) ont leur place. Elles servent à donner à un match une accroche concrète — « attends, tu grimpes ? » est un bien meilleur premier message que n'importe quoi de générique.",
        ],
      },
      {
        heading: "Ce qu'il faut éviter",
        body: [
          "Les selfies dans un miroir avec un flash visible, les lunettes de soleil sur chaque photo (les gens veulent voir tes yeux sur au moins une), les photos où tu n'es clairement pas le sujet principal, et les images fortement filtrées qui ne correspondront pas à ton apparence en personne — ce décalage a tendance à faire plus de mal que de bien une fois la rencontre réelle.",
          "Si tu ne sais pas laquelle de tes photos actuelles t'aide ou te dessert, c'est précisément ce que le Photo Optimizer de Flirtcraft note pour toi, photo par photo.",
        ],
      },
    ],
  },
  {
    slug: "why-you-get-no-matches",
    title: "Pourquoi tu n'as aucun match (alors que tu n'es pas moche)",
    excerpt:
      "L'attractivité explique moins l'écart de matchs que ce que les gens pensent. Voici ce qui cloche généralement en réalité.",
    publishedAt: "2026-01-29",
    readingMinutes: 6,
    sections: [
      {
        heading: "Ce n'est presque jamais qu'une question de physique",
        body: [
          "Il est tentant de penser que zéro match signifie que tu n'es pas assez attirant(e), mais en pratique les plus grosses pertes viennent de problèmes structurels faciles à corriger : une photo principale faible, une bio qui ne dit rien, ou des photos qui ne te représentent pas clairement. Beaucoup de personnes objectivement séduisantes ont des profils quasi vides qui sous-performent largement par rapport à leur potentiel réel.",
        ],
      },
      {
        heading: "Le problème de la photo principale",
        body: [
          "Si ta première photo est une photo de groupe, en basse lumière, avec des lunettes de soleil, ou fortement filtrée, tu perds la majorité de tes matchs potentiels avant même que quelqu'un n'atteigne ta deuxième photo. Cette correction unique — commencer par une photo nette, seul(e), bien éclairée — est systématiquement le changement le plus rentable disponible.",
        ],
      },
      {
        heading: "Le problème de la bio",
        body: [
          "Une bio vide ou générique ne se contente pas de ne pas aider — sur les applications où la bio est visible avant de swiper (comme Hinge), elle peut activement te coûter des swipes. Même sur Tinder, une bio qui n'offre aucune accroche rend plus difficile pour un match intéressé de justifier l'envoi d'un premier message.",
        ],
      },
      {
        heading: "Le problème d'adéquation à l'application",
        body: [
          "Le même profil performe différemment selon l'application. Hinge récompense les prompts et la spécificité ; Bumble récompense un profil qu'une femme peut ouvrir sans gêne en premier ; Tinder est bien plus orienté photo que les deux autres. Un profil construit pour une application et copié-collé sur une autre sous-performe souvent simplement à cause de ce décalage.",
        ],
      },
      {
        heading: "Comment vraiment découvrir ce qui ne va pas",
        body: [
          "Deviner lequel de ces points est ton point faible est inefficace. L'analyse gratuite de Flirtcraft note séparément tes photos, ta bio, ton signal d'attractivité, et ton potentiel de conversation, pour que tu obtiennes, au lieu d'une vague impression que « quelque chose cloche », une liste précise et classée de ce qu'il faut corriger en premier.",
        ],
      },
    ],
  },
  {
    slug: "how-ai-improves-your-dating-profile",
    title: "Comment l'IA améliore ton profil de rencontre",
    excerpt:
      "Ce qu'un coach de rencontre IA peut vraiment faire de différent par rapport à l'avis d'un ami ou une checklist générique.",
    publishedAt: "2026-02-05",
    readingMinutes: 5,
    sections: [
      {
        heading: "Un second avis, sans la gêne",
        body: [
          "La plupart des gens n'obtiennent jamais de retour honnête sur leur profil de rencontre. Les amis sont trop polis pour dire qu'une photo te dessert, et les articles génériques « top 10 conseils Tinder » ne peuvent rien te dire sur ton profil spécifique. Une analyse IA comble cet écart — un retour précis et cohérent sur tes vraies photos et ta vraie bio, pas des conseils généraux.",
        ],
      },
      {
        heading: "Noter ce qui prédit réellement les matchs",
        body: [
          "Plutôt qu'un seul verdict vague « bon/mauvais », une analyse IA utile décompose un profil selon les dimensions qui affectent séparément les matchs : qualité et ordre des photos, attractivité perçue, solidité de la bio, et à quel point ton profil facilite le démarrage d'une conversation. Savoir laquelle de ces dimensions est la plus faible te dit exactement où concentrer tes efforts.",
        ],
      },
      {
        heading: "Du diagnostic à l'action",
        body: [
          "Identifier le problème n'est que la moitié du travail. Flirtcraft transforme chaque score en une prochaine étape concrète : quelle photo mettre en avant, une bio réécrite dans ta voix, et — pour les conversations qui s'éteignent — des suggestions de réponses accompagnées d'une explication de pourquoi elles fonctionnent, pas juste une phrase à copier-coller.",
        ],
      },
      {
        heading: "S'entraîner avant que ça compte",
        body: [
          "Le Simulateur de match va plus loin : une conversation d'entraînement en direct face à un persona IA, notée ensuite, pour que tu puisses améliorer tes phrases d'accroche et tes réflexes conversationnels avant de vraiment parler à un match réel. C'est la différence entre lire des conseils de conversation et vraiment les mettre en pratique.",
        ],
      },
      {
        heading: "Essaie-le sur ton propre profil",
        body: [
          "Le moyen le plus rapide de voir ce que ça donne, c'est de faire passer ton propre profil — la première analyse de Flirtcraft est gratuite et prend environ une minute.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
