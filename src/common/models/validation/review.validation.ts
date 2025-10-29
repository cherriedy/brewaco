import { z } from "zod";
import { reviewConfig } from "#config/app.js";

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(reviewConfig.rating.minValue, "review.validation.minValue")
    .max(reviewConfig.rating.maxValue, "review.validation.maxValue"),
  comment: z
    .string()
    .min(reviewConfig.comment.minLength, "review.validation.minLength")
    .max(reviewConfig.comment.maxLength, "review.validation.maxLength"),
});

export type CreateReviewPayload = z.infer<typeof createReviewSchema>;
