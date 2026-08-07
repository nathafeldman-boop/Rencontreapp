import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

/**
 * Resolves storage paths in the private `profile-photos` bucket to
 * short-lived signed URLs — used both for the Mistral vision call and for
 * displaying photos back to the owning user (RLS on storage.objects still
 * applies to the signing call itself).
 */
export async function signPhotoUrls(
  supabase: SupabaseClient<Database>,
  paths: string[],
  expiresInSeconds = 300
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    paths.map(async (path) => {
      const { data } = await supabase.storage.from("profile-photos").createSignedUrl(path, expiresInSeconds);
      return [path, data?.signedUrl ?? null] as const;
    })
  );

  return Object.fromEntries(entries.filter(([, url]) => url !== null)) as Record<string, string>;
}
