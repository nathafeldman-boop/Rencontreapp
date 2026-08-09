import { z } from "zod";

/**
 * A free-text Zod field that truncates instead of rejecting when Mistral's
 * response runs a bit longer than `max`. A plain `z.string().max(n)` throws
 * out the ENTIRE parsed response over one oversized field — which is how
 * three premium features (dating plan, conversation score, conversation
 * suggestions) ended up silently serving hardcoded template content to
 * paying users instead of their real, otherwise-valid AI response. No
 * free-text field parsed from a Mistral response should use `.max()`
 * directly for this reason — use this instead.
 */
export function lenientString(max: number, min = 1) {
  return z
    .string()
    .min(min)
    .transform((s) => s.slice(0, max));
}
