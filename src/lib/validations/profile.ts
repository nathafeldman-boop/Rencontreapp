import { z } from "zod";

// Custom French messages everywhere — these can reach the user verbatim
// (see onboarding-form.tsx's error handling), and Zod's default messages
// are English/technical ("Too big: expected string to have <=3000
// characters"), which is exactly what a real tester saw before this file
// had any custom messages at all.
export const profileSchema = z.object({
  // Real bios can run long, especially typed-out multi-prompt Hinge-style
  // profiles (several prompt/answer pairs pasted as one block) — 1000 was
  // rejecting genuine submissions with no client-side warning beforehand.
  bio: z.string().max(3000, "Ta bio est trop longue (3000 caractères maximum).").optional(),
  dating_app: z.enum(["tinder", "bumble", "hinge", "other"], "Choisis une application de rencontre."),
  photo_paths: z
    .array(z.string().min(1), "Photo invalide.")
    .min(1, "Envoie au moins une photo.")
    .max(9, "9 photos maximum."),
});

export type ProfileSubmission = z.infer<typeof profileSchema>;
