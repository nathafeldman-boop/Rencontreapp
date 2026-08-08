import { NextRequest } from "next/server";
import { after } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileSchema } from "@/lib/validations/profile";
import { rescoreProfile } from "@/lib/ai/rescore-profile";
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
    return apiValidationError(parsed.error);
  }

  const { bio, dating_app, photo_paths } = parsed.data;

  const { data, error } = await supabase
    .from("profiles")
    .insert({ user_id: user.id, bio, dating_app, photos: photo_paths })
    .select("id")
    .single();

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess({ profile_id: data.id }, 201);
}

const patchSchema = z
  .object({
    bio: z.string().min(1).max(1000).optional(),
    /**
     * Full desired `profiles.photos` list — from the Optimisation page's
     * drag-and-drop/arrow reorder, deleting a photo, or adding a newly
     * uploaded one. Not reorder-only: any set is accepted as long as every
     * path belongs to the caller (see the `${user.id}/` prefix check
     * below), since paths are also used to build signed URLs.
     */
    photos: z.array(z.string().min(1)).min(1).max(9).optional(),
  })
  .refine((data) => data.bio !== undefined || data.photos !== undefined, {
    message: "Provide `bio` and/or `photos`.",
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

  const update: { bio?: string; photos?: string[]; photos_optimized?: boolean } = {};
  if (parsed.data.bio !== undefined) update.bio = parsed.data.bio;

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
