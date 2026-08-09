import { z } from "zod";

import { callMistralJson, withVisionModelFallback } from "@/lib/ai/mistral";

export interface MatchListEstimate {
  matches: number | null;
  conversations: number | null;
  likes: number | null;
}

const SYSTEM_PROMPT = `Tu regardes une capture d'écran d'une application de rencontre (Tinder, Hinge, Bumble, Meetic...) montrant une liste de matchs, de conversations, ou de likes reçus.

Compte ce que tu peux voir avec certitude :
- matches : nombre de profils/vignettes distincts dans une liste de "matchs" ou de nouvelles conversations.
- conversations : nombre de fils de discussion actifs visibles (liste de messages).
- likes : nombre affiché explicitement de likes reçus (souvent un compteur écrit, pas une liste à compter).

Règles strictes :
- Ne compte QUE ce qui est clairement visible et dénombrable dans l'image. Si la capture ne montre pas ce type de contenu, ou que tu ne peux pas compter avec confiance, mets null pour ce champ.
- N'invente jamais un nombre. Une estimation approximative n'est pas acceptée — soit tu comptes précisément, soit c'est null.
- Si l'image n'est clairement pas une capture d'une application de rencontre, mets les trois champs à null.

Réponds UNIQUEMENT avec un objet JSON respectant ce schéma :
{ "matches": nombre entier ou null, "conversations": nombre entier ou null, "likes": nombre entier ou null }`;

const responseSchema = z.object({
  matches: z.number().int().min(0).max(10000).nullable(),
  conversations: z.number().int().min(0).max(10000).nullable(),
  likes: z.number().int().min(0).max(10000).nullable(),
});

/**
 * Best-effort read of a matches/conversations/likes list screenshot, to
 * prefill the weekly stats form (see /dashboard/progression) instead of
 * the user typing every number by hand. Never a source of truth — the
 * user always reviews and can edit every field before saving, this only
 * saves typing. Falls back to an all-null estimate (an empty prefill, not
 * a guess) on any failure so the form is never silently populated with
 * wrong numbers.
 */
export async function extractMatchListStats(imageDataUrl: string): Promise<MatchListEstimate> {
  try {
    const response = await withVisionModelFallback((model) =>
      callMistralJson<unknown>({
        model,
        temperature: 0.1,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyse cette capture d'écran." },
              { type: "image_url", image_url: imageDataUrl },
            ],
          },
        ],
      })
    );

    return responseSchema.parse(response);
  } catch (err) {
    console.error("[extractMatchListStats] Falling back to empty prefill:", err);
    return { matches: null, conversations: null, likes: null };
  }
}
