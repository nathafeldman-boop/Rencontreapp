import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

const CODE_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no 0/o/1/l ambiguity
const CODE_LENGTH = 7;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Returns the user's existing referral code, or generates and persists a
 * new one. Retries a handful of times on the (very unlikely) unique-code
 * collision.
 */
export async function getOrCreateReferralCode(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string> {
  const { data: existing } = await supabase.from("referrals").select("code").eq("user_id", userId).maybeSingle();
  if (existing) return existing.code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await supabase.from("referrals").insert({ user_id: userId, code });
    if (!error) return code;
  }

  throw new Error("Couldn't generate a referral code — try again.");
}
