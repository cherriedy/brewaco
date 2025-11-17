import { reviewConfig } from "#config/app.js";
import { z } from "zod";

export const createReviewSchema = z.object({
  comment: z
    .string()
    .max(reviewConfig.comment.maxLength, "review.validation.maxLength")
    .optional(),
  rating: z
    .number()
    .int()
    .min(reviewConfig.rating.minValue, "review.validation.minValue")
    .max(reviewConfig.rating.maxValue, "review.validation.maxValue"),
  productId: z.string().nonempty("review.validation.productIdRequired"),
  orderId: z.string().nonempty("review.validation.orderIdRequired"),
});

export const updateReviewSchema = z.object({
  comment: z
    .string()
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
