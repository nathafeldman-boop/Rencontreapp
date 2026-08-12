import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPersonaReply } from "@/lib/ai/match-simulator";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import type { MatchMessage } from "@/types/database.types";

const bodySchema = z.object({
  // `.nullish()` (not just `.optional()`) because the client's React state
  // starts at `null` and `JSON.stringify` keeps `"sessionId":null` in the
  // body (it only drops `undefined` keys) — `.optional()` alone rejected
  // that first-message payload with a 422 every time.
  sessionId: z.string().uuid().nullish(),
  persona: z
    .object({
      gender: z.enum(["male", "female", "non_binary", "other"]),
      personality: z.string().min(1).max(60),
    })
    .optional(),
  message: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { sessionId, persona, message } = parsed.data;
  const userMessage: MatchMessage = { role: "user", content: message };

  if (sessionId) {
    const { data: session, error: fetchError } = await supabase
      .from("match_simulator_sessions")
      .select("id, persona, messages")
      .eq("id", sessionId)
      .maybeSingle();

    if (fetchError || !session) {
      return apiError("Session de simulateur introuvable.", 404);
    }

    const messages = [...session.messages, userMessage];
    const { reply, isSimulated } = await getPersonaReply(session.persona, messages);
    messages.push({ role: "match", content: reply });

    const { error: updateError } = await supabase
      .from("match_simulator_sessions")
      .update({ messages })
      .eq("id", sessionId);

    if (updateError) {
      console.error("[api/ai/match-simulator/message] update failed", updateError);
      return apiError("Une erreur est survenue — réessaie.", 500);
    }

    return apiSuccess({ sessionId, reply, isSimulated });
  }

  if (!persona) {
    return apiError("Le type de match est requis pour démarrer une session.", 422);
  }

  const credits = await checkCredits(supabase, "match_simulator");
  if (!credits.allowed) {
    return apiError("Tu as utilisé tous tes crédits coaching pour ce mois-ci.", 429);
  }

  const messages = [userMessage];
  const { reply, isSimulated } = await getPersonaReply(persona, messages);
  messages.push({ role: "match", content: reply });

  const { data: newSession, error: insertError } = await supabase
    .from("match_simulator_sessions")
    .insert({ user_id: user.id, persona, messages })
    .select("id")
    .single();

  if (insertError) {
    console.error("[api/ai/match-simulator/message] insert failed", insertError);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  await consumeCredits(supabase, user.id, "match_simulator");

  return apiSuccess({ sessionId: newSession.id, reply, isSimulated });
}
