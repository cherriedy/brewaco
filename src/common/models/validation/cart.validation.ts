import { z } from "zod";

const cartItemSchema = z.object({
  productId: z.string().min(1, "cart.validation.productIdRequired"),
  quantity: z.number().int().min(0, "cart.validation.nonNegativeQuantity"),
});

export const updateCartItemSchema = z.object({
  item: cartItemSchema,
});

export type UpdateCartItemPayload = z.infer<typeof updateCartItemSchema>;
