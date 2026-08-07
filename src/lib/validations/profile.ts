import { z } from "zod";

export const profileSchema = z.object({
  bio: z.string().max(1000).optional(),
  dating_app: z.enum(["tinder", "bumble", "hinge", "other"]),
  photo_paths: z.array(z.string().min(1)).min(1).max(9),
});

export type ProfileSubmission = z.infer<typeof profileSchema>;
