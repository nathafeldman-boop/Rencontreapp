# MatchAI

> "Obtiens plus de matchs grâce à une analyse IA de ton profil."

Web app mobile-first qui analyse les profils Tinder / Hinge / Bumble via l'IA et
convertit du trafic TikTok en abonnés premium.

Ce document décrit la **fondation technique** du projet : elle est pensée pour
scaler d'un MVP à quelques milliers d'utilisateurs sans réécriture.

**État actuel (fin de l'étape 4 — préparation au lancement)** : le produit
est fonctionnellement complet — TikTok → landing (3 variantes testables) →
compte → onboarding → upload → analyse → résultat gratuit → paywall →
**abonnement Stripe réel** → dashboard premium avec 5 outils IA (Photo
Optimizer, Bio Generator, Conversation Coach, Match Simulator, Dating
Plan). Le scoring et les outils IA appellent Mistral pour de vrai, avec
repli automatique sur une logique déterministe en cas d'échec — voir §9.
Cette étape ajoute ce qu'il faut pour recevoir du trafic réel : tracking
complet du funnel, A/B testing de la landing, SEO (5 pages + blog),
programme de parrainage, pages créateurs, rate limiting, et une suite de
tests E2E — voir §12 à §19.

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
│   │   ├── referrals/                  # PREMIUM-adjacent — auth only, no subscription gate
│   │   │   ├── layout.tsx              # (on purpose: a free user needs this to earn access)
│   │   │   └── page.tsx                # lien de parrainage, progression, récompenses
│   │   ├── r/[code]/route.ts           # GET — pose le cookie mai_ref, redirige vers "/"
│   │   ├── creator/[slug]/page.tsx     # landing personnalisée influenceur + code promo
│   │   │
│   │   ├── dashboard/                  # PREMIUM — gated by subscription OR referral bonus
│   │   │   ├── layout.tsx              # shell app + accès check, redirects to /paywall
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
│   │   ├── tinder-profile-review/      # SEO — landing par app (template partagé)
│   │   ├── hinge-profile-review/       # SEO
│   │   ├── bumble-profile-review/      # SEO
│   │   ├── ai-dating-coach/page.tsx    # SEO — page produit générale
│   │   ├── tinder-bio-generator/page.tsx # SEO — page feature Bio Generator
│   │   ├── blog/
│   │   │   ├── page.tsx                # index des articles
│   │   │   └── [slug]/page.tsx         # article (généré statiquement, 4 articles)
│   │   ├── sitemap.ts                  # GET /sitemap.xml
│   │   ├── robots.ts                   # GET /robots.txt
│   │   │
│   │   └── api/
│   │       ├── onboarding/route.ts     # POST — enregistre profil + réponses
│   │       ├── profile/route.ts        # POST crée un profil, PATCH met à jour la bio
│   │       ├── analyze/route.ts        # POST — analyzeProfile() (Mistral + fallback), écrit `analyses`
│   │       ├── stats/route.ts          # GET — compteur public pour le social proof landing
│   │       ├── photos/optimize/route.ts# POST — réordonne les photos ("Build my best profile")
│   │       ├── referrals/
│   │       │   ├── code/route.ts       # GET — code de parrainage (créé au premier appel)
│   │       │   └── stats/route.ts      # GET — invites, récompenses, prochain palier
│   │       ├── ai/
│   │       │   ├── bio-generator/route.ts        # POST — 5 bios (style choisi)
│   │       │   ├── conversation-coach/route.ts   # POST — 3 réponses suggérées
│   │       │   ├── match-simulator/message/route.ts # POST — tour de chat avec le persona IA
│   │       │   ├── match-simulator/end/route.ts     # POST — score final + feedback
│   │       │   └── dating-plan/route.ts          # POST génère le plan, PATCH coche un jour
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts   # POST — Checkout Session (+ code promo créateur auto-appliqué)
│   │       │   ├── webhook/route.ts    # POST — signature vérifiée, sync `subscriptions`
│   │       │   └── portal/route.ts     # POST — ouvre le Billing Portal Stripe
│   │       └── analytics/track/route.ts# POST — capture PostHog côté serveur
│   │
│   ├── components/
│   │   ├── ui/                         # primitives shadcn (button, card, input...)
│   │   ├── marketing/                  # sections landing : hero, problem, solution,
│   │   │                               # before-after, testimonials, final-cta, counter
│   │   ├── seo/                        # json-ld.tsx, app-review-landing.tsx (template partagé)
│   │   ├── onboarding/                 # chip-button, confidence-slider, photo-dropzone
│   │   ├── dashboard/                  # app-shell, sub-score-card, score-history-chart,
│   │   │                               # view-tracker, referrals/, photos/, bio/, coach/,
│   │   │                               # simulator/, plan/ (par outil)
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
│   │   ├── referrals/                  # code, attribution, récompenses, accès bonus (§15)
│   │   ├── experiments/                # A/B copy landing + assignation cookie (§13)
│   │   ├── security/rate-limit.ts      # rate limiting mémoire, appelé depuis proxy.ts (§16)
│   │   ├── seo/                        # site.ts (metadata builder), structured-data.ts
│   │   ├── content/                    # app-reviews.ts, blog-posts.ts (copy statique SEO)
│   │   ├── stripe/
│   │   │   ├── client.ts               # client Stripe serveur (singleton)
│   │   │   ├── plans.ts                # config des plans vendables (extensible : annuel, plus...)
│   │   │   ├── sync-subscription.ts    # écrit `subscriptions` depuis un objet Stripe
│   │   │   └── resolve-promo-discount.ts # code promo créateur -> Stripe Promotion Code
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
│   │   │   ├── funnels.ts              # groupements par étape (acquisition/activation/...)
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
│   └── proxy.ts                        # export `proxy()` — rate limit, session, A/B, attribution
│
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql               # schéma complet + RLS + policies storage
│       ├── 0002_analysis_extras.sql    # attractiveness_score, free_insights, is_simulated
│       ├── 0003_premium_features.sql   # photo_analyses, bio_generations, coach sessions,
│       │                                # match simulator sessions, dating_plans, ai_usage_events
│       ├── 0004_referrals.sql          # referrals, invites, rewards, creators (+ RLS, seed data)
│       └── 0005_storage_limits.sql     # limites taille/type sur le bucket profile-photos
│
├── tests/e2e/                          # Playwright — pages publiques + gating (§17)
├── playwright.config.ts
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

## 6. Analytics — infrastructure PostHog

PostHog est initialisé côté client (`lib/analytics/posthog-provider.tsx`,
pageviews automatiques) et côté serveur (`lib/analytics/server.ts`, pour
les événements sans contexte navigateur comme les webhooks Stripe). La
liste complète des événements et leur sémantique est en §12 "Analytics &
tracking".

---

## 7. Ce qui reste volontairement simplifié

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

## 8. Le tunnel de conversion (étape 2)

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

## 9. Le dashboard premium (étape 3)

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

## 10. Stripe — abonnement complet

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

## 11. Variables d'environnement (étape 3)

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

Étape 4 (analytics, SEO, parrainage, sécurité) n'ajoute **aucune** nouvelle
variable d'environnement requise — tout est construit sur ce qui existe
déjà (Supabase, Stripe, Mistral, PostHog, `NEXT_PUBLIC_SITE_URL`).

---

## 12. Analytics & tracking (étape 4)

Le funnel complet est instrumenté dans `lib/analytics/events.ts` (source de
vérité des noms d'événements) et `lib/analytics/funnels.ts` (regroupements
prêts à coller dans PostHog Insights).

| Étape | Événements |
|---|---|
| Acquisition | `landing_view`, `click_start_analysis`, `signup_started`, `signup_completed` |
| Activation | `onboarding_started`, `onboarding_completed`, `profile_upload_started`, `profile_upload_completed`, `analysis_started`, `analysis_completed` |
| Conversion | `paywall_viewed`, `checkout_started`, `subscription_created` |
| Rétention | `dashboard_viewed`, `analysis_repeated`, `ai_coach_used`, `bio_generated`, `conversation_coach_used`, `photo_optimizer_used`, `dating_plan_generated` |
| Growth | `referral_link_copied`, `referral_signup`, `referral_reward_granted` |
| Churn | `subscription_canceled` (webhook, `customer.subscription.updated/deleted`) |

Points d'attention sur la sémantique :

- **`signup_started` vs `signup_completed`** — le clic sur Google/email ne
  prouve pas qu'une session existe (OAuth redirige, le magic link attend un
  clic dans l'email). `signup_completed` fire donc **côté serveur**, dans
  `auth/callback/route.ts`, seulement après `exchangeCodeForSession`
  réussi, avec une heuristique (`created_at` ≈ `last_sign_in_at` à 5s près)
  pour ne pas re-compter une reconnexion comme un nouveau signup.
- **`subscription_created` / `subscription_canceled`** — toujours côté
  serveur depuis le webhook Stripe, jamais depuis le clic client : on ne
  fait jamais confiance à un retour client pour un événement de revenu.

Les 3 taux de conversion demandés se lisent directement dans
`KEY_CONVERSION_RATES` (`lib/analytics/funnels.ts`) :

```
Landing -> signup    : landing_view -> signup_completed
Signup -> analyse     : signup_completed -> analysis_completed
Analyse -> paiement    : analysis_completed -> subscription_created
```

Le **churn** n'est pas un ratio d'événements PostHog — la source de vérité
est `count(subscriptions.status = 'canceled') / count(subscriptions ever 'active')`
en base ; `subscription_canceled` sert à segmenter le *pourquoi* (jours
depuis signup, outils utilisés avant l'annulation), pas à calculer le taux.
Voir le commentaire `CHURN_EVENT` dans `funnels.ts`.

---

## 13. A/B testing de la landing

`lib/experiments/landing-copy.ts` centralise titre / sous-titre / CTA pour
3 variantes (`v1` "Get More Matches With AI", `v2` "Find Out Why You Get No
Matches", `v3` "Your Dating Profile Is Holding You Back") — changer un
texte ou en ajouter une 4e ne touche aucun composant.

**Comment ça marche sans feature flags PostHog** : `src/proxy.ts` assigne
une variante aléatoire au premier passage (cookie `mai_variant`, 90 jours)
via `lib/experiments/assign-variant.ts`. La landing reste **statiquement
générée** (`○` dans le build, critique pour un chargement rapide depuis
TikTok) : `Hero` et `FinalCta` rendent d'abord la variante par défaut
(identique au HTML statique, donc pas de mismatch d'hydratation), puis
lisent le cookie côté client après montage et basculent sur la vraie
variante (`lib/experiments/use-landing-variant.ts`) — léger flash pour les
variantes non-défaut, contrepartie acceptée pour garder la page cacheable.
La variante est attachée en propriété à `landing_view` et
`click_start_analysis`, donc segmentable dans PostHog sans configuration
supplémentaire.

Témoignages (`components/marketing/testimonials.tsx`) et le reste de la
copy landing restent de simples tableaux en tête de fichier — déjà
trivialement modifiables, pas besoin d'architecture dédiée.

---

## 14. SEO

- **Metadata** — `lib/seo/site.ts` (`buildMetadata()`) donne OpenGraph +
  Twitter Card + canonical cohérents à chaque page en un appel ; le layout
  racine pose `metadataBase`, un titre par défaut + template, et le JSON-LD
  Organization/SoftwareApplication (`components/seo/json-ld.tsx`).
- **`app/sitemap.ts`** / **`app/robots.ts`** — générés depuis les mêmes
  fichiers de contenu que les pages (`lib/content/app-reviews.ts`,
  `lib/content/blog-posts.ts`), donc jamais désynchronisés. `robots.ts`
  bloque `/dashboard`, `/settings`, `/onboarding`, `/analyze`, `/results`,
  `/api/`.
- **5 pages programmatiques** (`/tinder-profile-review`,
  `/hinge-profile-review`, `/bumble-profile-review` via le template
  partagé `components/seo/app-review-landing.tsx` ; `/ai-dating-coach` et
  `/tinder-bio-generator` en pages dédiées) — chacune avec sa propre
  metadata, un FAQ avec JSON-LD `FAQPage`, et un CTA vers `/auth/login`.
- **Blog** (`/blog` + `/blog/[slug]`) — 4 articles réels dans
  `lib/content/blog-posts.ts` (pas de lorem ipsum), générés statiquement
  (`generateStaticParams`), avec JSON-LD `Article`.

Toutes ces pages sont des Server Components sans `cookies()`/`searchParams`
dynamiques → prerendered statiquement (`○`/`●` dans `next build`).

---

## 15. Programme de parrainage & créateurs

### Parrainage utilisateur

- **Schéma** (`0004_referrals.sql`) : `referrals` (code par utilisateur),
  `referral_invites` (qui a été attribué à qui, `referred_user_id` unique
  → un compte n'est jamais compté deux fois), `referral_rewards` (ledger
  de récompenses avec `expires_at`).
- **Lien personnel** : `matchai.com/r/<code>` (`app/r/[code]/route.ts`) —
  pose le cookie `mai_ref` et redirige vers `/`, sans requête base (le code
  n'est validé qu'à l'inscription, pour que le lien reste rapide même
  scrapé/cliqué en boucle).
- **Attribution** : `lib/referrals/attribute-signup.ts`, appelé depuis
  `auth/callback` uniquement pour un signup *authentiquement nouveau*.
  Utilise le client `service_role` — c'est un flux serveur de confiance,
  pas une écriture pilotée par le client.
- **Récompenses** : 1 filleul → +7 jours, 5 filleuls → +1 mois (constantes
  dans `lib/referrals/rewards.ts`, idempotent via une contrainte unique
  `(user_id, reason)`). Elles **ne touchent jamais Stripe** :
  `lib/referrals/access.ts` vérifie juste qu'une récompense non expirée
  existe, et `dashboard/layout.tsx` accepte abonnement actif **ou**
  bonus de parrainage.
- **`/referrals`** vit délibérément *hors* du layout premium (`app/referrals/`,
  pas `app/dashboard/referrals/`) — un utilisateur gratuit doit pouvoir
  récupérer son lien et commencer à gagner des jours avant d'avoir gagné
  quoi que ce soit.

### Créateurs / influenceurs

- **`creators`** (même migration) : slug, nom, headline personnalisable,
  code promo — lecture publique (RLS `active = true`, aucune auth requise).
- **`/creator/<slug>`** — landing personnalisée (headline du créateur,
  code promo affiché), attribution par cookie `mai_creator` posée dans
  `src/proxy.ts` (`lib/referrals/assign-creator-cookie.ts`, "first touch
  wins" — n'écrase pas un cookie de parrainage déjà présent).
- **Code promo → vraie réduction Stripe** : `api/stripe/checkout/route.ts`
  lit le cookie `mai_creator`, résout `creators.promo_code` en Stripe
  Promotion Code (`lib/stripe/resolve-promo-discount.ts`,
  `stripe.promotionCodes.list`) et l'applique automatiquement à la
  Checkout Session ; sinon `allow_promotion_codes: true` laisse n'importe
  qui saisir un code manuellement. **Le code lui-même ne fait rien sans
  qu'un Coupon + Promotion Code du même nom existent dans le Dashboard
  Stripe** — c'est un réglage opérationnel, pas du code (voir checklist §18).

---

## 16. Sécurité & performance (étape 4)

**Rate limiting** — `lib/security/rate-limit.ts`, appliqué dans
`src/proxy.ts` avant que la requête n'atteigne une Route Handler. Fenêtre
fixe en mémoire, par IP + préfixe de route :

| Route | Limite |
|---|---|
| `/api/stripe/checkout` | 5 / min |
| `/api/onboarding` | 10 / min |
| `/api/profile` | 15 / min |
| `/api/analyze` | 5 / min |
| `/api/ai/*` | 20 / min |
| `/api/stats` | 30 / min |
| `/api/*` (reste) | 30 / min |

C'est réel et suffisant pour freiner l'abus au lancement, mais **en
mémoire** : ça réinitialise par instance et ne coordonne pas entre régions.
Avant de scaler au-delà d'une instance, migrer vers Upstash Redis ou un
limiteur de plateforme (Vercel Firewall / Cloudflare) — le point d'appel
dans `proxy.ts` ne change pas.

**Autres points vérifiés** :
- Chaque route mutante vérifie `auth.getUser()` avant toute écriture ;
  RLS reste la deuxième ligne de défense (voir §4, §9, §15).
- Le bucket `profile-photos` a maintenant une limite de taille (10MB) et
  une liste de types MIME autorisés au niveau du bucket
  (`0005_storage_limits.sql`) — pas seulement une vérification côté client
  contournable.
- Les crédits IA (§9) sont déjà une forme de rate limiting spécifique au
  coût Mistral, indépendante du rate limiting réseau ci-dessus.

**Performance** — la landing, les 5 pages SEO et le blog restent
statiquement générés (voir §13-14) malgré l'A/B testing et le tracking ;
`next.config.ts` active `optimizePackageImports` pour `lucide-react` ; le
layout racine pose des `<link rel="preconnect">` vers Supabase et PostHog ;
les appels Supabase publics non critiques (`/api/stats`, `/creator/[slug]`)
ont un timeout explicite (`abortSignal`) pour ne jamais faire attendre un
visiteur indéfiniment si la base est lente.

---

## 17. Tests

`npm run test:e2e` (Playwright, voir `tests/e2e/README.md` pour le détail) :

- Chaque page publique (landing, 5 pages SEO, blog + articles,
  `sitemap.xml`, `robots.txt`) répond 200 avec son H1 et son CTA.
- Chaque route protégée (`/onboarding` → `/dashboard/*`) redirige un
  visiteur non connecté vers `/auth/login`.
- `/r/<code>` redirige correctement.

Ce qui **n'est pas** couvert automatiquement — nécessite un projet
Supabase + Stripe test seedé, hors de portée d'un environnement sans ces
identifiants :

- Le funnel complet signup → onboarding → upload → analyse → résultat.
- Paywall → Stripe Checkout → webhook → déblocage dashboard.
- Les 5 outils IA premium avec un vrai appel Mistral.
- L'attribution de parrainage bout en bout (cookie → signup → récompense).

### Checklist QA manuelle (avant chaque release)

**Parcours gratuit** : Landing (bonne variante visible) → Signup (Google
*et* email) → Onboarding (7 étapes, retour en arrière) → Upload (drag &
drop, validation taille/type) → Analyse (10-15s, pas de blocage si Mistral
indisponible) → Résultat (score + insights + contenu flouté) → Paywall.

**Parcours premium** : Checkout Stripe (carte test) → retour `/dashboard`
(vérifier que le léger délai webhook n'affiche pas le paywall par erreur)
→ chacun des 5 outils produit un résultat exploitable → Settings > Manage
billing ouvre bien le Portal Stripe → annulation reflétée dans `subscriptions`.

**Parrainage** : copier le lien, ouvrir en navigation privée, s'inscrire →
vérifier `referral_invites` + badge dans `/referrals` → répéter jusqu'à 5
pour valider le palier +1 mois.

---

## 18. Checklist de lancement

- [ ] **Domaine** : DNS pointé vers Vercel, `NEXT_PUBLIC_SITE_URL` mis à
      jour partout (Vercel + `.env` locaux), certificat SSL actif.
- [ ] **Stripe production** : basculer les clés test → live
      (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), recréer
      le produit + prix 7,99€/mois en mode live, reconfigurer le webhook
      sur l'URL de production, créer les Coupons/Promotion Codes pour
      chaque créateur listé dans `creators` (voir §15).
- [ ] **Variables d'environnement** : toutes celles de §11 renseignées en
      Production *et* Preview sur Vercel — un secret manquant fait planter
      `serverEnv` au premier accès, pas au build (voir `lib/env.ts`).
- [ ] **Supabase** : projet en plan payant si le trafic attendu dépasse le
      tier gratuit, migrations `0001` → `0005` appliquées dans l'ordre,
      provider Google OAuth configuré avec l'URL de callback de prod,
      `supabase gen types` régénéré une dernière fois.
- [ ] **Emails** : template Supabase Auth (magic link) personnalisé à la
      marque plutôt que le défaut générique.
- [ ] **Analytics** : projet PostHog en prod, clé renseignée, dashboards
      construits à partir de `lib/analytics/funnels.ts` (§12) avant le
      premier euro de trafic payant — pas après.
- [ ] **Monitoring** : activer les alertes Vercel (erreurs/latence) et les
      logs Supabase ; brancher un endpoint d'erreur (Sentry ou équivalent)
      — non inclus dans ce build, à ajouter avant un vrai volume TikTok.
- [ ] **Rate limiting** : si le trafic dépasse une seule instance Vercel,
      migrer `lib/security/rate-limit.ts` vers Upstash avant le lancement
      payant (voir §16) — sinon la protection ne coordonne pas entre régions.
- [ ] **QA finale** : dérouler la checklist manuelle du §17 sur l'URL de
      production avec de vraies clés test Stripe avant d'ouvrir le trafic.

---

## 19. Métriques à surveiller — 30 premiers jours

| Catégorie | Métrique | Où la lire |
|---|---|---|
| Acquisition | Visiteurs landing par variante (`v1`/`v2`/`v3`) | PostHog, `landing_view` par `variant` |
| Acquisition | Landing → signup | `KEY_CONVERSION_RATES[0]` |
| Activation | Signup → analyse complétée | `KEY_CONVERSION_RATES[1]` |
| Activation | Taux d'abandon par étape d'onboarding | Funnel `onboarding_started` → `onboarding_completed` → `profile_upload_completed` |
| Conversion | Analyse → paiement | `KEY_CONVERSION_RATES[2]` |
| Conversion | Paywall vu → checkout démarré → abonnement créé | 3 événements consécutifs, taux de friction au paiement |
| Revenu | MRR, nombre d'abonnés actifs | `subscriptions.status = 'active'` en base |
| Rétention | % d'abonnés utilisant ≥1 outil IA dans les 7 jours | `RETENTION_EVENTS` par utilisateur, fenêtre 7j |
| Rétention | Churn (annulations / abonnés actifs) | Calcul SQL, voir §12 — pas un événement PostHog |
| Growth | Invitations envoyées vs. converties, coût d'acquisition par créateur | `referral_invites`, `referral_rewards`, code promo par créateur |
| Coût | Crédits IA consommés par fonctionnalité | `ai_usage_events` groupé par `feature` — signal avant-coureur d'un coût Mistral qui dérape |
| Qualité | Ratio `is_simulated: true` sur les analyses/outils | Si élevé après le lancement, Mistral échoue plus que prévu — investiguer avant que les utilisateurs le remarquent |
| SEO | Impressions/clics par page (`/tinder-profile-review`, etc.), classement sur les mots-clés ciblés | Google Search Console, à connecter après indexation |

---

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).
