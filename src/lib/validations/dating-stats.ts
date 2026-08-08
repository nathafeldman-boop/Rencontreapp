import { z } from "zod";

export const PLATFORM_OPTIONS = [
  { value: "tinder", label: "Tinder" },
  { value: "hinge", label: "Hinge" },
  { value: "bumble", label: "Bumble" },
  { value: "meetic", label: "Meetic" },
  { value: "other", label: "Autre" },
] as const;

export const datingStatsSchema = z
  .object({
    platform: z.enum(["tinder", "hinge", "bumble", "meetic", "other"]),
    period_start: z.string().date(),
    period_end: z.string().date(),
    likes: z.number().int().min(0).max(100000).default(0),
    matches: z.number().int().min(0).max(100000).default(0),
    conversations: z.number().int().min(0).max(100000).default(0),
    replies: z.number().int().min(0).max(100000).default(0),
    dates: z.number().int().min(0).max(100000).default(0),
  })
  .refine((data) => data.period_end >= data.period_start, {
    message: "La fin de période doit être après le début.",
    path: ["period_end"],
  });

export type DatingStatsSubmission = z.infer<typeof datingStatsSchema>;
