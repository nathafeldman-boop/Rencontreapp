import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { scoreConversation } from "@/lib/ai/match-simulator";
import { getUserContext, summarizeUserContext } from "@/lib/ai/user-context";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({ sessionId: z.string().uuid() });

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

  const { data: session, error: fetchError } = await supabase
    .from("match_simulator_sessions")
    .select("id, messages")
    .eq("id", parsed.data.sessionId)
    .maybeSingle();

  if (fetchError || !session) {
    return apiError("Session de simulateur introuvable.", 404);
  }

  const context = await getUserContext(supabase, user.id);
  const { score, strengths, weaknesses, whatYouCouldHaveDone, bestPossibleReply, isSimulated } =
    await scoreConversation(session.messages, summarizeUserContext(context));

  const { error: updateError } = await supabase
    .from("match_simulator_sessions")
    .update({ conversation_score: score, ended_at: new Date().toISOString() })
    .eq("id", session.id);

  if (updateError) {
    console.error("[api/ai/match-simulator/end] update failed", updateError);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  return apiSuccess({ score, strengths, weaknesses, whatYouCouldHaveDone, bestPossibleReply, isSimulated });
}
