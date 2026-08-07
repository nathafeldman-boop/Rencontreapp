import { z } from "zod";

export const onboardingAnswerSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(1000),
});

export const onboardingSubmissionSchema = z.object({
  age: z.number().int().min(18).max(100),
  gender: z.enum(["male", "female", "non_binary", "other"]),
  country: z.string().min(1).max(100),
  dating_apps_used: z.array(z.enum(["tinder", "bumble", "hinge", "other"])).min(1),
  dating_goal: z.enum(["serious_relationship", "casual_dating", "friends", "not_sure"]),
  answers: z.array(onboardingAnswerSchema),
});

export type OnboardingSubmission = z.infer<typeof onboardingSubmissionSchema>;
