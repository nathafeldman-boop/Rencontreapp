# MatchAI

> "Obtiens plus de matchs grâce à une analyse IA de ton profil."

Web app mobile-first qui analyse les profils Tinder / Hinge / Bumble via l'IA et
convertit du trafic TikTok en abonnés premium.

Ce document décrit la **fondation technique** du projet : elle est pensée pour
scaler d'un MVP à quelques milliers d'utilisateurs sans réécriture. Aucune
fonctionnalité IA n'est implémentée à ce stade — voir "Prochaines étapes".

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
│   │   ├── onboarding/page.tsx         # questions + upload photos + bio
│   │   ├── analyze/page.tsx            # écran de chargement de l'analyse
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
│   │       ├── analyze/route.ts        # POST — [STUB] pipeline IA
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts   # POST — [STUB] Stripe Checkout Session
│   │       │   └── webhook/route.ts    # POST — vérifie la signature Stripe, TODO handlers
│   │       └── analytics/track/route.ts# POST — capture PostHog côté serveur
│   │
│   ├── components/
│   │   ├── ui/                         # primitives shadcn (button, card, input...)
│   │   ├── marketing/                  # sections landing (réservé, vide pour l'instant)
│   │   ├── onboarding/                 # (réservé)
│   │   ├── dashboard/                  # app-shell.tsx (nav + layout dashboard/settings)
│   │   ├── results/                    # results-view.tsx
│   │   └── shared/                     # google-icon.tsx, etc.
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # client navigateur
│   │   │   ├── server.ts               # client Server Components / Route Handlers
│   │   │   ├── admin.ts                # client service_role (webhooks uniquement)
│   │   │   └── proxy.ts                # rafraîchit la session, protège les routes
│   │   ├── stripe/client.ts            # client Stripe serveur (singleton)
│   │   ├── ai/mistral.ts               # wrapper fetch vers l'API Mistral
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
│   └── migrations/0001_init.sql        # schéma complet + RLS + policies storage
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
- **`public.analyses`** — un score global + 3 sous-scores + un
  `recommendations` JSONB (tableau d'objets `{ category, title, detail }`).
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
| `cta_clicked` | clic sur "Analyser mon profil gratuitement" |
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

## 7. Ce qui est volontairement un stub

Pour rester une fondation et non une implémentation prématurée :

- **`POST /api/analyze`** — retourne `501`. Le pipeline réel (charger le
  profil → prompt Mistral → écrire dans `analyses`) est la prochaine étape
  IA.
- **`POST /api/stripe/checkout`** — retourne `501`. La création de
  Checkout Session Stripe arrive avec l'intégration paiement.
- **`/analyze` et `/results`** — le flow fonctionne de bout en bout dès
  aujourd'hui avec des données de démonstration clairement annotées
  (`?demo=1`), pour valider l'UX du funnel avant de brancher l'IA.

---

## 8. Prochaines étapes (ordre recommandé)

1. **Provisionner Supabase** : créer le projet, appliquer
   `supabase/migrations/0001_init.sql`, activer le provider Google dans
   Auth > Providers, créer le bucket `profile-photos` si le SQL ne l'a pas
   fait (déjà inclus dans la migration).
2. **Renseigner `.env.local`** à partir de `.env.example`.
3. **Régénérer les types Supabase** :
   `npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts`.
4. **Brancher Stripe** : produits + prix (mensuel/annuel), implémenter
   `api/stripe/checkout` et les handlers du webhook, tester avec
   `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
5. **Implémenter le pipeline IA** (`api/analyze`) : prompt de scoring
   Mistral, parsing structuré (`response_format: json_object`), écriture
   dans `analyses`, remplacement des données de démo dans `/results`.
6. **PostHog** : créer le projet, renseigner les clés, construire les
   dashboards de funnel à partir des événements déjà envoyés.
7. **Tests + CI** avant d'ouvrir l'accès à de vrais utilisateurs.
8. **Déploiement Vercel** : connecter le repo, configurer les variables
   d'environnement en Production/Preview, configurer le domaine.

---

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).
