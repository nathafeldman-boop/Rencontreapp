export interface FaqEntry {
  slug: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  slug: string;
  title: string;
  description: string;
  entries: FaqEntry[];
}

/**
 * The long-tail question/answer hub at /questions — real, distinct answers
 * (not templated keyword permutations), grouped into topic pages so each
 * one builds real topical authority instead of a wall of near-duplicate
 * thin pages. Every answer that mentions Flirtcraft does so because it's
 * genuinely relevant to that question, not as a forced plug.
 */
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    slug: "photos-de-profil",
    title: "Photos de profil",
    description:
      "Quelles photos choisir, dans quel ordre, et pourquoi certaines photos qui te plaisent à toi ne convertissent pas du tout sur une app de rencontre.",
    entries: [
      {
        slug: "quelle-photo-principale-choisir",
        question: "Quelle photo choisir en photo principale ?",
        answer:
          "Ta photo principale doit répondre à une seule question en moins d'une seconde : à quoi ressembles-tu vraiment ? Choisis une photo où tu es seul(e), le visage net et bien éclairé, sans lunettes de soleil ni chapeau qui cache tes yeux. La lumière naturelle du jour bat presque toujours un éclairage intérieur. Un outil d'analyse de profil comme Flirtcraft compare tes différentes photos entre elles et te dit laquelle a objectivement le plus de chances de bien démarrer, plutôt que de te fier à ton propre jugement (qui est presque toujours biaisé sur soi-même).",
      },
      {
        slug: "combien-de-photos-mettre",
        question: "Combien de photos faut-il mettre sur son profil ?",
        answer:
          "Entre quatre et six photos est le point d'équilibre le plus courant. Moins de trois donne l'impression que tu n'as pas pris le temps ou que tu caches quelque chose ; plus de six dilue tes meilleures photos et fatigue la personne qui swipe. Chaque photo doit apporter une information différente — le visage, le corps en contexte, un hobby, un moment social — plutôt que six variations du même selfie.",
      },
      {
        slug: "photo-de-groupe-bonne-idee",
        question: "Est-ce une bonne idée de mettre une photo de groupe ?",
        answer:
          "Une photo de groupe peut fonctionner en deuxième ou troisième position, jamais en première : elle force la personne à deviner qui tu es, et une grande partie des gens ne prendra pas la peine de chercher. Si tu en mets une, choisis-en une où tu es clairement au centre ou le plus net du groupe, avec au maximum trois ou quatre personnes.",
      },
      {
        slug: "faut-il-sourire-sur-les-photos",
        question: "Faut-il sourire sur ses photos de profil ?",
        answer:
          "Un vrai sourire (celui qui plisse un peu les yeux, pas un sourire figé pour la photo) augmente presque systématiquement la perception de sympathie et d'accessibilité. Ça ne veut pas dire sourire sur les six photos — une photo plus sérieuse ou concentrée dans un contexte précis (sport, travail créatif) peut ajouter du contraste — mais ta photo principale gagne presque toujours à inclure un sourire naturel.",
      },
      {
        slug: "selfie-ou-photo-prise-par-quelquun",
        question: "Selfie ou photo prise par quelqu'un d'autre ?",
        answer:
          "Une photo prise par quelqu'un d'autre, avec un peu de recul et un cadrage pensé, se distingue presque toujours d'un selfie au niveau des yeux depuis un miroir de salle de bain. Ça ne veut pas dire bannir tout selfie — un bon selfie en extérieur, bien cadré, reste correct en photo secondaire — mais ta photo principale gagne à venir d'un vrai appareil tenu par quelqu'un d'autre.",
      },
      {
        slug: "photo-en-noir-et-blanc",
        question: "Peut-on mettre une photo en noir et blanc ou avec un filtre ?",
        answer:
          "Un filtre léger ou une photo en noir et blanc esthétique peut fonctionner en photo secondaire, mais évite d'en faire ta photo principale : les gens veulent savoir à quoi tu ressembles vraiment en couleur, et un filtre trop marqué peut créer un doute inconscient (« pourquoi cache-t-il/elle son vrai visage ? »). Garde les filtres forts pour Instagram, pas pour ta photo de profil de rencontre.",
      },
      {
        slug: "photo-de-sport-ou-hobby",
        question: "Une photo en train de faire du sport aide-t-elle vraiment ?",
        answer:
          "Oui, à condition qu'on te voie clairement : une photo de toi en pleine action sportive donne un vrai sujet de conversation concret (« tu fais de l'escalade depuis longtemps ? ») bien plus facilement qu'un deuxième selfie. Évite juste les photos où tu es trop loin, flou, ou méconnaissable sous un casque ou des lunettes de protection.",
      },
      {
        slug: "photo-avec-un-animal",
        question: "Faut-il mettre une photo avec son chien ou son chat ?",
        answer:
          "Une photo avec un animal fonctionne très bien comme photo secondaire — c'est un excellent déclencheur de conversation et ça humanise le profil. Attention seulement à ce que ton visage reste le sujet principal de la photo, pas l'animal : une photo où on te distingue à peine derrière ton chien perd tout son intérêt.",
      },
      {
        slug: "photo-de-voyage",
        question: "Les photos de voyage sont-elles surexploitées sur les profils ?",
        answer:
          "Elles le sont, mais ça ne veut pas dire qu'il faut les bannir — juste éviter d'en faire les quatre photos sur cinq de ton profil, ce qui donne l'impression que ta seule personnalité est « j'ai un passeport ». Une photo de voyage bien choisie, avec un lieu ou une activité précise plutôt qu'un simple selfie devant un monument, reste un bon complément dans un profil varié.",
      },
      {
        slug: "photo-miroir-salle-de-bain",
        question: "Pourquoi les photos de miroir de salle de bain sont-elles mal vues ?",
        answer:
          "Elles sont associées, à tort ou à raison, à un manque d'effort : mauvais éclairage, cadrage flou, téléphone visible dans le reflet, décor peu flatteur. Ce n'est pas la photo elle-même le problème mais tout ce qui l'accompagne généralement. Si tu veux montrer ton corps en contexte, une photo prise dehors ou par quelqu'un d'autre donnera un résultat bien plus net.",
      },
      {
        slug: "comment-savoir-si-mes-photos-sont-bonnes",
        question: "Comment savoir objectivement si mes photos sont bonnes ?",
        answer:
          "C'est très difficile à juger seul(e) — on a tous un angle mort sur ses propres photos, soit trop critique, soit pas assez. Demander l'avis de quelques amis honnêtes aide, mais leur retour reste subjectif et poli. Un outil d'analyse de profil comme Flirtcraft note chaque photo individuellement (netteté, cadrage, ce qu'elle communique) et te donne un ordre recommandé, ce qui donne un repère plus objectif qu'un simple « ça a l'air bien ».",
      },
      {
        slug: "faut-il-refaire-shooting-photo",
        question: "Faut-il payer un shooting photo professionnel ?",
        answer:
          "Rarement nécessaire. Un shooting professionnel donne des photos techniquement parfaites, mais elles peuvent paraître trop posées ou décalées par rapport au reste du profil — l'effet inverse de ce que tu cherches. La lumière naturelle, un bon cadrage et un ami avec un téléphone récent suffisent dans l'immense majorité des cas.",
      },
      {
        slug: "photo-de-face-ou-de-profil",
        question: "Vaut-il mieux une photo de face ou de trois-quarts ?",
        answer:
          "Une photo de trois-quarts (légèrement tournée, pas totalement de face) est en général perçue comme plus naturelle et plus flatteuse qu'une photo strictement de face façon photo d'identité. Ce n'est pas une règle absolue — certains visages rendent mieux de face — mais c'est un bon point de départ si tu hésites.",
      },
      {
        slug: "ordre-des-photos-importe-t-il",
        question: "L'ordre de mes photos a-t-il vraiment de l'importance ?",
        answer:
          "Beaucoup plus qu'on ne le pense. La photo principale détermine si quelqu'un ouvre ton profil, mais les photos suivantes déterminent s'il ou elle swipe à droite. Mets ta photo la plus forte en premier, une photo de corps entier tôt dans la série (pour éviter les mauvaises surprises perçues), et termine sur une photo qui donne un vrai sujet de conversation.",
      },
      {
        slug: "photo-avec-lunettes-de-soleil",
        question: "Puis-je mettre une photo avec des lunettes de soleil ?",
        answer:
          "Pas en photo principale — les yeux sont l'un des éléments les plus importants pour établir une connexion visuelle en une fraction de seconde, et les cacher réduit mécaniquement tes chances. Une photo avec lunettes de soleil peut très bien fonctionner en photo secondaire, dans un contexte extérieur ou de vacances.",
      },
    ],
  },
  {
    slug: "bio-et-description",
    title: "Bio & description",
    description: "Ce qui rend une bio mémorable, ce qui la rend invisible, et comment écrire quelque chose auquel on a envie de répondre.",
    entries: [
      {
        slug: "quelle-longueur-pour-une-bio",
        question: "Quelle est la bonne longueur pour une bio de rencontre ?",
        answer:
          "Deux à quatre phrases courtes suffisent largement. Une bio vide fait perdre une occasion de te démarquer, mais une bio trop longue décourage la lecture sur mobile et dilue ton message principal. L'objectif n'est pas de tout dire sur toi — c'est de donner assez d'accroche pour qu'on ait envie de t'écrire.",
      },
      {
        slug: "jaime-voyager-jaime-rire-pourquoi-ca-marche-pas",
        question: "Pourquoi \"j'aime voyager, j'aime rire\" ne fonctionne pas comme bio ?",
        answer:
          "Parce que ça décrit littéralement la moitié des profils de l'application et ne donne rien de précis auquel répondre. Une bio efficace nomme un détail concret et un peu inhabituel — un plat que tu rates systématiquement, une compétence bizarrement spécifique, une opinion tranchée sur un sujet léger — parce que le concret se retient et se relance, contrairement au générique.",
      },
      {
        slug: "faut-il-terminer-par-une-question",
        question: "Faut-il terminer sa bio par une question ?",
        answer:
          "C'est une des techniques les plus fiables pour transformer une bio en amorce de conversation plutôt qu'en simple description. Même quelque chose de léger comme « convaincs-moi que l'ananas a sa place sur la pizza » donne à la personne qui lit un point d'entrée évident pour t'écrire, au lieu de devoir inventer un message d'ouverture à partir de rien.",
      },
      {
        slug: "faut-il-mettre-de-lhumour-dans-sa-bio",
        question: "L'humour est-il indispensable dans une bio ?",
        answer:
          "Non, mais il aide beaucoup s'il est authentique. Une bio drôle qui ne te ressemble pas se remarque à la première vraie conversation et crée un décalage. Si l'humour n'est pas ton fort, une bio sincère et précise sur ce que tu cherches fonctionne tout aussi bien — mieux vaut authentique que forcé.",
      },
      {
        slug: "faut-il-preciser-ce-quon-cherche",
        question: "Faut-il préciser ce qu'on cherche (sérieux, casual) dans sa bio ?",
        answer:
          "Oui, si tu le fais sans lourdeur. Être clair sur ce que tu cherches filtre les personnes qui veulent la même chose que toi — ce qui veut souvent dire moins de matchs, mais des matchs plus compatibles et des conversations qui vont plus loin. La formulation compte : une phrase légère passe mieux qu'un mode d'emploi rigide.",
      },
      {
        slug: "peut-on-copier-une-bio-trouvee-en-ligne",
        question: "Peut-on copier une bio trouvée en ligne ?",
        answer:
          "Certaines phrases reviennent tellement souvent (les mêmes blagues sur le café, les mêmes punchlines) que les personnes actives sur l'application les ont déjà vues dix fois — l'effet inverse de ce que tu recherches. Une bio générée à partir de tes vrais centres d'intérêt, comme le fait le générateur de bio de Flirtcraft à partir de ton profil et de tes réponses, reste bien plus distinctive qu'une phrase copiée-collée.",
      },
      {
        slug: "bio-vide-est-ce-grave",
        question: "Est-ce grave de laisser sa bio vide ?",
        answer:
          "C'est une occasion manquée plus qu'une erreur grave : une bio vide n'empêche pas d'avoir des matchs si les photos sont fortes, mais elle prive la personne en face d'un point d'accroche facile pour t'écrire en premier, et te fait rater tous les matchs qui filtrent sur la personnalité affichée plutôt que sur le physique seul.",
      },
      {
        slug: "comment-ecrire-une-bio-sans-etre-arrogant",
        question: "Comment parler de ses réussites sans paraître arrogant(e) ?",
        answer:
          "Le ton compte plus que le contenu : présenter une réussite avec un peu d'autodérision (« j'ai fini un marathon, mes genoux ne me le pardonnent toujours pas ») passe beaucoup mieux qu'une formulation purement factuelle qui sonne comme un CV. L'idée est de montrer, pas d'annoncer.",
      },
      {
        slug: "adapter-sa-bio-selon-lapplication",
        question: "Faut-il adapter sa bio selon l'application (Tinder, Bumble, Hinge) ?",
        answer:
          "Dans une certaine mesure, oui : Hinge fonctionne avec des prompts précis (une phrase à compléter) plutôt qu'une bio libre, donc la logique de réponse courte et spécifique compte encore plus. Tinder et Bumble laissent plus de liberté de format mais la même règle de base s'applique partout : concret et personnel bat générique.",
      },
      {
        slug: "faut-il-mentionner-son-metier",
        question: "Faut-il mentionner son métier dans sa bio ?",
        answer:
          "Ça dépend de ce que ton métier apporte à la conversation. Un intitulé de poste seul (« comptable ») n'apporte rien d'intéressant à lire, alors qu'un détail concret lié au métier (« je passe mes journées à négocier avec des fournisseurs chinois ») peut devenir un vrai sujet de conversation. Le critère n'est pas « dois-je le dire » mais « est-ce que ça donne quelque chose à quoi répondre ».",
      },
      {
        slug: "combien-de-temps-pour-ecrire-une-bonne-bio",
        question: "Combien de temps faut-il vraiment passer sur sa bio ?",
        answer:
          "Beaucoup moins que ce qu'on imagine en la fixant, bloqué(e) devant une page blanche. Le plus efficace est de lister rapidement cinq ou six détails précis sur toi (un hobby inhabituel, une opinion tranchée, une anecdote), puis d'en choisir deux ou trois à assembler — plutôt que d'essayer d'écrire une phrase parfaite du premier coup.",
      },
      {
        slug: "faut-il-des-emojis-dans-sa-bio",
        question: "Faut-il utiliser des emojis dans sa bio ?",
        answer:
          "Un ou deux emojis bien placés peuvent aérer visuellement une bio courte, mais une bio remplie d'emojis à chaque mot donne une impression brouillonne et distrait du texte lui-même. Utilise-les comme ponctuation occasionnelle, pas comme substitut aux mots.",
      },
      {
        slug: "bio-differente-pour-chaque-app",
        question: "Faut-il écrire une bio complètement différente sur chaque application ?",
        answer:
          "Pas complètement différente, mais adaptée au format. Le fond (ce qui te rend intéressant, ce que tu cherches) peut rester similaire d'une application à l'autre ; ce qui change, c'est le format — une bio libre sur Tinder, une réponse à un prompt précis sur Hinge, un ton parfois plus décontracté attendu sur Bumble.",
      },
      {
        slug: "faut-il-parler-de-ses-ex",
        question: "Peut-on mentionner sa dernière relation dans sa bio ?",
        answer:
          "En général, non — même en plaisantant, ça oriente la conversation vers un sujet que la plupart des gens préfèrent découvrir en discutant plutôt que lire dès la première seconde. Une bio gagne à rester tournée vers qui tu es maintenant, pas vers ce que tu as quitté.",
      },
    ],
  },
  {
    slug: "choisir-son-application",
    title: "Choisir son application de rencontre",
    description: "Tinder, Bumble, Hinge : ce qui les différencie vraiment, et comment savoir laquelle correspond à ce que tu cherches.",
    entries: [
      {
        slug: "tinder-bumble-ou-hinge",
        question: "Tinder, Bumble ou Hinge : laquelle choisir ?",
        answer:
          "Ça dépend surtout de ce que tu cherches. Tinder a le plus d'utilisateurs et un rythme rapide, orienté volume de swipes. Bumble donne aux femmes l'initiative du premier message en conversation hétéro, ce qui change la dynamique. Hinge est pensé autour de prompts détaillés et met plus l'accent sur la compatibilité que sur le swipe rapide, ce qui attire souvent un public cherchant quelque chose de plus sérieux — même si aucune application ne garantit ça avec certitude.",
      },
      {
        slug: "quelle-app-pour-relation-serieuse",
        question: "Quelle application privilégier pour une relation sérieuse ?",
        answer:
          "Hinge se positionne explicitement comme l'application « conçue pour être supprimée », avec des prompts qui poussent à en dire plus sur soi. Ça ne garantit rien en soi — on trouve des profils cherchant tout et n'importe quoi sur chaque application — mais le format encourage structurellement des profils plus détaillés que le swipe pur.",
      },
      {
        slug: "peut-on-utiliser-plusieurs-apps-en-meme-temps",
        question: "Peut-on utiliser plusieurs applications de rencontre en même temps ?",
        answer:
          "Oui, c'est très courant et il n'y a rien de mal à ça tant que tu restes honnête si la conversation évolue. Le seul vrai coût, c'est le temps : gérer plusieurs profils correctement (bonnes photos, bio à jour, conversations actives) prend plus d'énergie qu'un seul profil bien tenu.",
      },
      {
        slug: "faut-il-le-meme-profil-sur-toutes-les-apps",
        question: "Faut-il utiliser exactement les mêmes photos sur toutes les applications ?",
        answer:
          "Tu peux réutiliser les mêmes bonnes photos, mais varier légèrement l'ordre ou le choix selon le format de l'application (par exemple des photos qui se prêtent mieux à un prompt précis sur Hinge). L'essentiel est la cohérence : les mêmes photos sur deux applications ne posent aucun problème, à condition qu'elles restent récentes et fidèles à qui tu es.",
      },
      {
        slug: "bumble-femme-envoie-premier-message",
        question: "Pourquoi sur Bumble, c'est la femme qui doit écrire en premier ?",
        answer:
          "C'est une règle fondatrice de l'application (dans les matchs hétéro), pensée pour rééquilibrer une dynamique où les femmes reçoivent en général beaucoup plus de messages non désirés que les hommes. Pour les hommes, ça veut dire qu'un profil et une bio clairs comptent encore plus, puisque tu ne peux pas rattraper un profil faible par un bon message d'ouverture.",
      },
      {
        slug: "petites-villes-quelle-app-privilegier",
        question: "Quelle application privilégier quand on vit dans une petite ville ?",
        answer:
          "Tinder a en général le bassin d'utilisateurs le plus large, ce qui compte davantage dans une zone à faible densité de population. Certaines personnes élargissent aussi leur rayon de recherche dans les réglages plutôt que de changer d'application, pour ne pas trop réduire le nombre de profils visibles.",
      },
      {
        slug: "faut-il-payer-un-abonnement-premium-sur-lapp-de-rencontre",
        question: "Vaut-il la peine de payer un abonnement premium sur Tinder ou Bumble ?",
        answer:
          "Ça dépend surtout de ce que l'abonnement change concrètement (like illimité, retour en arrière, visibilité boostée) plutôt que d'un principe général. Beaucoup de personnes constatent qu'un profil plus fort (meilleures photos, bio plus précise) a plus d'impact sur les résultats qu'un abonnement premium sur un profil faible.",
      },
      {
        slug: "combien-de-swipes-par-jour-est-raisonnable",
        question: "Combien de swipes par jour est raisonnable ?",
        answer:
          "Il n'y a pas de bon chiffre universel — ce qui compte, c'est la qualité de l'attention que tu portes à chaque profil. Swiper machinalement pendant une heure sans vraiment regarder produit en général de moins bons résultats que dix minutes concentrées où tu lis vraiment les bios et regardes vraiment les photos.",
      },
      {
        slug: "faut-il-changer-dapp-si-ca-ne-marche-pas",
        question: "Si une application ne fonctionne pas pour moi, faut-il en changer ?",
        answer:
          "Avant de changer d'application, vérifie d'abord si le problème vient du profil lui-même plutôt que de la plateforme — un profil avec des photos faibles ou une bio vide donnera de mauvais résultats sur n'importe quelle application. Une analyse de profil comme celle de Flirtcraft permet de savoir si c'est vraiment un problème de plateforme ou un problème de profil avant de tout recommencer ailleurs.",
      },
    ],
  },
  {
    slug: "manque-de-matchs",
    title: "Pas assez de matchs",
    description: "Les vraies raisons pour lesquelles un profil ne reçoit pas de matchs, et ce qui a réellement un impact.",
    entries: [
      {
        slug: "pourquoi-je-nai-aucun-match",
        question: "Pourquoi je n'ai aucun match ?",
        answer:
          "Dans l'immense majorité des cas, le problème vient de la photo principale ou d'une bio vide, pas d'un manque de « chance ». Une photo principale floue, sombre, prise de trop loin, ou une photo de groupe, coupe la conversion dès la première seconde avant même que le reste du profil soit vu. Vérifier ces deux éléments en premier résout la majorité des profils à zéro match.",
      },
      {
        slug: "matchs-mais-pas-de-conversation",
        question: "J'ai des matchs mais les conversations meurent tout de suite, pourquoi ?",
        answer:
          "C'est souvent un problème de message d'ouverture générique (« salut, ça va ? ») qui ne donne rien de précis auquel répondre. Reprendre un détail concret de la bio ou d'une photo de la personne pour ouvrir la conversation multiplie nettement les chances d'obtenir une vraie réponse plutôt qu'un silence.",
      },
      {
        slug: "faut-il-swiper-a-droite-sur-tout-le-monde",
        question: "Swiper à droite sur tout le monde augmente-t-il mes chances de match ?",
        answer:
          "Ça augmente le nombre brut de matchs, mais souvent au prix de la qualité — tu te retrouves avec des matchs pour lesquels tu n'as en réalité aucun intérêt, ce qui gaspille du temps et de l'énergie de conversation des deux côtés. Certaines applications réduisent aussi la visibilité des profils qui swipent à droite de façon indiscriminée.",
      },
      {
        slug: "lalgorithme-me-penalise-t-il",
        question: "Est-ce que l'algorithme de l'application me pénalise ?",
        answer:
          "C'est une inquiétude fréquente mais rarement vérifiable de l'extérieur — les algorithmes exacts ne sont pas publics. Ce qui est vérifiable et sous ton contrôle, en revanche, c'est la qualité de ton profil : avant de soupçonner l'algorithme, vaut mieux éliminer les causes les plus courantes et les plus fréquentes (photos faibles, bio vide, mauvaise première photo).",
      },
      {
        slug: "profil-vu-mais-pas-de-swipe",
        question: "Beaucoup de gens voient mon profil mais personne ne swipe, pourquoi ?",
        answer:
          "Ça pointe presque toujours vers un problème de conversion sur le profil lui-même plutôt que de visibilité : les gens t'ouvrent (donc l'algorithme te montre bien) mais ce qu'ils voient une fois le profil ouvert ne les convainc pas. Regarder froidement chaque photo et se demander « qu'est-ce que cette photo dit vraiment de moi » aide à identifier le point faible.",
      },
      {
        slug: "combien-de-temps-avant-de-voir-des-resultats",
        question: "Après avoir amélioré mon profil, combien de temps avant de voir des résultats ?",
        answer:
          "Souvent quelques jours suffisent à voir une différence, notamment si tu changes la photo principale — c'est l'élément qui a le plus d'impact immédiat sur le taux de swipe. Les changements de bio prennent un peu plus de temps à se ressentir, puisqu'ils influencent surtout la qualité des conversations plus que le taux brut de match.",
      },
      {
        slug: "faut-il-changer-de-photos-regulierement",
        question: "Faut-il changer ses photos régulièrement même si elles marchent bien ?",
        answer:
          "Pas besoin de tout changer si un profil fonctionne, mais actualiser une ou deux photos tous les quelques mois permet de rester visible auprès des personnes qui ont déjà vu ton profil sans matcher, et de garder un profil qui reflète vraiment ta vie actuelle plutôt qu'une photo d'il y a trois ans.",
      },
      {
        slug: "trop-selectif-ou-pas-assez",
        question: "Suis-je trop sélectif(ve) ou pas assez ?",
        answer:
          "Difficile à savoir sans données, mais un bon repère est de regarder ton taux de swipe à droite sur une semaine : un taux extrêmement bas (moins de 5-10%) peut indiquer une sélectivité qui limite mécaniquement le nombre de matchs possibles, tandis qu'un taux très élevé sans discernement mène souvent à des matchs peu compatibles.",
      },
      {
        slug: "age-influence-t-il-le-nombre-de-matchs",
        question: "L'âge influence-t-il vraiment le nombre de matchs ?",
        answer:
          "Les préférences d'âge jouent un rôle réel dans qui voit ton profil, mais l'impact d'un profil bien construit (photos fortes, bio précise) reste généralement plus déterminant que l'âge seul sur le taux de conversion une fois que le profil est vu.",
      },
      {
        slug: "comment-savoir-quelle-partie-du-profil-bloque",
        question: "Comment savoir précisément quelle partie de mon profil bloque les matchs ?",
        answer:
          "C'est le point le plus difficile à juger seul(e), parce qu'on manque de recul sur ses propres photos et sa propre bio. Un outil d'analyse comme Flirtcraft note séparément les photos, la bio et le potentiel de conversation, ce qui permet de voir précisément où se situe le point faible plutôt que de deviner au hasard ce qu'il faut changer.",
      },
    ],
  },
  {
    slug: "conversation-et-premiers-messages",
    title: "Conversation & premiers messages",
    description: "Comment ouvrir une conversation, la faire durer, et relancer un échange qui s'essouffle.",
    entries: [
      {
        slug: "comment-ouvrir-une-conversation",
        question: "Comment ouvrir une conversation efficacement ?",
        answer:
          "Le meilleur message d'ouverture reprend un détail précis de la bio ou d'une photo de la personne, plutôt qu'un « salut, comment vas-tu ? » générique qui ne donne rien à répondre. Une question ouverte sur ce détail (« ce sommet sur ta photo, c'était où ? ») montre que tu as vraiment regardé son profil et donne un vrai point de départ.",
      },
      {
        slug: "faut-il-repondre-vite",
        question: "Faut-il répondre vite pour ne pas perdre l'intérêt de la personne ?",
        answer:
          "Il n'y a pas de délai magique, mais laisser passer plusieurs jours sans réponse envoie souvent un signal de désintérêt, même involontaire. À l'inverse, répondre instantanément à chaque message peut parfois donner une impression de disponibilité excessive. Un délai de quelques heures à une journée reste un repère raisonnable dans la plupart des cas.",
      },
      {
        slug: "conversation-qui-sessouffle",
        question: "Comment relancer une conversation qui commence à s'essouffler ?",
        answer:
          "Quand les réponses deviennent courtes ou que les échanges de type question-réponse s'épuisent, changer complètement de sujet plutôt que d'insister sur le même thème relance souvent la dynamique. Le coach de conversation de Flirtcraft, par exemple, prend une conversation en panne et propose plusieurs façons concrètes de la relancer selon le contexte réel de l'échange.",
      },
      {
        slug: "combien-de-temps-avant-de-proposer-un-rendez-vous",
        question: "Après combien de messages faut-il proposer un rendez-vous ?",
        answer:
          "En général, proposer un rendez-vous après quelques échanges qui montrent un vrai intérêt mutuel — pas après un seul message, mais pas non plus après trois semaines de conversation qui n'avance nulle part. Une conversation qui va bien peut supporter une proposition dès le troisième ou quatrième échange.",
      },
      {
        slug: "ghosting-que-faire",
        question: "Que faire si quelqu'un me ghost (arrête de répondre sans explication) ?",
        answer:
          "Rien de spécial à faire de ton côté — un ou deux messages de relance espacés dans le temps sont acceptables, mais insister au-delà ne change généralement rien et peut être perçu négativement. Le ghosting en dit plus sur la personne qui l'exerce que sur la qualité de ta conversation ou de ton profil.",
      },
      {
        slug: "trop-de-questions-dans-une-conversation",
        question: "Est-ce un problème de poser trop de questions dans une conversation ?",
        answer:
          "Oui, si la conversation devient un interrogatoire à sens unique. Une bonne conversation alterne questions et partages personnels — répondre à ta propre question avant de la poser à l'autre personne (« moi j'ai grandi à la campagne, et toi ? ») rend l'échange plus naturel qu'une série de questions fermées.",
      },
      {
        slug: "faut-il-donner-son-numero-rapidement",
        question: "Faut-il passer sur WhatsApp ou par SMS rapidement ?",
        answer:
          "Ça dépend surtout de la qualité de la conversation sur l'application plutôt que d'un délai fixe. Certaines personnes préfèrent rester sur l'application un moment pour garder une trace et un cadre plus sûr avant de partager un numéro personnel — c'est un choix légitime, pas un manque d'intérêt.",
      },
      {
        slug: "comment-savoir-si-la-conversation-va-bien",
        question: "Comment savoir si une conversation se passe vraiment bien ?",
        answer:
          "Des réponses qui s'allongent avec le temps, des questions posées en retour, et un ton qui devient plus personnel ou plus taquin sont de bons signes. À l'inverse, des réponses systématiquement courtes, des délais qui s'allongent, ou une absence de questions en retour indiquent souvent un intérêt limité, même si la personne continue techniquement de répondre.",
      },
      {
        slug: "message-douverture-avec-humour",
        question: "Un message d'ouverture avec de l'humour fonctionne-t-il mieux ?",
        answer:
          "Un message léger ou une petite pointe d'humour se démarque souvent d'un message purement factuel, à condition de rester lié à quelque chose de réel dans le profil de la personne plutôt qu'une blague générique copiée-collée que la personne a probablement déjà reçue dix fois.",
      },
      {
        slug: "sentraîner-avant-vrais-rendez-vous",
        question: "Peut-on s'entraîner à tenir une conversation avant les vrais échanges ?",
        answer:
          "Oui, et c'est sous-estimé : s'entraîner sur des mises en situation permet de repérer ses propres réflexes (questions trop fermées, réponses trop courtes) sans enjeu réel. Le simulateur de match de Flirtcraft reproduit une vraie conversation avec un match simulé, pour identifier ces habitudes avant qu'elles ne coûtent une vraie conversation.",
      },
    ],
  },
  {
    slug: "confiance-en-soi",
    title: "Confiance en soi",
    description: "Comment aborder les applications de rencontre sans se laisser abattre par le rejet, et pourquoi la régularité compte plus que la perfection.",
    entries: [
      {
        slug: "gerer-le-manque-de-reponses",
        question: "Comment gérer psychologiquement le manque de réponses ?",
        answer:
          "Le silence sur une application de rencontre dit très rarement quelque chose de précis sur toi — la plupart des gens swipent vite, sont débordés de messages, ou changent simplement d'avis sans explication. Traiter chaque silence comme une donnée statistique plutôt qu'un jugement personnel aide à garder une énergie stable sur la durée, qui compte plus que n'importe quel message parfait.",
      },
      {
        slug: "combien-de-temps-avant-dabandonner",
        question: "Après combien de temps sans résultat faut-il changer d'approche ?",
        answer:
          "Si plusieurs semaines de swipe régulier ne donnent presque aucun match, ça vaut la peine de revoir le profil objectivement plutôt que de continuer avec le même profil en espérant un résultat différent. Le problème vient très souvent d'un ou deux éléments précis et identifiables, pas d'un manque de chance généralisé.",
      },
      {
        slug: "peur-du-rejet-application-de-rencontre",
        question: "Comment gérer la peur du rejet sur une application de rencontre ?",
        answer:
          "Un rejet sur une application de rencontre — un non-match, un silence, une conversation qui s'arrête — a un coût émotionnel bien plus faible qu'un rejet en face à face, même si ça ne le ressent pas toujours comme tel sur le moment. Se rappeler que c'est un jeu de volume statistique, pas un jugement individuel répété, aide à continuer sans se décourager après chaque non-match.",
      },
      {
        slug: "faut-il-etre-quelquun-dautre-sur-son-profil",
        question: "Faut-il enjoliver ou exagérer sur son profil pour plaire davantage ?",
        answer:
          "Ça peut augmenter les matchs à court terme mais crée un décalage qui se révèle presque toujours lors de la première rencontre, ce qui coûte plus cher au final qu'un profil honnête qui attire moins de monde mais des personnes réellement compatibles. Un profil bien présenté (bonnes photos, bio bien écrite) n'est pas mentir — c'est se montrer sous son meilleur jour réel.",
      },
      {
        slug: "comment-rester-motive-sur-la-duree",
        question: "Comment rester motivé(e) sur la durée avec les applications de rencontre ?",
        answer:
          "Se fixer un rythme raisonnable (quelques minutes par jour plutôt que des sessions marathon) évite l'épuisement qui pousse beaucoup de gens à abandonner après quelques semaines. Suivre ses propres progrès concrets — plus de matchs, de meilleures conversations — plutôt que de se comparer aux autres aide aussi à garder une motivation stable.",
      },
      {
        slug: "faut-il-prendre-une-pause-des-applications",
        question: "Faut-il parfois faire une pause des applications de rencontre ?",
        answer:
          "Oui, si l'utilisation commence à peser plus qu'elle n'apporte — beaucoup de gens ressentent une fatigue réelle après des semaines de swipe sans résultat satisfaisant. Une pause de quelques jours ou semaines, suivie d'un profil retravaillé plutôt qu'un simple retour à l'identique, donne souvent de meilleurs résultats qu'une utilisation continue sans recul.",
      },
      {
        slug: "trop-de-swipe-a-gauche-quest-ce-que-ca-dit-de-moi",
        question: "Est-ce mal de swiper beaucoup à gauche ?",
        answer:
          "Non — swiper à gauche sur les profils qui ne t'intéressent vraiment pas est exactement le comportement attendu, et ça n'a rien à voir avec être « trop difficile ». Le vrai problème serait d'avoir un profil personnel faible qui te fait passer à côté de personnes qui t'auraient plu.",
      },
    ],
  },
  {
    slug: "securite-et-arnaques",
    title: "Sécurité & arnaques",
    description: "Reconnaître les faux profils et les arnaques les plus courantes, et se protéger sans devenir paranoïaque.",
    entries: [
      {
        slug: "comment-reconnaitre-un-faux-profil",
        question: "Comment reconnaître un faux profil (catfish) ?",
        answer:
          "Les signaux les plus courants sont des photos qui semblent trop parfaites ou clairement issues d'un shooting professionnel/mannequin, une bio quasi vide, et un compte très récent avec peu d'activité. Une recherche d'image inversée sur une des photos permet souvent de vérifier rapidement si elles circulent ailleurs sous un autre nom.",
      },
      {
        slug: "demande-dargent-sur-application-de-rencontre",
        question: "Quelqu'un me demande de l'argent après quelques semaines de discussion, que faire ?",
        answer:
          "C'est l'un des signaux d'arnaque les plus fiables, presque sans exception — coupe la conversation et signale le profil directement depuis l'application. Aucune histoire, même la plus convaincante (urgence médicale, problème de visa, opportunité d'investissement), ne justifie un envoi d'argent à quelqu'un que tu n'as jamais rencontré en personne.",
      },
      {
        slug: "premier-rendez-vous-en-securite",
        question: "Comment organiser un premier rendez-vous en toute sécurité ?",
        answer:
          "Donne rendez-vous dans un lieu public, informe un proche de l'heure et du lieu, et prévois ton propre moyen de transport plutôt que de dépendre entièrement de la personne que tu rencontres. Rien de tout ça n'est excessif — c'est une précaution standard, même pour un rendez-vous qui se passe très bien.",
      },
      {
        slug: "photos-volees-sur-internet",
        question: "Comment vérifier si les photos d'un profil sont volées sur internet ?",
        answer:
          "Une recherche d'image inversée (via Google Images ou un outil dédié) permet de voir si la même photo apparaît ailleurs, associée à un autre nom ou une autre situation. Ce n'est pas infaillible, mais c'est un premier réflexe simple et gratuit avant d'investir du temps émotionnel dans une conversation.",
      },
      {
        slug: "faut-il-partager-son-adresse",
        question: "À partir de quand peut-on partager son adresse personnelle ?",
        answer:
          "Il n'y a pas de règle universelle, mais la plupart des recommandations de sécurité conseillent d'attendre d'avoir rencontré la personne plusieurs fois en personne, dans des lieux publics, avant de partager une adresse personnelle — même avec quelqu'un qui semble parfaitement sincère en conversation.",
      },
      {
        slug: "profil-qui-veut-quitter-lapplication-tres-vite",
        question: "Pourquoi certains profils insistent-ils pour discuter en dehors de l'application immédiatement ?",
        answer:
          "C'est un signal à prendre au sérieux, surtout combiné à d'autres éléments suspects (photos trop parfaites, réponses très rapides et génériques) : certaines arnaques cherchent justement à sortir de l'application le plus vite possible, avant que leur profil ne soit signalé ou vérifié par la plateforme.",
      },
    ],
  },
];

export function findFaqCategory(slug: string): FaqCategory | undefined {
  return FAQ_CATEGORIES.find((c) => c.slug === slug);
}

export function allFaqEntries(): (FaqEntry & { categorySlug: string; categoryTitle: string })[] {
  return FAQ_CATEGORIES.flatMap((cat) =>
    cat.entries.map((entry) => ({ ...entry, categorySlug: cat.slug, categoryTitle: cat.title }))
  );
}
