# MatchAI

> "Obtiens plus de matchs grâce à une analyse IA de ton profil."

Web app mobile-first qui analyse les profils Tinder / Hinge / Bumble via l'IA et
convertit du trafic TikTok en abonnés premium.

Ce document décrit la **fondation technique** du projet : elle est pensée pour
scaler d'un MVP à quelques milliers d'utilisateurs sans réécriture.

**État actuel (fin de l'étape 2)** : le tunnel complet TikTok → landing →
compte → onboarding → upload → analyse → résultat gratuit → paywall
fonctionne de bout en bout. Le scoring vient d'un **moteur de simulation
déterministe** (pas encore d'appel à Mistral) et Stripe Checkout est
préparé mais pas encore branché — voir "Ce qui est volontairement un stub".

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
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # shell app (nav, déconnexion) — protégé
│   │   │   └── page.tsx                # app premium
│   │   ├── settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                # compte + abonnement
│   │   │
│   │   └── api/
│   │       ├── onboarding/route.ts     # POST — enregistre profil + réponses
│   │       ├── profile/route.ts        # POST — crée un profil (bio, photos, app)
│   │       ├── analyze/route.ts        # POST — score via simulateAnalysis(), écrit dans `analyses`
│   │       ├── stats/route.ts          # GET — compteur public pour le social proof landing
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts   # POST — [STUB] Stripe Checkout Session
│   │       │   └── webhook/route.ts    # POST — vérifie la signature Stripe, TODO handlers
│   │       └── analytics/track/route.ts# POST — capture PostHog côté serveur
│   │
│   ├── components/
│   │   ├── ui/                         # primitives shadcn (button, card, input...)
│   │   ├── marketing/                  # sections landing : hero, problem, solution,
│   │   │                               # before-after, testimonials, final-cta, counter
│   │   ├── onboarding/                 # chip-button, confidence-slider, photo-dropzone
│   │   ├── dashboard/                  # app-shell.tsx (nav + layout dashboard/settings)
│   │   ├── results/                    # results-view.tsx
│   │   └── shared/                     # google-icon.tsx, etc.
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # client navigateur
│   │   │   ├── server.ts               # client Server Components / Route Handlers
│   │   │   ├── admin.ts                # client service_role (webhooks, stats agrégées)
│   │   │   └── proxy.ts                # rafraîchit la session, protège les routes
│   │   ├── stripe/client.ts            # client Stripe serveur (singleton)
│   │   ├── ai/
│   │   │   ├── mistral.ts              # wrapper fetch vers l'API Mistral (pas encore appelé)
│   │   │   └── simulate-analysis.ts    # moteur de scoring MVP — même contrat que Mistral
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
│       └── 0002_analysis_extras.sql    # attractiveness_score, free_insights, is_simulated
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

## 8. Ce qui est volontairement un stub

Pour rester honnête sur ce qui est réel vs. préparé :

- **`POST /api/stripe/checkout`** — retourne `501`. La création de
  Checkout Session Stripe arrive avec l'intégration paiement.
- **Le scoring IA** — vient de `simulateAnalysis()`, pas de Mistral (voir
  §7). Chaque ligne `analyses` a `is_simulated: true` tant que ça reste le
  cas, pour pouvoir distinguer les deux sources une fois Mistral branché.
- **Les témoignages de la landing** (`components/marketing/testimonials.tsx`)
  sont des exemples de copy à remplacer par de vrais avis vérifiés avant le
  lancement — voir le commentaire en tête de fichier.

---

## 9. Prochaines étapes (ordre recommandé)

1. **Provisionner Supabase** : créer le projet, appliquer les migrations
   dans l'ordre (`0001_init.sql` puis `0002_analysis_extras.sql`), activer
   le provider Google dans Auth > Providers.
2. **Renseigner `.env.local`** à partir de `.env.example`.
3. **Régénérer les types Supabase** :
   `npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts`.
4. **Brancher Stripe** : produit + prix 7,99€/mois, implémenter
   `api/stripe/checkout` et les handlers du webhook, tester avec
   `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
5. **Remplacer `simulateAnalysis()` par Mistral** dans `api/analyze/route.ts` :
   prompt de scoring, parsing structuré (`response_format: json_object`),
   passer `is_simulated: false`.
6. **Remplacer les témoignages placeholder** par de vrais avis utilisateurs.
7. **PostHog** : créer le projet, renseigner les clés, construire les
   dashboards de funnel à partir des événements déjà envoyés.
8. **Tests + CI** avant d'ouvrir l'accès à de vrais utilisateurs.
9. **Déploiement Vercel** : connecter le repo, configurer les variables
   d'environnement en Production/Preview, configurer le domaine.

---

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).
