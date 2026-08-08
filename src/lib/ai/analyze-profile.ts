import { z } from "zod";

import { callMistralJson } from "@/lib/ai/mistral";
import { simulateAnalysis } from "@/lib/ai/simulate-analysis";
import type { Recommendation } from "@/types/database.types";

export interface PhotoAnalysisResult {
  photo_path: string;
  position: number;
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

Calibrage de la bio (applique la même logique de calibrage aux autres critères) :
- Bio générique, clichés, aucune personnalité ("j'aime voyager, sortir avec mes potes et profiter de la
  vie") : 10-30/100.
- Bio correcte mais très générique : 30-50/100.
- Bonne bio avec personnalité, détails spécifiques, qui facilite la conversation : 60-75/100.
- Excellente bio, spécifique, naturelle, mémorable, cohérente avec les photos : 75-90/100.
- 90+ doit être RARE. 95+ exceptionnel. 100/100 est pratiquement impossible.

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

Analyse la cohérence globale : une photo peut être excellente individuellement mais mauvaise dans le profil
si toutes les photos se ressemblent, si aucune ne montre de personnalité, si la bio raconte quelque chose que
les photos ne confirment pas, ou si le profil manque de variété.

Le score global (overall_score) ne doit JAMAIS être artificiellement élevé parce qu'un seul élément est
excellent. Exemple : photos à 85, bio à 15 → le profil ne peut pas recevoir 70, une faiblesse majeure doit
fortement diminuer le score global.

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
cohérence ou première impression ; l'avant-dernier a pour titre "Quick win" (la modification la plus facile
à fort impact immédiat) ; le dernier a pour titre "Biggest opportunity" (la modification au plus gros impact
potentiel) ),
bio_rewrite (une réécriture naturelle et crédible de la bio — jamais un texte qui sonne comme une pub ou
comme écrit par une IA — qui reste fidèle à ce que dit la bio d'origine),
photos (un objet par photo reçue, dans le même ordre, chacun { index (0-based), score, confidence_score,
attractiveness_score, technical_score (entiers 0-100), pros (max 3 phrases courtes), cons (max 3 phrases
courtes), recommendation (une phrase actionnable, honnête), suggested_role: 'primary'|'secondary'|'remove' } ;
exactement une photo doit être 'primary').

Avant de répondre, relis ton analyse et demande-toi : "Pourrais-je défendre cette note face à quelqu'un qui
connaît très bien Tinder, Hinge et Bumble ?" Si non, réévalue. Ne gonfle jamais artificiellement les scores.`;

const scoreSchema = z.number().min(0).max(100);

const mistralPhotoSchema = z.object({
  index: z.number().int().min(0),
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
  free_insights: z.array(z.string()).min(1).max(3),
  recommendations: z
    .array(z.object({ category: z.enum(["photos", "bio", "conversation"]), title: z.string(), detail: z.string() }))
    .min(3)
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

  const response = await callMistralJson<unknown>({
    model: "pixtral-large-latest",
    temperature: 0.4,
    messages: [
      { role: "system", content: ANALYSIS_ENGINE_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Application de rencontre : ${input.datingApp}\nBio : "${input.bio || "(vide)"}"\n${onboardingSummary}\n\n${input.photos.length} photos suivent, dans l'ordre du profil.`,
          },
          ...input.photos.flatMap((photo, i) => [
            { type: "text" as const, text: photoLabels[i] },
            { type: "image_url" as const, image_url: photo.signedUrl },
          ]),
        ],
      },
    ],
  });

  const parsed = mistralResponseSchema.parse(response);

  const recommendations: Recommendation[] = [
    ...parsed.recommendations,
    { category: "bio", title: "Version optimisée de ta bio", detail: parsed.bio_rewrite },
  ];

  const photoAnalyses: PhotoAnalysisResult[] = parsed.photos.map((p) => ({
    photo_path: input.photos[p.index]?.path ?? input.photos[0].path,
    position: p.index,
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
