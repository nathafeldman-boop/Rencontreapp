import { z } from "zod";

import { callMistral, callMistralJson, withVisionModelFallback } from "@/lib/ai/mistral";
import { lenientString } from "@/lib/ai/lenient-string";
import type { ConversationSuggestion, CoachMode } from "@/types/database.types";

const MODE_PROMPT: Record<Exclude<CoachMode, "auto">, string> = {
  flirt: "flirty and openly interested — confident attraction, not shy about it",
  funny: "genuinely funny — a joke or playful bit, not just '😂'",
  natural: "natural and low-key — easy, unforced, like texting a friend",
  confident: "confident and direct — no hedging, no over-explaining",
};

/** CoachMode names the UI choice ("Flirt"); ConversationSuggestion.tone is the older adjective form ("flirty"). */
const MODE_TO_TONE: Record<Exclude<CoachMode, "auto">, ConversationSuggestion["tone"]> = {
  flirt: "flirty",
  funny: "funny",
  natural: "natural",
  confident: "confident",
};

const FALLBACK: Record<CoachMode, ConversationSuggestion[]> = {
  auto: [
    {
      tone: "funny",
      message: "Belle entrée en matière. Je te laisse une chance — mais seulement si tu me bats au quiz culture générale. Conditions applicables.",
      explanation: "Un défi joueur donne envie de répondre et garde un ton léger sans en faire trop.",
    },
    {
      tone: "flirty",
      message: "Hey toi. J'allais jouer les indifférentes mais ça aurait été gâcher une bonne accroche.",
      explanation: "Un intérêt direct montre de la confiance, et l'auto-dérision évite que ça sonne trop intense.",
    },
    {
      tone: "natural",
      message: "Hey ! Ta semaine se passe comment jusqu'ici ?",
      explanation: "Facile à répondre, sans pression — parfait pour garder l'élan sans trop réfléchir.",
    },
  ],
  flirt: [
    {
      tone: "flirty",
      message: "Attention, continue comme ça et je vais devoir te demander ton numéro.",
      explanation: "Direct mais joueur — montre de l'intérêt sans être lourd.",
    },
    {
      tone: "flirty",
      message: "J'allais bien jusqu'à ce que tu m'envoies ça. Maintenant je suis distrait(e).",
      explanation: "Un compliment livré avec légèreté et confiance donne envie de continuer sur cette énergie.",
    },
    {
      tone: "flirty",
      message: "Ok, c'est officiellement le meilleur moment de ma journée jusqu'ici.",
      explanation: "Chaleureux et assez précis pour sonner sincère plutôt que comme une phrase toute faite.",
    },
  ],
  funny: [
    {
      tone: "funny",
      message: "Je suis contractuellement obligé(e) de dire un truc charmant ici, laisse-moi une seconde.",
      explanation: "L'auto-dérision est sans risque et fonctionne presque à tous les coups.",
    },
    {
      tone: "funny",
      message: "Ok mais c'est un green flag ou on est en train de rusher un red flag, j'ai besoin de savoir maintenant.",
      explanation: "Léger et dans l'air du temps — donne envie de répondre par une blague plutôt qu'un mot.",
    },
    {
      tone: "funny",
      message: "Pour info : t'es plus drôle que mes trois derniers matchs réunis.",
      explanation: "Un compliment emballé dans une blague — assez léger pour ne pas sonner trop intense.",
    },
  ],
  natural: [
    {
      tone: "natural",
      message: "Haha ok, je m'attendais pas à cette réponse.",
      explanation: "Simple et sincère — garde la conversation vivante sans en faire trop.",
    },
    {
      tone: "natural",
      message: "Attends, raconte-moi en plus.",
      explanation: "Une relance facile et curieuse qui relance naturellement la conversation.",
    },
    {
      tone: "natural",
      message: "En fait c'est un bon point, j'y avais pas pensé comme ça.",
      explanation: "Décontracté et conversationnel, comme si tu écrivais à un(e) ami(e).",
    },
  ],
  confident: [
    {
      tone: "confident",
      message: "J'aime bien la tournure que ça prend. On va boire un verre pour continuer ça en vrai ?",
      explanation: "Une proposition directe, sans détour — la confiance se ressent bien à l'écrit.",
    },
    {
      tone: "confident",
      message: "D'habitude je dis pas ça aussi tôt, mais je pense qu'on s'entendrait bien.",
      explanation: "Une affirmation d'intérêt assurée, sans trop en expliquer.",
    },
    {
      tone: "confident",
      message: "T'as l'air d'être quelqu'un qui perd pas de temps. Pareil. Tu fais quoi vendredi ?",
      explanation: "Répond à la franchise par la franchise — filtre pour quelqu'un qui apprécie ça.",
    },
  ],
};

/**
 * Transcribes a dating-app conversation screenshot into plain text so it
 * can feed the same suggestion pipeline as pasted text — lets the user
 * send a screenshot instead of retyping their conversation by hand.
 * Bubble side is the only reliable "who said it" signal in a screenshot,
 * so the model is told to use it (right-aligned = the user, left = match).
 */
export async function extractConversationFromImage(
  imageDataUrl: string
): Promise<{ text: string; isSimulated: boolean }> {
  try {
    const result = await withVisionModelFallback((model) =>
      callMistral({
        model,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You transcribe dating-app conversation screenshots into plain text. Read every message bubble " +
              'top to bottom. Right-aligned / colored bubbles are the app user ("Toi"), left-aligned / gray ' +
              'bubbles are their match ("Match"). Output ONLY the transcript, one line per message, formatted ' +
              'exactly as "Toi : <message>" or "Match : <message>" — no commentary, no markdown, no extra text. ' +
              "If you can't read any messages, output exactly: ERREUR_LECTURE",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcris cette conversation." },
              { type: "image_url", image_url: imageDataUrl },
            ],
          },
        ],
      })
    );

    const text = result.choices[0]?.message.content?.trim();
    if (!text || text === "ERREUR_LECTURE") {
      throw new Error("Mistral could not read the screenshot");
    }

    return { text, isSimulated: false };
  } catch (err) {
    console.error("[extractConversationFromImage] Falling back:", err);
    return { text: "", isSimulated: true };
  }
}

export async function getConversationSuggestions(
  conversationText: string,
  mode: CoachMode = "auto",
  contextSummary?: string
): Promise<{ suggestions: ConversationSuggestion[]; isSimulated: boolean }> {
  try {
    const suggestions = await callMistralForSuggestions(conversationText, mode, contextSummary);
    return { suggestions, isSimulated: false };
  } catch (err) {
    console.error("[getConversationSuggestions] Falling back to templates:", err);
    return { suggestions: FALLBACK[mode], isSimulated: true };
  }
}

/**
 * The model doesn't always echo back exactly "funny"/"flirty"/"natural"/
 * "confident" (synonyms, capitalization, French words) — normalizing here
 * instead of a strict zod enum means a slightly-off tone label no longer
 * discards 3 otherwise-good suggestions and falls back to canned English
 * templates.
 */
const TONE_ALIASES: Record<string, ConversationSuggestion["tone"]> = {
  funny: "funny",
  drole: "funny",
  humorous: "funny",
  playful: "funny",
  flirty: "flirty",
  flirt: "flirty",
  flirtatious: "flirty",
  natural: "natural",
  naturel: "natural",
  casual: "natural",
  "low-key": "natural",
  confident: "confident",
  confiant: "confident",
  direct: "confident",
};

function normalizeTone(raw: string, fallback: ConversationSuggestion["tone"]): ConversationSuggestion["tone"] {
  const key = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return TONE_ALIASES[key] ?? fallback;
}

async function callMistralForSuggestions(
  conversationText: string,
  mode: CoachMode,
  contextSummary?: string
): Promise<ConversationSuggestion[]> {
  // .length(3) used to throw out 3 otherwise-good suggestions whenever a
  // single `explanation` came back short/missing — same for the exact-3
  // requirement whenever Mistral returned 2. Accept 1-3 real suggestions
  // and a missing/short explanation (defaulted below) instead of discarding
  // valid replies and falling back to canned templates. tone/message
  // truncate instead of rejecting on overflow (see lenient-string.ts).
  const schema = z.object({
    suggestions: z
      .array(
        z.object({
          tone: lenientString(40),
          message: lenientString(300, 3),
          explanation: lenientString(300).optional(),
        })
      )
      .min(1),
  });

  const instructions =
    mode === "auto"
      ? "Suggest exactly 3 replies the user could send next: one funny, one flirty, one natural/low-key."
      : `Suggest exactly 3 different reply options, all in this style: ${MODE_PROMPT[mode]}. ` +
        `Vary the wording/approach between the 3, but keep every one of them tagged "tone": "${MODE_TO_TONE[mode]}".`;

  const response = await callMistralJson<unknown>({
    model: "mistral-large-latest",
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content:
          "You are a dating conversation coach. Given a pasted conversation (most recent message last), " +
          `${instructions} Each needs a short explanation of why it works. Respond with ONLY JSON matching ` +
          '{ "suggestions": [{ "tone", "message", "explanation" }] } (exactly 3 items). ' +
          "The JSON keys stay as specified (in English), but every string VALUE — tone, message, and " +
          "explanation — must be written in French (français), never in English, regardless of what language " +
          "these instructions are written in.",
      },
      {
        role: "user",
        content: [
          contextSummary && `What Flirtcraft already knows about this person:\n${contextSummary}`,
          `Conversation so far:\n${conversationText}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });

  const autoFallbackOrder: ConversationSuggestion["tone"][] = ["funny", "flirty", "natural"];
  return schema
    .parse(response)
    .suggestions.slice(0, 3)
    .map((s, i) => ({
      ...s,
      tone: normalizeTone(s.tone, mode === "auto" ? autoFallbackOrder[i] : MODE_TO_TONE[mode]),
      explanation: s.explanation?.trim() || "Une réponse adaptée à la conversation et au ton choisi.",
    }));
}
