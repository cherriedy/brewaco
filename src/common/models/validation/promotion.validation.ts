import { promotionConfig } from "#config/app.js";
import { z } from "zod";

export const createPromotionSchema = z.object({
  active: z.boolean().default(true),
  code: z
    .string()
    .min(promotionConfig.code.minLength, "promotion.validation.codeRequired")
    .max(promotionConfig.code.maxLength, "promotion.validation.codeMaxLength")
    .transform((val) => val.toUpperCase()),
  description: z.string().min(1, "promotion.validation.descriptionRequired"),
  discountType: z.enum(["percent", "fixed"], {
    message: "promotion.validation.invalidDiscountType",
  }),
  discountValue: z
    .number()
    .min(
      promotionConfig.discount.minValue,
      "promotion.validation.discountValueMin",
    ),
  endDate: z.coerce.date(),
  minOrderValue: z
    .number()
    .min(
      promotionConfig.order.minValue,
      "promotion.validation.minOrderValueMin",
    )
    .default(promotionConfig.order.defaultMinOrderValue),
  startDate: z.coerce.date(),
});

export const updatePromotionSchema = z.object({
  active: z.boolean().optional(),
  code: z
    .string()
    .min(promotionConfig.code.minLength, "promotion.validation.codeRequired")
    .max(promotionConfig.code.maxLength, "promotion.validation.codeMaxLength")
    .transform((val) => val.toUpperCase())
    .optional(),
  description: z
    .string()
    .min(1, "promotion.validation.descriptionRequired")
    .optional(),
  discountType: z
    .enum(["percent", "fixed"], {
      message: "promotion.validation.invalidDiscountType",
    })
    .optional(),
  discountValue: z
    .number()
    .min(
      promotionConfig.discount.minValue,
      "promotion.validation.discountValueMin",
    )
    .optional(),
  endDate: z.coerce.date().optional(),
  minOrderValue: z
    .number()
    .min(
      promotionConfig.order.minValue,
      "promotion.validation.minOrderValueMin",
    )
    .optional(),
  startDate: z.coerce.date().optional(),
});

export const validatePromotionSchema = z.object({
  code: z
    .string()
    .min(promotionConfig.code.minLength, "promotion.validation.codeRequired"),
  orderValue: z
    .number()
    .min(promotionConfig.order.minValue, "promotion.validation.orderValueMin"),
});

export type CreatePromotionPayload = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionPayload = z.infer<typeof updatePromotionSchema>;
export type ValidatePromotionPayload = z.infer<typeof validatePromotionSchema>;
