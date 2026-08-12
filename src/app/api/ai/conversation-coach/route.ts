import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getConversationSuggestions } from "@/lib/ai/conversation-coach";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { getUserContext, summarizeUserContext } from "@/lib/ai/user-context";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  conversation: z.string().min(1).max(4000),
  mode: z.enum(["auto", "flirt", "funny", "natural", "confident"]).default("auto"),
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

  const credits = await checkCredits(supabase, "conversation_coach");
  if (!credits.allowed) {
    return apiError("Tu as utilisé tous tes crédits coaching pour ce mois-ci.", 429);
  }

  const context = await getUserContext(supabase, user.id);
  const { suggestions, isSimulated } = await getConversationSuggestions(
    parsed.data.conversation,
    parsed.data.mode,
    summarizeUserContext(context)
  );

  await supabase.from("conversation_coach_sessions").insert({
    user_id: user.id,
    input_text: parsed.data.conversation,
    suggestions,
  });

  await consumeCredits(supabase, user.id, "conversation_coach");

  return apiSuccess({ suggestions, isSimulated });
}
