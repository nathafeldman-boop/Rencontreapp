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
  /** Optional cross-links to the relevant pillar/tool/FAQ page — rendered above the CTA. Populated where a natural link exists; absent elsewhere rather than forced. */
  relatedLinks?: { label: string; path: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "avoir-plus-de-matchs-tinder",
    title: "Comment obtenir plus de matchs sur Tinder",
    excerpt:
      "Les matchs ne viennent pas de la chance — ils viennent d'un profil structuré pour convertir les swipes. Voici ce qui fait vraiment bouger le chiffre.",
    publishedAt: "2026-01-15",
    readingMinutes: 6,
    relatedLinks: [
      { label: "Le guide complet profil Tinder", path: "/tinder" },
      { label: "Pourquoi tu n'as aucun match", path: "/blog/pourquoi-aucun-match-tinder" },
      { label: "Questions sur les photos de profil", path: "/questions/photos-de-profil" },
    ],
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
    slug: "meilleures-photos-tinder",
    relatedLinks: [
      { label: "Le guide complet profil Tinder", path: "/tinder" },
      { label: "Questions sur les photos de profil", path: "/questions/photos-de-profil" },
    ],
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
    slug: "pourquoi-aucun-match-tinder",
    relatedLinks: [
      { label: "Le guide complet profil Tinder", path: "/tinder" },
      { label: "Questions sur le manque de matchs", path: "/questions/manque-de-matchs" },
    ],
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
    slug: "comment-coach-ameliore-profil-rencontre",
    title: "Comment ton coach améliore ton profil de rencontre",
    excerpt:
      "Ce qu'un coach de rencontre peut vraiment faire de différent par rapport à l'avis d'un ami ou une checklist générique.",
    publishedAt: "2026-02-05",
    readingMinutes: 5,
    sections: [
      {
        heading: "Un second avis, sans la gêne",
        body: [
          "La plupart des gens n'obtiennent jamais de retour honnête sur leur profil de rencontre. Les amis sont trop polis pour dire qu'une photo te dessert, et les articles génériques « top 10 conseils Tinder » ne peuvent rien te dire sur ton profil spécifique. Une analyse par ton coach comble cet écart — un retour précis et cohérent sur tes vraies photos et ta vraie bio, pas des conseils généraux.",
        ],
      },
      {
        heading: "Noter ce qui prédit réellement les matchs",
        body: [
          "Plutôt qu'un seul verdict vague « bon/mauvais », une analyse utile de ton coach décompose un profil selon les dimensions qui affectent séparément les matchs : qualité et ordre des photos, attractivité perçue, solidité de la bio, et à quel point ton profil facilite le démarrage d'une conversation. Savoir laquelle de ces dimensions est la plus faible te dit exactement où concentrer tes efforts.",
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
          "Le Simulateur de match va plus loin : une conversation d'entraînement en direct face à un persona simulé par ton coach, notée ensuite, pour que tu puisses améliorer tes phrases d'accroche et tes réflexes conversationnels avant de vraiment parler à un match réel. C'est la différence entre lire des conseils de conversation et vraiment les mettre en pratique.",
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
  {
    slug: "prompts-hinge-qui-marchent",
    title: "Comment écrire des prompts Hinge qui donnent vraiment envie de répondre",
    excerpt:
      "Sur Hinge, le prompt que tu choisis compte autant que ce que tu réponds. Voici comment éviter les réponses génériques qui se noient dans la masse.",
    publishedAt: "2026-02-12",
    readingMinutes: 5,
    sections: [
      {
        heading: "Le prompt n'est qu'une amorce — la réponse fait tout le travail",
        body: [
          "Beaucoup de gens choisissent un prompt Hinge au hasard et y répondent avec la première idée générique qui leur vient (« Je suis doué(e) pour... la cuisine »). Le problème, c'est que Hinge affiche des centaines de réponses à peu près identiques à ce même prompt chaque jour. Une réponse générique se noie, même si le prompt choisi était le bon.",
          "La règle simple : chaque réponse doit contenir un détail que personne d'autre ne pourrait écrire mot pour mot. Pas « j'aime voyager », mais « j'ai raté mon vol pour Lisbonne et je m'en sers encore comme excuse pour ne jamais planifier à l'avance ».",
        ],
      },
      {
        heading: "Choisis des prompts qui appellent une histoire, pas une liste",
        body: [
          "Les prompts du type « Mes centres d'intérêt » ou « Je recherche » poussent presque tout le monde vers des listes de qualités interchangeables. Les prompts qui demandent un scénario, une opinion ou une anecdote (« Le débat le plus stupide dans lequel je me suis engagé(e) », « Ma théorie non scientifique sur... ») forcent naturellement une réponse plus spécifique et plus facile à commenter.",
        ],
      },
      {
        heading: "Termine par quelque chose de facile à relancer",
        body: [
          "Une bonne réponse à un prompt Hinge se termine rarement sur un point final plat. Une pointe d'humour, une opinion tranchée ou une question implicite donne à la personne qui lit exactement de quoi envoyer un premier message — c'est souvent la différence entre un like silencieux et une vraie conversation qui démarre.",
        ],
      },
      {
        heading: "Varie tes trois prompts",
        body: [
          "Hinge en demande trois : évite qu'ils racontent tous la même facette de toi (trois blagues, ou trois anecdotes de voyage). Un mélange — une touche d'humour, un vrai détail personnel, et une ouverture sur tes objectifs ou ta personnalité — donne un profil plus complet et plus facile à cerner en quelques secondes.",
          "C'est exactement ce que Flirtcraft évalue quand tu envoies ton profil Hinge : pas seulement si un prompt est « bien », mais si les trois ensemble racontent quelque chose de cohérent et mémorable.",
        ],
      },
    ],
  },
  {
    slug: "combien-de-photos-profil-rencontre",
    title: "Combien de photos mettre sur ton profil de rencontre (et dans quel ordre)",
    excerpt:
      "Trop peu de photos et tu parais peu investi(e). Trop et tu dilues tes meilleures. Voici comment trouver le bon nombre — et le bon ordre.",
    publishedAt: "2026-02-19",
    readingMinutes: 5,
    sections: [
      {
        heading: "Le nombre qui fonctionne le mieux : entre 4 et 6",
        body: [
          "En dessous de 3-4 photos, un profil paraît peu investi ou donne l'impression que tu as quelque chose à cacher. Au-delà de 6-7, tes meilleures photos se retrouvent diluées parmi des images plus faibles, et la personne qui swipe doit faire plus d'efforts pour se faire une opinion claire. Entre 4 et 6 photos, bien choisies, couvre l'essentiel sans fatiguer l'attention.",
        ],
      },
      {
        heading: "L'ordre compte plus que la quantité",
        body: [
          "Ta première photo doit être ta plus forte sans exception — nette, seul(e), bien éclairée, visage clairement visible. Les photos 2 et 3 doivent confirmer et enrichir cette première impression (contexte, langage corporel, un vrai sourire). Les dernières photos servent à montrer de la variété : un hobby, un voyage, un moment social — chacune pensée comme une accroche de conversation potentielle plutôt qu'un simple remplissage.",
        ],
      },
      {
        heading: "Chaque photo doit avoir un rôle, pas juste être « une bonne photo »",
        body: [
          "Une photo peut être objectivement réussie et pourtant ne rien apporter à ton profil si elle répète ce qu'une autre montre déjà (deux selfies au même angle, trois photos de soirée). Avant d'ajouter une photo, demande-toi ce qu'elle montre que les autres ne montrent pas déjà — expression, contexte, activité, tenue. Si la réponse est « rien de nouveau », elle prend la place d'une photo qui pourrait vraiment servir.",
        ],
      },
      {
        heading: "Teste, ne devine pas",
        body: [
          "La plupart des gens gardent l'ordre dans lequel ils ont importé leurs photos, sans jamais vérifier si c'est le bon. Le Photo Optimizer de Flirtcraft note chaque photo individuellement et propose un ordre optimisé en un clic, à partir d'une vraie analyse plutôt que d'une intuition.",
        ],
      },
    ],
  },
  {
    slug: "relancer-conversation-qui-stagne",
    title: "Comment relancer une conversation qui s'éteint sur une app de rencontre",
    excerpt:
      "« Haha oui » n'est pas une fin de conversation, c'est une occasion manquée. Voici comment repartir sans que ça sonne forcé.",
    publishedAt: "2026-02-26",
    readingMinutes: 5,
    sections: [
      {
        heading: "Pourquoi les conversations meurent (ce n'est presque jamais un manque d'intérêt)",
        body: [
          "La plupart des conversations qui s'éteignent ne meurent pas parce que l'intérêt a disparu — elles meurent parce qu'un message a demandé trop peu d'effort pour continuer. Un « Haha, sympa ! » ou un « Ça va et toi ? » ferme la porte au lieu de l'ouvrir. La bonne nouvelle : c'est un problème mécanique, pas un jugement sur la conversation elle-même.",
        ],
      },
      {
        heading: "Ne t'excuse pas d'avoir mis du temps à répondre",
        body: [
          "« Désolé(e) pour le retard, la vie est folle en ce moment » n'ajoute rien et attire l'attention sur un délai que l'autre personne n'a probablement même pas remarqué. Reprends directement là où c'est intéressant, comme si le fil n'avait jamais été interrompu.",
        ],
      },
      {
        heading: "Rebondis sur un détail précis, pas sur le dernier message générique",
        body: [
          "Si la conversation s'est arrêtée sur un échange plat, remonte plus haut et accroche-toi à un détail spécifique mentionné plus tôt — un lieu, un projet, une opinion. Une relance du type « Au fait, ça a donné quoi ton entretien dont tu parlais ? » montre que tu as vraiment suivi, ce qu'un « Tu fais quoi de beau ? » générique ne fait jamais.",
        ],
      },
      {
        heading: "Termine toujours sur quelque chose de facile à attraper",
        body: [
          "Une relance qui se termine par une affirmation plate risque de retomber à plat une deuxième fois. Une question ouverte, une provocation légère, ou un choix binaire amusant (« thé ou café, et je juge selon ta réponse ») donne à l'autre personne quelque chose de concret à quoi répondre, plutôt qu'un vague « d'accord ».",
        ],
      },
      {
        heading: "Entraîne-toi avant que ça compte vraiment",
        body: [
          "Si tu bloques régulièrement au même endroit, le Coach de conversation de Flirtcraft analyse ta conversation réelle et propose 3 relances adaptées à ton style, et le Simulateur de match te permet de t'entraîner face à ton coach avant de retenter sur une vraie conversation.",
        ],
      },
    ],
  },
  {
    slug: "exemple-bio-tinder-homme",
    relatedLinks: [
      { label: "Le guide complet bio Tinder", path: "/bio-tinder" },
      { label: "Génère ta bio en quelques secondes", path: "/tinder-bio-generator" },
    ],
    title: "20 exemples de bio Tinder pour homme qui donnent vraiment envie de matcher",
    excerpt:
      "« 6 pieds sous terre, je mesure 1m80 » ne fonctionne plus depuis longtemps. Voici des structures de bio Tinder qui marchent vraiment pour un profil masculin, et pourquoi.",
    publishedAt: "2026-03-05",
    readingMinutes: 6,
    sections: [
      {
        heading: "Pourquoi la plupart des bios Tinder pour homme se ressemblent toutes",
        body: [
          "« 1m80, j'aime les voyages et le sport, on verra la suite » — ce genre de bio n'est pas mauvaise en soi, elle est juste interchangeable. N'importe quel homme sur l'application pourrait l'écrire mot pour mot, ce qui veut dire qu'elle ne donne à personne de raison précise de swiper à droite plutôt qu'à gauche.",
          "Une bonne bio Tinder pour homme n'a pas besoin d'être drôle à tout prix ni de sonner comme une punchline de stand-up. Elle a juste besoin d'un détail que toi seul pourrais écrire.",
        ],
      },
      {
        heading: "5 exemples qui fonctionnent (et pourquoi)",
        body: [
          "« Je peux t'expliquer pourquoi [ton équipe/hobby] a raison de perdre tous les week-ends, mais je te préviens, c'est un sujet sensible. » — une opinion assumée, avec assez d'auto-dérision pour ne pas sonner prétentieux.",
          "« J'ai un plan sérieux pour visiter tous les pays qui ont un mot en trop dans leur nom officiel. Actuellement à 2/12. » — spécifique, absurde juste ce qu'il faut, et facile à relancer.",
          "« Ingénieur la semaine, DJ amateur le week-end, la transition entre les deux est encore un chantier. » — donne deux facettes concrètes plutôt qu'une liste de qualités vagues.",
          "« Je cuisine bien exactement trois plats. Demande-moi lequel avant de me juger. » — crée une question toute prête pour le premier message.",
          "« Cherche quelqu'un pour valider que oui, j'ai raison de mettre de l'ananas sur ma pizza. » — un débat léger, universellement compris, qui appelle une réponse immédiate.",
        ],
      },
      {
        heading: "La structure qui marche presque à chaque fois",
        body: [
          "Un détail concret et un peu inattendu sur toi, suivi d'une pointe d'humour ou d'auto-dérision, terminé par une question ou une ouverture claire. Pas besoin des trois éléments dans cet ordre exact, mais une bio qui n'a aucun des trois se lit comme une fiche d'identité, pas comme une invitation à écrire.",
          "Évite les négations (« pas ici pour un plan cul », « pas fan des jeux »). Elles définissent ce que tu n'es pas, jamais ce que tu es, et donnent un ton défensif dès la première ligne.",
        ],
      },
      {
        heading: "Le piège : une bio qui ne colle pas à tes photos",
        body: [
          "Une bio drôle sur un profil aux photos ternes (ou l'inverse) crée une dissonance qui coûte des matchs — le cerveau détecte l'incohérence même sans pouvoir la nommer. La bio et les photos doivent raconter la même histoire.",
          "Le générateur de bio Tinder de Flirtcraft écrit des bios dans plusieurs styles à partir de ton vrai profil (pas d'un modèle générique), pour que le résultat sonne comme toi, pas comme une liste d'exemples recopiés.",
        ],
      },
    ],
  },
  {
    slug: "exemple-bio-tinder-femme",
    relatedLinks: [
      { label: "Le guide complet bio Tinder", path: "/bio-tinder" },
      { label: "Génère ta bio en quelques secondes", path: "/tinder-bio-generator" },
    ],
    title: "20 exemples de bio Tinder pour femme qui donnent vraiment envie de matcher",
    excerpt:
      "Une bio Tinder pour femme n'a pas besoin d'être défensive ni générique pour se démarquer. Voici des exemples qui fonctionnent, et la structure derrière.",
    publishedAt: "2026-03-12",
    readingMinutes: 6,
    sections: [
      {
        heading: "Le problème des bios trop défensives ou trop vagues",
        body: [
          "Beaucoup de bios Tinder pour femme partent d'un bon réflexe — filtrer les profils qui ne conviennent pas — mais finissent par sonner comme une liste d'interdictions (« pas de photos torse nu », « ne réponds pas si tu ne sais pas écrire »). Ça filtre, mais ça donne aussi un ton froid dès la première ligne, avant même d'avoir montré qui tu es.",
          "À l'inverse, une bio trop vague (« j'aime rire, voyager, profiter de la vie ») ne filtre rien du tout et ne donne à personne de quoi t'écrire un message qui ne soit pas générique.",
        ],
      },
      {
        heading: "5 exemples qui fonctionnent (et pourquoi)",
        body: [
          "« Je collectionne les théories non scientifiques sur pourquoi les gens perdent toujours une chaussette. La tienne est la bienvenue. » — intrigant, léger, et appelle une réponse immédiate.",
          "« Ex-danseuse classique reconvertie en experte du canapé le dimanche. Les deux me vont très bien. » — deux facettes concrètes, avec de l'auto-dérision.",
          "« Je peux te battre à peu près à n'importe quel jeu de société, sauf ceux où je perds, ceux-là on ne les compte pas. » — montre de la personnalité et de l'humour sans en faire trop.",
          "« Cherche quelqu'un capable de me convaincre que sa série préférée est meilleure que la mienne. Bon courage. » — challenge amusant, facile à relancer en premier message.",
          "« Trois voyages prévus cette année, zéro plan précis pour aucun. Si tu es plutôt du genre à improviser aussi. » — dit quelque chose de réel sur ta façon de vivre, pas juste « j'aime voyager ».",
        ],
      },
      {
        heading: "La structure qui marche presque à chaque fois",
        body: [
          "Un détail concret sur toi (une habitude, une passion, une contradiction assumée), une touche d'humour, puis une ouverture claire — question, défi léger, ou invitation à réagir. La bio n'a pas besoin de tout dire sur toi ; elle a juste besoin de donner une prise pour démarrer une vraie conversation.",
          "Si tu veux filtrer certains profils, fais-le en creux plutôt qu'en négation directe : préciser ce que tu cherches vraiment (une vraie conversation, quelqu'un de curieux, etc.) filtre presque aussi bien que « pas de », sans le ton froid.",
        ],
      },
      {
        heading: "Le piège : une bio qui ne colle pas à tes photos",
        body: [
          "Une bio pleine d'humour sur un profil aux photos très sérieuses (ou l'inverse) crée un décalage que les gens ressentent sans toujours pouvoir l'expliquer — et ça coûte des matchs. La bio doit raconter la même histoire que les photos, pas une histoire différente à côté.",
          "Le générateur de bio Tinder de Flirtcraft propose plusieurs bios à partir de ton vrai profil (pas d'un modèle générique), pour que le résultat te ressemble vraiment plutôt que de sonner comme un exemple recopié.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
