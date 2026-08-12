import { z } from "zod";

export const profileSchema = z.object({
  // Real bios can run long, especially typed-out multi-prompt Hinge-style
  // profiles (several prompt/answer pairs pasted as one block) — 1000 was
  // rejecting genuine submissions with no client-side warning beforehand.
  bio: z.string().max(3000).optional(),
  dating_app: z.enum(["tinder", "bumble", "hinge", "other"]),
  photo_paths: z.array(z.string().min(1)).min(1).max(9),
});

export type ProfileSubmission = z.infer<typeof profileSchema>;
