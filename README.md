# MatchAI

> "Obtiens plus de matchs grâce à une analyse IA de ton profil."

Web app mobile-first qui analyse les profils Tinder / Hinge / Bumble via l'IA et
convertit du trafic TikTok en abonnés premium.

Ce document décrit la **fondation technique** du projet : elle est pensée pour
scaler d'un MVP à quelques milliers d'utilisateurs sans réécriture.

**État actuel (fin de l'étape 3)** : le tunnel complet fonctionne de bout
en bout — TikTok → landing → compte → onboarding → upload → analyse →
résultat gratuit → paywall → **abonnement Stripe réel** → dashboard
premium avec 5 outils IA (Photo Optimizer, Bio Generator, Conversation
Coach, Match Simulator, Dating Plan). Le scoring et les outils IA appellent
Mistral pour de vrai, avec repli automatique sur une logique déterministe
en cas d'échec (clé absente, timeout, réponse invalide) — voir §10.

---

## 1. Stack

| Domaine | Choix |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| UI | Composants shadcn/ui faits main (`src/components/ui`), Framer Motion |
| Backend | Route Handlers Next.js (`src/app/api/**`) |
| Base de données | Supabase PostgreSQL + Row Level Security |
| Auth | Supabase Auth — Google OAuth (obligatoire) + email magic link |
| Stockage | Supabase Storage (bucket `profile-photos`) |
| Paiement | Stripe (Checkout + webhooks) |
| IA | Mistral API (chat completions) |
| Analytics | PostHog (client + serveur) |
| Déploiement | Vercel |

Next.js 16 renomme `middleware.ts` en `proxy.ts` — c'est le nom utilisé ici
(`src/proxy.ts`). Params, `cookies()` et `headers()` sont asynchrones.

---

## 2. Arborescence

```
matchai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # "/" — landing page (acquisition TikTok)
│   │   ├── layout.tsx                  # layout racine (fonts, PostHog)
│   │   ├── globals.css                 # design tokens Tailwind v4
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx          # Google OAuth + email magic link
│   │   │   └── callback/route.ts       # échange code -> session
│   │   │
│   │   ├── onboarding/page.tsx         # 7 étapes : profil + upload photos/bio
│   │   ├── analyze/page.tsx            # animation de chargement (10-15s)
│   │   ├── results/page.tsx            # résultat gratuit (teaser + paywall)
│   │   ├── paywall/page.tsx            # conversion abonnement
│   │   │
│   │   ├── dashboard/                  # PREMIUM — gated by an active subscription (layout.tsx)
│   │   │   ├── layout.tsx              # shell app + subscription check, redirects to /paywall
│   │   │   ├── page.tsx                # Dating Score, sub-scores, history chart, badges
│   │   │   ├── photos/page.tsx         # Photo Optimizer
│   │   │   ├── bio/page.tsx            # Bio Generator
│   │   │   ├── coach/page.tsx          # Conversation AI Coach
│   │   │   ├── simulator/page.tsx      # Match Simulator
│   │   │   └── plan/page.tsx           # My Dating Improvement Plan
│   │   ├── settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                # compte + billing (Stripe Portal)
│   │   │
│   │   └── api/
│   │       ├── onboarding/route.ts     # POST — enregistre profil + réponses
│   │       ├── profile/route.ts        # POST crée un profil, PATCH met à jour la bio
│   │       ├── analyze/route.ts        # POST — analyzeProfile() (Mistral + fallback), écrit `analyses`
│   │       ├── stats/route.ts          # GET — compteur public pour le social proof landing
│   │       ├── photos/optimize/route.ts# POST — réordonne les photos ("Build my best profile")
│   │       ├── ai/
│   │       │   ├── bio-generator/route.ts        # POST — 5 bios (style choisi)
│   │       │   ├── conversation-coach/route.ts   # POST — 3 réponses suggérées
│   │       │   ├── match-simulator/message/route.ts # POST — tour de chat avec le persona IA
│   │       │   ├── match-simulator/end/route.ts     # POST — score final + feedback
│   │       │   └── dating-plan/route.ts          # POST génère le plan, PATCH coche un jour
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts   # POST — crée une Checkout Session Stripe
│   │       │   ├── webhook/route.ts    # POST — signature vérifiée, sync `subscriptions`
│   │       │   └── portal/route.ts     # POST — ouvre le Billing Portal Stripe
│   │       └── analytics/track/route.ts# POST — capture PostHog côté serveur
│   │
│   ├── components/
│   │   ├── ui/                         # primitives shadcn (button, card, input...)
│   │   ├── marketing/                  # sections landing : hero, problem, solution,
│   │   │                               # before-after, testimonials, final-cta, counter
│   │   ├── onboarding/                 # chip-button, confidence-slider, photo-dropzone
│   │   ├── dashboard/                  # app-shell, sub-score-card, score-history-chart,
│   │   │                               # photos/, bio/, coach/, simulator/, plan/ (par outil)
│   │   ├── settings/                   # billing-card.tsx (Stripe Portal)
│   │   ├── results/                    # results-view.tsx
│   │   └── shared/                     # google-icon.tsx, etc.
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # client navigateur
│   │   │   ├── server.ts               # client Server Components / Route Handlers
│   │   │   ├── admin.ts                # client service_role (webhooks, stats agrégées)
│   │   │   ├── proxy.ts                # rafraîchit la session, protège les routes
│   │   │   └── signed-photo-urls.ts    # URLs signées Storage pour l'affichage + la vision Mistral
│   │   ├── subscriptions/get-active-subscription.ts # lecture RLS-safe du plan actif
│   │   ├── stripe/
│   │   │   ├── client.ts               # client Stripe serveur (singleton)
│   │   │   ├── plans.ts                # config des plans vendables (extensible : annuel, plus...)
│   │   │   └── sync-subscription.ts    # écrit `subscriptions` depuis un objet Stripe
│   │   ├── ai/
│   │   │   ├── mistral.ts              # wrapper fetch + JSON helper, supporte le multimodal (vision)
│   │   │   ├── simulate-analysis.ts    # repli déterministe pour l'analyse de profil
│   │   │   ├── analyze-profile.ts      # analyse réelle (Mistral vision) + fallback
│   │   │   ├── generate-bios.ts        # Bio Generator + fallback par templates
│   │   │   ├── conversation-coach.ts   # Conversation Coach + fallback par templates
│   │   │   ├── match-simulator.ts      # réponses du persona + scoring de fin de session
│   │   │   ├── generate-plan.ts        # plan 7 jours + fallback par template
│   │   │   └── credits.ts              # quota mensuel de crédits IA par utilisateur
│   │   ├── analytics/
│   │   │   ├── events.ts               # noms d'événements typés (source de vérité)
│   │   │   ├── posthog-provider.tsx    # init client + tracking des pageviews
│   │   │   ├── track.ts                # track() côté client
│   │   │   └── server.ts               # trackServer() côté serveur
│   │   ├── validations/                # schémas Zod (onboarding, profile)
│   │   ├── api/response.ts             # helpers de réponse JSON standardisés
│   │   ├── env.ts                      # validation Zod des variables d'env
│   │   └── utils.ts                    # cn()
│   │
│   ├── types/database.types.ts         # types Supabase (à régénérer une fois le projet créé)
│   ├── hooks/                          # (réservé)
│   └── proxy.ts                        # export `proxy()` — middleware Next 16
│
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql               # schéma complet + RLS + policies storage
│       ├── 0002_analysis_extras.sql    # attractiveness_score, free_insights, is_simulated
│       └── 0003_premium_features.sql   # photo_analyses, bio_generations, coach sessions,
│                                        # match simulator sessions, dating_plans, ai_usage_events
│
├── components.json                     # config shadcn/ui
└── .env.example
```

---

## 3. Rôle de chaque dossier

- **`app/`** — uniquement des pages et des route handlers. Pas de logique
  métier ici : une page appelle un `lib/` ou un `api/`, jamais l'inverse.
- **`components/ui/`** — primitives génériques, sans connaissance du domaine
  dating (bouton, carte, input...). Réutilisables tels quels dans n'importe
  quel écran.
- **`components/{marketing,onboarding,dashboard,results}/`** — composants
  spécifiques à un flow, peuvent importer `components/ui` et `lib/`.
- **`lib/supabase/`** — un seul endroit qui sait comment parler à Supabase.
  Trois clients différents selon le contexte d'exécution (navigateur, Server
  Component, tâche privilégiée) pour ne jamais exposer la service role key
  au client.
- **`lib/validations/`** — schémas Zod partagés entre le front (validation
  avant envoi) et les Route Handlers (validation à la frontière système).
- **`lib/analytics/`** — un seul fichier (`events.ts`) définit tous les noms
  d'événements du funnel ; `track()` et `trackServer()` s'en servent pour
  éviter les typos qui cassent le reporting.
- **`supabase/migrations/`** — schéma versionné, appliqué via
  `supabase db push` ou le MCP Supabase. Source de vérité du schéma, avant
  le code applicatif.

---

## 4. Schéma de base de données

Voir `supabase/migrations/0001_init.sql` pour le SQL complet (enums,
contraintes, policies RLS, bucket Storage). Résumé :

- **`public.users`** — étend `auth.users` (1:1, même `id`). Une trigger sur
  `auth.users` crée automatiquement la ligne à l'inscription (Google ou
  email). `dating_apps_used` est un tableau d'enum plutôt que du texte
  libre, pour du reporting fiable.
- **`public.profiles`** — un profil dating soumis à l'analyse (bio + chemins
  de photos dans Storage). `photos` stocke des chemins d'objets, jamais des
  URLs publiques : le bucket est privé.
- **`public.onboarding_answers`** — paires question/réponse libres,
  découplées du schéma des questions elles-mêmes (permet d'ajouter des
  questions sans migration).
- **`public.analyses`** — un score global + 4 sous-scores (photo, bio,
  attractiveness, conversation) + un `recommendations` JSONB (tableau
  d'objets `{ category, title, detail }`, contenu payant) + `free_insights`
  (texte libre, teaser gratuit) + `is_simulated` (`true` tant que le score
  vient du moteur de simulation MVP et non de Mistral — voir §7).
- **`public.subscriptions`** — miroir de l'état Stripe. **Écriture réservée
  au service role** (webhook) : un utilisateur ne peut que lire sa propre
  ligne, jamais la modifier lui-même — évite qu'un client falsifie son statut
  premium.

RLS est activé sur toutes les tables : chaque policy compare
`auth.uid()` à `user_id`. Le bucket `profile-photos` suit la même logique
via le premier segment du chemin (`<user_id>/...`).

---

## 5. Comment les parties communiquent

```
Navigateur (Client Component)
   │  lib/supabase/client.ts (auth, storage upload direct)
   │  fetch("/api/...")
   ▼
Route Handler (app/api/**)
   │  lib/validations/*  → valide le body (Zod)
   │  lib/supabase/server.ts → identifie l'utilisateur, requêtes RLS-safe
   │  lib/ai/mistral.ts, lib/stripe/client.ts → services externes
   ▼
Supabase Postgres (RLS) / Stripe / Mistral
```

- Les **Server Components** (ex. `settings/page.tsx`) lisent directement via
  `lib/supabase/server.ts` — pas besoin de passer par une route API pour de
  la lecture.
- Les **mutations depuis le client** passent par une Route Handler, qui
  revalide les inputs et retourne un contrat JSON stable
  (`{ data }` / `{ error }`, voir `lib/api/response.ts`) — le front ne fait
  jamais confiance à des données non validées.
- `src/proxy.ts` s'exécute avant chaque requête : il rafraîchit le cookie de
  session Supabase et redirige vers `/auth/login` si une route protégée
  (`/dashboard`, `/settings`, `/onboarding`, `/analyze`, `/results`,
  `/paywall`) est visitée sans session.
- Stripe et l'app ne communiquent que via webhook signé
  (`api/stripe/webhook`) — jamais en faisant confiance à un retour client
  après paiement.

---

## 6. Analytics — funnel TikTok → abonné

Événements définis dans `lib/analytics/events.ts` (déjà câblés dans les
écrans concernés) :

| Événement | Où il se déclenche |
|---|---|
| `landing_page_viewed` | `app/page.tsx` au montage |
| `cta_clicked` | clic sur "Analyze My Profile Free" (hero ou footer landing) |
| `signup_completed` | après `signInWithOAuth` / `signInWithOtp` réussi |
| `onboarding_completed` | après le POST `/api/onboarding` réussi |
| `photos_uploaded` | après l'upload Storage réussi |
| `analysis_completed` | montage de `/results` |
| `paywall_viewed` | montage de `/paywall` |
| `subscription_purchased` | **côté serveur**, depuis le webhook Stripe une fois le paiement confirmé (pas côté client — ne jamais faire confiance à un retour client pour un événement de revenu) |

PostHog est initialisé côté client (`posthog-provider.tsx`, pageviews
automatiques) et côté serveur (`analytics/server.ts`, pour les événements
sans contexte navigateur comme les webhooks).

---

## 7. Le tunnel de conversion (étape 2)

Le funnel complet est fonctionnel de bout en bout :

```
TikTok → "/" (landing) → /auth/login → /onboarding (7 étapes) →
/analyze (simulation 10-15s) → /results (score + teaser) → /paywall
```

**Onboarding (`app/onboarding/page.tsx`)** — 7 étapes avec barre de
progression : (1) âge/genre/localisation, (2) app de dating principale,
(3) objectif, (4) matchs hebdo actuels, (5) plus gros problème,
(6) niveau de confiance (slider 1-10), (7) upload photos (drag & drop,
3-6 photos, validation type/poids) + bio. Les étapes 1-6 sont sauvegardées
dans `users` + `onboarding_answers` juste avant l'étape 7 (`POST
/api/onboarding`), pour ne rien perdre en cas d'abandon à l'upload. L'étape
7 crée le `profile` (`POST /api/profile`) après l'upload Storage.

**Moteur de simulation (`lib/ai/simulate-analysis.ts`)** — remplace
Mistral pour cette étape. Déterministe (seedé sur l'id du profil, donc
stable) et légèrement piloté par le profil réel (longueur de bio, nombre
de photos) pour ne pas être du bruit pur. Retourne exactement la forme
`AnalysisResult` que le futur appel Mistral devra produire — brancher la
vraie IA revient à réécrire `simulateAnalysis()` dans
`api/analyze/route.ts`, sans toucher `/analyze` ni `/results`.

**Résultat gratuit (`/results`)** — Server Component qui charge la ligne
`analyses` réelle via `?id=<analysis_id>` (RLS garantit que l'utilisateur
ne peut lire que la sienne) ; sans `id` valide, retombe sur des données de
démonstration (`?demo=1` ou navigation directe). Affiche le score global,
les 4 sous-scores, 1-2 `free_insights`, et une liste de recommandations
floutées (`recommendations.length`, contenu réel jamais envoyé au client
avant paiement).

**Social proof** — `GET /api/stats` expose un compteur agrégé
(`count(*) from analyses` + baseline pré-lancement) via le client
`service_role`, sans jamais exposer de données individuelles ; consommé
par `components/marketing/animated-counter.tsx` sur la landing.

---

## 8. Ce qui reste volontairement simplifié

- **Les témoignages de la landing** (`components/marketing/testimonials.tsx`)
  sont des exemples de copy à remplacer par de vrais avis vérifiés avant le
  lancement — voir le commentaire en tête de fichier.
- **Le plan annuel et un futur "premium+"** sont préparés dans
  `lib/stripe/plans.ts` (juste besoin d'un Stripe Price + une entrée de
  config) mais pas vendus dans l'UI actuelle, qui n'affiche que le mensuel
  à 7,99€.
- **`is_simulated`** reste `true` sur une ligne `analyses` (ou l'équivalent
  côté bio/coach/plan) chaque fois que l'appel Mistral échoue et que le
  repli déterministe prend le relais — utile pour distinguer les deux
  sources en base sans deviner.

---

## 9. Le tunnel de conversion (étape 2)

Le funnel gratuit (avant paiement) est fonctionnel de bout en bout :

```
TikTok → "/" (landing) → /auth/login → /onboarding (7 étapes) →
/analyze (10-15s) → /results (score + teaser) → /paywall
```

**Onboarding (`app/onboarding/page.tsx`)** — 7 étapes avec barre de
progression : (1) âge/genre/localisation, (2) app de dating principale,
(3) objectif, (4) matchs hebdo actuels, (5) plus gros problème,
(6) niveau de confiance (slider 1-10), (7) upload photos (drag & drop,
3-6 photos, validation type/poids) + bio. Les étapes 1-6 sont sauvegardées
dans `users` + `onboarding_answers` juste avant l'étape 7 (`POST
/api/onboarding`), pour ne rien perdre en cas d'abandon à l'upload. L'étape
7 crée le `profile` (`POST /api/profile`) après l'upload Storage.

**Résultat gratuit (`/results`)** — Server Component qui charge la ligne
`analyses` réelle via `?id=<analysis_id>` (RLS garantit que l'utilisateur
ne peut lire que la sienne) ; sans `id` valide, retombe sur des données de
démonstration (`?demo=1` ou navigation directe). Affiche le score global,
les 4 sous-scores, 1-2 `free_insights`, et une liste de recommandations
floutées (`recommendations.length`, contenu réel jamais envoyé au client
avant paiement).

**Social proof** — `GET /api/stats` expose un compteur agrégé
(`count(*) from analyses` + baseline pré-lancement) via le client
`service_role`, sans jamais exposer de données individuelles ; consommé
par `components/marketing/animated-counter.tsx` sur la landing.

---

## 10. Le dashboard premium (étape 3)

### Accès

`src/app/dashboard/layout.tsx` vérifie, côté serveur, qu'un abonnement
`active`/`trialing` existe (`lib/subscriptions/get-active-subscription.ts`)
et redirige vers `/paywall` sinon — c'est ce qui rend le dashboard
réellement "premium", en plus de l'authentification déjà gérée par
`proxy.ts`. Un court retry (1,5s) absorbe le décalage normal entre la
redirection de succès Stripe et l'arrivée du webhook.

### Architecture IA

Chaque outil premium suit le même patron : un module dans `lib/ai/`
appelle Mistral avec `response_format: json_object`, valide la réponse
avec un schéma Zod, et **retombe automatiquement sur une logique
déterministe** (templates ou heuristique) si l'appel échoue — clé absente,
timeout, JSON invalide. Rien ne casse si `MISTRAL_API_KEY` n'est pas
configurée ; le produit reste démontrable de bout en bout.

| Outil | Module | Modèle Mistral |
|---|---|---|
| Analyse de profil (photos + bio) | `ai/analyze-profile.ts` | `pixtral-large-latest` (vision) |
| Bio Generator | `ai/generate-bios.ts` | `mistral-large-latest` |
| Conversation Coach | `ai/conversation-coach.ts` | `mistral-large-latest` |
| Match Simulator (réponse + score) | `ai/match-simulator.ts` | `mistral-large-latest` |
| Dating Plan | `ai/generate-plan.ts` | `mistral-large-latest` |

L'analyse de profil envoie les photos à Mistral sous forme d'URLs signées
Storage (`lib/supabase/signed-photo-urls.ts`, expiration 5 min) — jamais
d'URL publique, le bucket reste privé. La réponse est mappée vers deux
tables : `analyses` (scores globaux) et `photo_analyses` (une ligne par
photo : score, points forts/faibles, rôle suggéré `primary`/`secondary`/
`remove`), consommées respectivement par le dashboard et le Photo
Optimizer.

### Crédits IA

`lib/ai/credits.ts` limite chaque compte à 200 crédits/mois (reset au 1er
du mois) ; chaque fonctionnalité a un coût fixe (`FEATURE_COST` — analyse
5, bio 2, coach 1, simulateur 3, plan 3), suivi dans
`ai_usage_events`. Chaque route IA appelle `checkCredits()` avant de
travailler et `consumeCredits()` seulement après un appel réussi — un
échec ne consomme jamais de crédit. L'analyse gratuite du funnel (avant
abonnement) ne consomme aucun crédit ; seules les ré-analyses depuis le
dashboard premium sont comptées.

### Les 5 outils

- **Photo Optimizer** (`/dashboard/photos`) — affiche le score et le
  rôle suggéré de chaque photo ; "Build my best profile" réordonne
  `profiles.photos` (primary → secondary → remove), sans jamais supprimer
  de fichier.
- **Bio Generator** (`/dashboard/bio`) — 5 bios par style (funny,
  mysterious, confident, romantic, premium), copier / régénérer / "Use
  this bio" (met à jour le profil via `PATCH /api/profile`).
- **Conversation Coach** (`/dashboard/coach`) — colle une conversation,
  reçoit 3 réponses (funny/flirty/natural) avec explication.
- **Match Simulator** (`/dashboard/simulator`) — chat en direct avec un
  persona IA (genre + personnalité choisis), "End & get my score" note la
  conversation et donne un feedback.
- **My Dating Improvement Plan** (`/dashboard/plan`) — plan de 7 jours
  généré à partir des scores les plus faibles, jours cochables, un seul
  plan actif par utilisateur (regénérer remplace l'existant).

### Rétention

La page dashboard calcule la variation de score depuis la dernière
analyse, affiche un historique (`ScoreHistoryChart`, SVG inline, sans
dépendance de charting) et des badges dérivés (jamais stockés — calculés à
la volée depuis `analyses` et `dating_plans`).

---

## 11. Stripe — abonnement complet

- **`lib/stripe/plans.ts`** — source de vérité des plans vendables. Ajouter
  l'annuel ou un futur "premium+" est une entrée de config + un Price
  Stripe, sans toucher au checkout ni au webhook (plan-agnostiques).
- **`POST /api/stripe/checkout`** — crée une Checkout Session en mode
  `subscription`. N'écrit rien en base (RLS interdit à `authenticated`
  d'écrire `subscriptions`) : Stripe crée le customer depuis
  `customer_email`, et c'est le webhook qui persiste tout une fois le
  paiement confirmé.
- **`POST /api/stripe/webhook`** — vérifie la signature, puis
  `checkout.session.completed` / `customer.subscription.updated` /
  `customer.subscription.deleted` appellent tous
  `lib/stripe/sync-subscription.ts` (client `service_role`) pour
  upserter `subscriptions` par `user_id`.
- **`POST /api/stripe/portal`** — ouvre le Billing Portal Stripe hébergé
  (changer de moyen de paiement, annuler) — c'est la "page billing", pas
  besoin de la reconstruire nous-mêmes. Exposée depuis `/settings` via
  `components/settings/billing-card.tsx`.

### Tester Stripe en local

```bash
# Terminal 1
npm run dev

# Terminal 2 — forward les webhooks vers l'app locale
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copier le "whsec_..." affiché dans STRIPE_WEBHOOK_SECRET (.env.local)

# Déclencher un paiement de test : ouvrir /paywall, s'abonner avec
# la carte de test 4242 4242 4242 4242 (n'importe quelle date/CVC futurs)
```

Pour simuler un abonnement déjà actif sans repasser par le checkout :

```bash
stripe trigger checkout.session.completed
```

Vérifier ensuite que `subscriptions.status = 'active'` en base et que
`/dashboard` devient accessible.

---

## 12. Variables d'environnement (étape 3)

En plus de celles de l'étape 1 (`NEXT_PUBLIC_SUPABASE_*`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, PostHog) :

| Variable | Requis | Description |
|---|---|---|
| `MISTRAL_API_KEY` | Oui (sinon repli simulation) | Clé API Mistral, utilisée par tous les modules `lib/ai/*` |
| `STRIPE_SECRET_KEY` | Oui | Clé secrète Stripe (serveur) |
| `STRIPE_WEBHOOK_SECRET` | Oui | Secret de signature du endpoint webhook (`stripe listen` ou dashboard Stripe) |
| `STRIPE_PRICE_ID_MONTHLY` | Oui | Price ID Stripe du plan premium à 7,99€/mois |
| `STRIPE_PRICE_ID_ANNUAL` | Non | Price ID du plan annuel — laisser vide tant qu'il n'est pas vendu |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Oui | Clé publique Stripe (déjà prévue, pas encore utilisée côté client — le checkout redirige entièrement côté serveur) |

---

## 13. Prochaines étapes (ordre recommandé)

1. **Provisionner Supabase** : créer le projet, appliquer les migrations
   dans l'ordre (`0001` → `0002` → `0003`), activer le provider Google
   dans Auth > Providers.
2. **Renseigner `.env.local`** à partir de `.env.example`, y compris les
   nouvelles clés Mistral/Stripe listées en §12.
3. **Régénérer les types Supabase** :
   `npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts`.
4. **Créer le produit Stripe** (7,99€/mois) et brancher le webhook en
   production (Dashboard Stripe > Developers > Webhooks).
5. **Tester le pipeline Mistral avec une vraie clé** — vérifier que
   `is_simulated: false` apparaît sur une analyse réelle, ajuster les
   prompts dans `lib/ai/*` si les résultats manquent de spécificité.
6. **Remplacer les témoignages placeholder** par de vrais avis utilisateurs.
7. **Limites & abus** : le quota de crédits existe déjà (§10) ; ajouter un
   rate-limit par IP sur les routes publiques (`/api/stats`,
   `/api/onboarding`) avant l'ouverture au trafic payant.
8. **PostHog** : créer le projet, renseigner les clés, construire les
   dashboards de funnel à partir des événements déjà envoyés, ajouter des
   événements sur l'usage des 5 outils premium (rétention).
9. **Tests + CI** avant d'ouvrir l'accès à de vrais utilisateurs.
10. **Déploiement Vercel** : connecter le repo, configurer les variables
    d'environnement en Production/Preview, configurer le domaine.

---

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).
