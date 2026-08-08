import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { extractConversationFromImage } from "@/lib/ai/conversation-coach";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

export const maxDuration = 60;

const bodySchema = z.object({
  image: z.string().startsWith("data:image/"),
});

/** Reads a pasted-in conversation screenshot so the user can send a screenshot instead of retyping it. */
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

  const credits = await checkCredits(supabase, "conversation_coach");
  if (!credits.allowed) {
    return apiError("You've used all your AI credits for this month.", 429);
  }

  const { text, isSimulated } = await extractConversationFromImage(parsed.data.image);

  if (!text) {
    return apiError("Impossible de lire cette capture — essaie une autre image ou écris ta conversation.", 422);
  }

  await consumeCredits(supabase, user.id, "conversation_coach");

  return apiSuccess({ text, isSimulated });
}
