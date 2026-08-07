import { NextRequest } from "next/server";

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
