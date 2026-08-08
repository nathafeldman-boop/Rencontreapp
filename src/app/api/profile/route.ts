import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/profile";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

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
    /** New display order for `profiles.photos` — from the Optimisation page's drag-and-drop / arrow reorder. Must be exactly the same set of paths, just reordered. */
    photo_order: z.array(z.string().min(1)).min(1).max(9).optional(),
  })
  .refine((data) => data.bio !== undefined || data.photo_order !== undefined, {
    message: "Provide `bio` and/or `photo_order`.",
  });

/** Updates the bio and/or photo order on the user's most recent profile. */
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
    .select("id, photos")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!profile) {
    return apiError("No profile found.", 422);
  }

  const update: { bio?: string; photos?: string[] } = {};
  if (parsed.data.bio !== undefined) update.bio = parsed.data.bio;

  if (parsed.data.photo_order !== undefined) {
    // Reorder only — never let the client add/remove photos through this endpoint.
    const existing = new Set(profile.photos ?? []);
    const isSameSet =
      parsed.data.photo_order.length === existing.size && parsed.data.photo_order.every((path) => existing.has(path));
    if (!isSameSet) {
      return apiError("photo_order must contain exactly the profile's existing photos.", 422);
    }
    update.photos = parsed.data.photo_order;
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", profile.id);

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess({ updated: true });
}
