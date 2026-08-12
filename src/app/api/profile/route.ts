import { NextRequest } from "next/server";
import { after } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileSchema } from "@/lib/validations/profile";
import { rescoreProfile } from "@/lib/ai/rescore-profile";
import { flattenPromptsToBio } from "@/lib/profile-prompts";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

// Gives the background rescore (see PATCH) enough wall-clock time to
// finish — Mistral's vision call plus a retry can take up to ~60s.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(json);

  if (!parsed.success) {
    // Surfaced in Vercel runtime logs so a "Validation failed" report can be
    // diagnosed from the exact payload/issues instead of guessing from a
    // user screenshot — see api/onboarding/route.ts for the same pattern.
    console.error("[api/profile POST] validation failed", {
      body: json,
      issues: parsed.error.issues,
    });
    return apiValidationError(parsed.error);
  }

  const { bio, dating_app, photo_paths } = parsed.data;

  const { data, error } = await supabase
    .from("profiles")
    .insert({ user_id: user.id, bio, dating_app, photos: photo_paths })
    .select("id")
    .single();

  if (error) {
    console.error("[api/profile POST] insert failed", { message: error.message, code: error.code });
    return apiError(error.message, 500);
  }

  return apiSuccess({ profile_id: data.id }, 201);
}

const patchSchema = z
  .object({
    bio: z.string().min(1).max(3000).optional(),
    /**
     * Full desired `profiles.photos` list — from the Optimisation page's
     * drag-and-drop/arrow reorder, deleting a photo, or adding a newly
     * uploaded one. Not reorder-only: any set is accepted as long as every
     * path belongs to the caller (see the `${user.id}/` prefix check
     * below), since paths are also used to build signed URLs.
     */
    photos: z.array(z.string().min(1)).min(1).max(9).optional(),
    /** Hinge-style prompt/answer cards (see lib/profile-prompts.ts) — flattened into `bio` below so scoring/context stay unchanged. */
    prompts: z.array(z.object({ prompt: z.string().min(1).max(120), answer: z.string().min(1).max(200) })).min(1).max(3).optional(),
  })
  .refine((data) => data.bio !== undefined || data.photos !== undefined || data.prompts !== undefined, {
    message: "Provide `bio`, `photos`, and/or `prompts`.",
  });

/**
 * Updates the bio and/or photo set on the user's most recent profile, then
 * schedules a Mistral rescore against the new state — "Mistral is the
 * brain": every profile change gets a real recalculation, not just a
 * static estimate. The rescore runs via `after()` instead of being
 * awaited inline: a full vision re-analysis can take 30-60s+, and blocking
 * the response on it made every bio/photo edit feel hung. The client
 * refreshes shortly after to pick up the new score once it lands.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, bio, photos, dating_app")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!profile) {
    return apiError("No profile found.", 422);
  }

  const update: {
    bio?: string;
    photos?: string[];
    photos_optimized?: boolean;
    prompts?: { prompt: string; answer: string }[];
  } = {};
  if (parsed.data.bio !== undefined) update.bio = parsed.data.bio;

  if (parsed.data.prompts !== undefined) {
    update.prompts = parsed.data.prompts;
    // Keep `bio` in sync so scoring/conversation-coach context/etc. never
    // need to know prompts exist — they just read `profiles.bio` as always.
    update.bio = flattenPromptsToBio(parsed.data.prompts);
  }

  if (parsed.data.photos !== undefined) {
    const ownsAllPaths = parsed.data.photos.every((path) => path.startsWith(`${user.id}/`));
    if (!ownsAllPaths) {
      return apiError("photos must only reference this account's own uploads.", 422);
    }
    update.photos = parsed.data.photos;
    update.photos_optimized = true;
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", profile.id);

  if (error) {
    return apiError(error.message, 500);
  }

  const rescoreInput = {
    id: profile.id,
    bio: update.bio ?? profile.bio,
    photos: update.photos ?? profile.photos ?? [],
    dating_app: profile.dating_app,
  };
  const userId = user.id;

  after(async () => {
    // Admin client, not the request-scoped one — this runs after the
    // response is already sent, so it shouldn't depend on request cookies.
    const admin = createAdminClient();
    try {
      await rescoreProfile(admin, userId, rescoreInput);
    } catch (err) {
      console.error("[api/profile PATCH] background rescore failed:", err);
    }
  });

  return apiSuccess({ updated: true, rescoring: true });
}
