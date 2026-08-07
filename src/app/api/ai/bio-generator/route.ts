import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { generateBios } from "@/lib/ai/generate-bios";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { getUserContext, summarizeUserContext } from "@/lib/ai/user-context";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  style: z.enum(["funny", "mysterious", "confident", "romantic", "premium"]),
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

  const credits = await checkCredits(supabase, "bio_generator");
  if (!credits.allowed) {
    return apiError("You've used all your AI credits for this month.", 429);
  }

  const [{ data: profile }, context] = await Promise.all([
    supabase
      .from("profiles")
      .select("bio, dating_app")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getUserContext(supabase, user.id),
  ]);

  const { bios, isSimulated } = await generateBios({
    sourceBio: profile?.bio ?? "",
    style: parsed.data.style,
    datingApp: profile?.dating_app ?? "other",
    contextSummary: summarizeUserContext(context),
  });

  await supabase.from("bio_generations").insert({
    user_id: user.id,
    style: parsed.data.style,
    source_bio: profile?.bio ?? null,
    generated_bios: bios,
  });

  await consumeCredits(supabase, user.id, "bio_generator");

  return apiSuccess({ bios, isSimulated });
}
