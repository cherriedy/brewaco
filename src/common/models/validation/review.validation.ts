import { reviewConfig } from "#config/app.js";
import { z } from "zod";

export const createReviewSchema = z.object({
  comment: z
    .string()
    .min(reviewConfig.comment.minLength, "review.validation.minLength")
    .max(reviewConfig.comment.maxLength, "review.validation.maxLength"),
  rating: z
    .number()
    .int()
    .min(reviewConfig.rating.minValue, "review.validation.minValue")
    .max(reviewConfig.rating.maxValue, "review.validation.maxValue"),
});

export const updateReviewSchema = z.object({
  comment: z
    .string()
    .min(reviewConfig.comment.minLength, "review.validation.minLength")
    .max(reviewConfig.comment.maxLength, "review.validation.maxLength")
    .optional(),
  rating: z
    .number()
    .int()
    .min(reviewConfig.rating.minValue, "review.validation.minValue")
    .max(reviewConfig.rating.maxValue, "review.validation.maxValue")
    .optional(),
});

export type CreateReviewPayload = z.infer<typeof createReviewSchema>;
export type UpdateReviewPayload = z.infer<typeof updateReviewSchema>;
