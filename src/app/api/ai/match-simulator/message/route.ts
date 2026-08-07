import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPersonaReply } from "@/lib/ai/match-simulator";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import type { MatchMessage } from "@/types/database.types";

const bodySchema = z.object({
  sessionId: z.string().uuid().optional(),
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
    return apiError("Unauthorized", 401);
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
      return apiError("Simulator session not found.", 404);
    }

    const messages = [...session.messages, userMessage];
    const { reply, isSimulated } = await getPersonaReply(session.persona, messages);
    messages.push({ role: "match", content: reply });

    const { error: updateError } = await supabase
      .from("match_simulator_sessions")
      .update({ messages })
      .eq("id", sessionId);

    if (updateError) {
      return apiError(updateError.message, 500);
    }

    return apiSuccess({ sessionId, reply, isSimulated });
  }

  if (!persona) {
    return apiError("`persona` is required to start a new session.", 422);
  }

  const credits = await checkCredits(supabase, "match_simulator");
  if (!credits.allowed) {
    return apiError("You've used all your AI credits for this month.", 429);
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
    return apiError(insertError.message, 500);
  }

  await consumeCredits(supabase, user.id, "match_simulator");

  return apiSuccess({ sessionId: newSession.id, reply, isSimulated });
}
