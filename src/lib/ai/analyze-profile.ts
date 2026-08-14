import { z } from "zod";

import { callMistralJson, withVisionModelFallback } from "@/lib/ai/mistral";
import { simulateAnalysis } from "@/lib/ai/simulate-analysis";
import { fetchPhotoAsDataUrl } from "@/lib/utils/fetch-photo-as-data-url";
import type { Recommendation } from "@/types/database.types";

export interface PhotoAnalysisResult {
  photo_path: string;
  position: number;
  /** False when this "photo" isn't a real photo of a person (app screenshot, meme, graphic, stock image, document, etc.) — see rescore-profile.ts, which strips these out of profiles.photos automatically. */
  is_real_photo: boolean;
  score: number;
  confidence_score: number;
  attractiveness_score: number;
  technical_score: number;
  pros: string[];
  cons: string[];
  recommendation: string;
  suggested_role: "primary" | "secondary" | "remove";
}

export interface ProfileAnalysisResult {
  overall_score: number;
  photo_score: number;
  bio_score: number;
  attractiveness_score: number;
  conversation_score: number;
  free_insights: string[];
  recommendations: Recommendation[];
  photoAnalyses: PhotoAnalysisResult[];
  isSimulated: boolean;
}

export interface AnalyzeProfileInput {
  seed: string;
  bio: string;
  datingApp: string;
  photos: { path: string; signedUrl: string }[];
  onboarding: {
    objective?: string;
    weeklyMatches?: string;
    biggestProblem?: string;
    confidence?: string;
  };
}

/**
 * The engine's judgment and voice. Rewritten per the "moteur d'analyse"
 * spec: brutally honest, calibrated against the real competitive bar on
 * Tinder/Hinge/Bumble (not "is this person nice?"), never inflated. JSON
 * keys must stay exactly as specified (backend contract) — only the
 * string *values* are French.
 */
const ANALYSIS_ENGINE_SYSTEM_PROMPT = `Tu es le moteur d'analyse de profil de Flirtcraft.

Ta mission n'est PAS de rassurer l'utilisateur. Ta mission est de maximiser ses chances de réussir sur les
applications de rencontre (Tinder, Hinge, Bumble). Tu dois être extrêmement honnête, critique, précis et
orienté résultats.

RÈGLE ABSOLUE : NE JAMAIS SUR-NOTER.
Une note représente la qualité RÉELLE du profil comparée à la concurrence sur ces applications — pas "est-ce
que cette personne est bien ?" mais "à quel point ce profil est optimisé pour obtenir des matchs ?". Un
profil peut être honnête, sympathique et authentique et pourtant mériter une mauvaise note.

Calibrage de la bio (applique la même logique de calibrage — une vraie répartition en cloche, pas bimodale —
aux autres critères) :
- Profil cassé : bio vide, incohérente, insultante, ou remplie de red flags manifestes : 0-15/100.
- Générique, clichés, aucune personnalité ("j'aime voyager, sortir avec mes potes et profiter de la vie") :
  15-35/100.
- Correcte mais quelconque — se lit bien, aucune erreur grossière, mais rien de mémorable ou de spécifique :
  35-55/100. C'est la note la PLUS FRÉQUENTE pour un profil "normal" qui n'a reçu aucun travail particulier —
  ce n'est pas une mauvaise note, juste une note moyenne, et la majorité des bios réelles atterrissent ici.
- Bonne bio avec personnalité, détails spécifiques, qui facilite la conversation : 55-72/100.
- Très bonne bio, spécifique, naturelle, mémorable, cohérente avec les photos : 72-88/100.
- Excellente bio (rare) : 88-97/100. 100/100 est pratiquement impossible.

Ne sous-note jamais par réflexe de sévérité : réserve les notes sous 20/100 aux profils RÉELLEMENT cassés (bio
vide ou insultante, photos illisibles ou qui ne montrent clairement pas la personne, aucun signal exploitable)
— jamais à un profil simplement moyen ou perfectible. À l'inverse, ne sur-note jamais un profil médiocre par
gentillesse. Une note fausse dans un sens comme dans l'autre (trop haute OU trop basse) ne rend aucun service à
l'utilisateur — les deux erreurs sont aussi graves l'une que l'autre.

Interdiction de complimenter automatiquement ("très bon profil !", "ta bio est sympa", "il y a une bonne
base") si les éléments analysés ne le justifient pas. Chaque compliment doit être justifié par un élément
concret. Si quelque chose est mauvais, dis-le clairement et explique pourquoi — jamais méchant gratuitement,
mais toujours direct.

Analyse la bio sur : originalité, personnalité, spécificité, mémorisation, capacité à déclencher une
conversation, humour, naturel, attraction, clichés, longueur, orthographe, structure, signaux négatifs, red
flags, cohérence avec les photos, différenciation par rapport aux autres profils. Recherche activement les
phrases génériques, clichés, banalités, listes de qualités, phrases narcissiques, humour forcé, sexualisation
maladroite, arrogance, désespoir, négativité, exigences envers les matchs, fautes, formulations artificielles.

Analyse chaque photo sur : qualité technique, lumière, cadrage, expression, posture, environnement,
authenticité, attractivité visuelle, lisibilité du visage, confiance dégagée, style, contexte social,
variété, ordre, potentiel de première impression — uniquement l'EFFICACITÉ de la photo sur une app de
rencontre, jamais la valeur personnelle ou la beauté intrinsèque de la personne. La première photo est
critique : demande-toi si elle donne envie de regarder les suivantes.

AVANT toute autre analyse d'une photo, vérifie que c'est une VRAIE photo d'une vraie personne, prise dans le
monde réel, utilisable sur une app de rencontre. Rejette (is_real_photo: false) toute image qui est : une
capture d'écran d'application, de site web, de conversation ou d'interface (barre d'adresse, boutons,
fenêtres, texte d'interface visibles) ; un mème, un montage, un graphisme, un logo ou une illustration ; une
image composée uniquement de texte ; une photo de stock/générique manifestement pas prise par l'utilisateur
(watermark, mise en scène commerciale) ; un document, une pièce d'identité, un QR code, ou une image sans
aucune personne clairement reconnaissable comme sujet principal. Accepte (is_real_photo: true) toute vraie
photo d'une personne — selfie, photo prise par quelqu'un d'autre, photo de groupe — même de mauvaise qualité ;
"vraie" ne veut pas dire "bonne", juste "authentique et utilisable". Si is_real_photo est false, score,
confidence_score, attractiveness_score et technical_score doivent tous être 0-5, suggested_role doit être
'remove', et cons/recommendation doivent dire explicitement que ce n'est pas une photo utilisable et doit être
remplacée — jamais évaluer la "qualité" d'une image qui n'est pas une vraie photo de la personne.

Analyse la cohérence globale : une photo peut être excellente individuellement mais mauvaise dans le profil
si toutes les photos se ressemblent, si aucune ne montre de personnalité, si la bio raconte quelque chose que
les photos ne confirment pas, ou si le profil manque de variété.

Adapte le poids relatif des critères à l'application de rencontre indiquée dans le message (jamais le barème
de notation lui-même — les mêmes échelles 0-100 et le même niveau d'exigence s'appliquent partout) :
- Tinder : le swipe est quasi-instantané et repose presque entièrement sur l'image — pèse plus fort la force
  de la première photo et l'impact visuel immédiat dans le photo_score et l'overall_score.
- Bumble : mêmes critères visuels que Tinder, mais dans un match hétéro c'est la femme qui doit écrire en
  premier — pour un profil d'homme, valorise en plus une bio qui donne un vrai point d'accroche facile à
  reprendre, puisqu'il ne peut pas compter sur un message d'ouverture de sa part pour compenser une bio vide.
- Hinge : le format encourage des prompts/une bio plus développée qu'un simple swipe — pèse plus fort la
  profondeur, la spécificité et le potentiel de conversation de la bio dans le bio_score et l'overall_score.
- Autre / non précisé : calibrage standard, sans biais particulier vers une dimension.

Le score global (overall_score) doit refléter un mélange pondéré des quatre sous-scores, pas un veto d'un seul
critère ni une unanimité requise. Une faiblesse doit tirer la note globale vers le bas proportionnellement à
son poids réel, pas de façon catastrophique. Exemple : photos à 80, bio à 40 → un profil avec un vrai point
fort et un point faible net mérite un overall autour de 55-65 (tiré vers le bas par la bio, mais pas écrasé) —
pas 15, pas 70. Le score global ne doit JAMAIS être artificiellement élevé parce qu'un seul élément est
excellent, ni artificiellement écrasé parce qu'un seul élément est faible.

Pose-toi constamment : "Si ce profil était affiché parmi 100 autres, pourquoi quelqu'un swiperait à droite ?"
Si tu n'as pas de réponse claire, le profil manque de différenciation — dis-le.

Personnalise ton analyse avec les informations d'onboarding fournies (objectif, matchs actuels, plus gros
problème auto-déclaré, confiance) quand elles sont pertinentes.

Réponds UNIQUEMENT avec un objet JSON (les clés restent en anglais, TOUTES les valeurs textuelles sont en
français) respectant exactement ce schéma :
{ overall_score, photo_score, bio_score, attractiveness_score, conversation_score (entiers 0-100, calibrés
selon les règles ci-dessus),
free_insights (1-2 phrases courtes, honnêtes et directes — le teaser gratuit, pas un compliment gratuit),
recommendations (4-6 objets { category: 'photos'|'bio'|'conversation', title, detail }, CLASSÉS PAR ORDRE DE
PRIORITÉ : les 2-3 premiers sont les plus gros problèmes du profil — titre du style "Problème n°1 : ...",
"Problème n°2 : ...", chaque detail doit citer le sous-score concerné (ex: "(Bio : 22/100)") et expliquer
concrètement pourquoi et quoi changer, en intégrant si pertinent les dimensions personnalité, différenciation,
cohérence ou première impression ; l'avant-dernier a pour titre "Gain rapide" (la modification la plus facile
à fort impact immédiat) ; le dernier a pour titre "Plus gros potentiel" (la modification au plus gros impact
potentiel) ),
bio_rewrite (une réécriture naturelle et crédible de la bio — jamais un texte qui sonne comme une pub ou
comme écrit par une IA — qui reste fidèle à ce que dit la bio d'origine),
photos (un objet par photo reçue, dans le même ordre, chacun { index (0-based), is_real_photo (boolean, voir
règles ci-dessus), score, confidence_score, attractiveness_score, technical_score (entiers 0-100), pros (max 3
phrases courtes), cons (max 3 phrases courtes), recommendation (une phrase actionnable, honnête),
suggested_role: 'primary'|'secondary'|'remove' } ; exactement une photo parmi celles avec is_real_photo: true
doit être 'primary' — si aucune photo n'est réelle, n'importe laquelle peut être 'primary' par défaut).

Avant de répondre, relis ton analyse et demande-toi : "Pourrais-je défendre cette note face à quelqu'un qui
connaît très bien Tinder, Hinge et Bumble — dans les deux sens : est-ce que je sur-note, ou est-ce que je
sous-note par réflexe de sévérité ?" Si non, réévalue. Ne gonfle jamais artificiellement les scores, et ne les
écrase jamais non plus par excès de sévérité.`;

const scoreSchema = z.number().min(0).max(100);

const mistralPhotoSchema = z.object({
  index: z.number().int().min(0),
  is_real_photo: z.boolean(),
  score: scoreSchema,
  confidence_score: scoreSchema,
  attractiveness_score: scoreSchema,
  technical_score: scoreSchema,
  pros: z.array(z.string()).max(4),
  cons: z.array(z.string()).max(4),
  recommendation: z.string(),
  suggested_role: z.enum(["primary", "secondary", "remove"]),
});

const mistralResponseSchema = z.object({
  overall_score: scoreSchema,
  photo_score: scoreSchema,
  bio_score: scoreSchema,
  attractiveness_score: scoreSchema,
  conversation_score: scoreSchema,
  // Mistral occasionally collapses a single insight to a bare string instead
  // of a 1-item array — coerce rather than fail the whole parse over it.
  free_insights: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.string()).min(1).max(3)
  ),
  recommendations: z
    .array(z.object({ category: z.enum(["photos", "bio", "conversation"]), title: z.string(), detail: z.string() }))
    .min(1)
    .max(8),
  bio_rewrite: z.string(),
  photos: z.array(mistralPhotoSchema),
});

/**
 * Real profile analysis via Mistral's vision-capable model. Falls back to
 * the deterministic simulation (see simulate-analysis.ts) on any failure —
 * missing API key, network error, or a response that doesn't match the
 * expected schema — so the product keeps working end to end. Callers get
 * `isSimulated` back and should persist it verbatim on the `analyses` row.
 */
export async function analyzeProfile(input: AnalyzeProfileInput): Promise<ProfileAnalysisResult> {
  try {
    return await analyzeWithMistral(input);
  } catch (err) {
    console.error("[analyzeProfile] Falling back to simulated analysis:", err);
    return simulatedFallback(input);
  }
}

async function analyzeWithMistral(input: AnalyzeProfileInput): Promise<ProfileAnalysisResult> {
  if (input.photos.length === 0) {
    throw new Error("No photos to analyze");
  }

  const onboardingSummary = [
    input.onboarding.objective && `Objectif principal : ${input.onboarding.objective}`,
    input.onboarding.weeklyMatches && `Matchs par semaine actuellement : ${input.onboarding.weeklyMatches}`,
    input.onboarding.biggestProblem && `Plus gros problème auto-déclaré : ${input.onboarding.biggestProblem}`,
    input.onboarding.confidence && `Confiance auto-évaluée : ${input.onboarding.confidence}`,
  ]
    .filter(Boolean)
    .join("\n");

  const photoLabels = input.photos.map((_, i) => `Photo ${i} :`);

  // Mistral must receive the image bytes inline (base64 data URL) rather
  // than a URL it fetches itself — a Supabase signed URL passed directly
  // as `image_url` produced "not a real photo" on every photo in prod (see
  // fetch-photo-as-data-url.ts for the full story). Same approach already
  // used by the conversation coach's screenshot extraction.
  const photoDataUrls = await Promise.all(input.photos.map((photo) => fetchPhotoAsDataUrl(photo.signedUrl)));

  // Explicit (tighter than callMistral's own 30s default) so the worst case
  // — one timeout + one retry — can never eat the whole request budget.
  // /api/analyze's Vercel function has a hard 60s ceiling: if this call (and
  // its retry) plus the photo downloads above ever add up to more than
  // that, Vercel kills the function outright before analyzeProfile's own
  // try/catch gets a chance to fall back to the simulated result — the user
  // sees a raw "analysis failed" screen instead. 20s × 2 attempts (~41s
  // with backoff) plus the photo downloads' own 15s timeout stays
  // comfortably under 60s even in the worst case.
  const VISION_TIMEOUT_MS = 20_000;

  const response = await withVisionModelFallback((model) =>
    callMistralJson<unknown>({
      model,
      temperature: 0.4,
      timeoutMs: VISION_TIMEOUT_MS,
      messages: [
        { role: "system", content: ANALYSIS_ENGINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Application de rencontre : ${input.datingApp}\nBio : "${input.bio || "(vide)"}"\n${onboardingSummary}\n\n${input.photos.length} photos suivent, dans l'ordre du profil.`,
            },
            ...photoDataUrls.flatMap((dataUrl, i) => [
              { type: "text" as const, text: photoLabels[i] },
              { type: "image_url" as const, image_url: dataUrl },
            ]),
          ],
        },
      ],
    })
  );

  const parsed = mistralResponseSchema.parse(response);

  // Diagnostic line — greppable in Vercel logs. Kept permanently (not a
  // temporary console.log): the "photo_score stuck at 0-5 in prod" bug this
  // fixed had no visibility until someone manually cross-referenced score
  // columns, so this makes the same failure mode visible immediately if it
  // ever recurs (e.g. Mistral changes how it reports failed image decodes).
  console.info(
    "[analyzeProfile] photo results:",
    parsed.photos.map((p) => ({ index: p.index, is_real_photo: p.is_real_photo, score: p.score, cons: p.cons }))
  );

  const recommendations: Recommendation[] = [
    ...parsed.recommendations,
    { category: "bio", title: "Version optimisée de ta bio", detail: parsed.bio_rewrite },
  ];

  const photoAnalyses: PhotoAnalysisResult[] = parsed.photos.map((p) => ({
    photo_path: input.photos[p.index]?.path ?? input.photos[0].path,
    position: p.index,
    is_real_photo: p.is_real_photo,
    score: p.score,
    confidence_score: p.confidence_score,
    attractiveness_score: p.attractiveness_score,
    technical_score: p.technical_score,
    pros: p.pros,
    cons: p.cons,
    recommendation: p.recommendation,
    suggested_role: p.suggested_role,
  }));

  return {
    overall_score: parsed.overall_score,
    photo_score: parsed.photo_score,
    bio_score: parsed.bio_score,
    attractiveness_score: parsed.attractiveness_score,
    conversation_score: parsed.conversation_score,
    free_insights: parsed.free_insights,
    recommendations,
    photoAnalyses,
    isSimulated: false,
  };
}

function simulatedFallback(input: AnalyzeProfileInput): ProfileAnalysisResult {
  const result = simulateAnalysis({
    seed: input.seed,
    bio: input.bio,
    photoCount: input.photos.length,
    datingApp: input.datingApp,
    onboarding: {
      objective: input.onboarding.objective,
      biggestProblem: input.onboarding.biggestProblem,
    },
  });

  const photoAnalyses: PhotoAnalysisResult[] = input.photos.map((photo, i) => ({
    photo_path: photo.path,
    position: i,
    // The deterministic fallback never actually looks at the image, so it
    // can't tell a real photo from a screenshot — assume real and let the
    // next successful Mistral analysis catch it instead of guessing wrong.
    is_real_photo: true,
    score: Math.max(20, result.photo_score + (i === 0 ? 8 : -4 * i)),
    confidence_score: result.attractiveness_score,
    attractiveness_score: result.attractiveness_score,
    technical_score: result.photo_score,
    pros: i === 0 ? ["Photo nette et bien cadrée"] : ["Apporte de la variété à ton profil"],
    cons: i === 0 ? [] : ["Pourrait être remplacée par une photo plus forte"],
    recommendation: i === 0 ? "Garde-la comme photo principale." : "Demande-toi si cette photo mérite vraiment sa place.",
    suggested_role: i === 0 ? "primary" : i < 3 ? "secondary" : "remove",
  }));

  return { ...result, photoAnalyses, isSimulated: true };
}
