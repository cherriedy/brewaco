import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1, "cart.validation.productIdRequired"),
  quantity: z.number().int().min(0, "cart.validation.nonNegativeQuantity"),
});

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "cart.validation.productIdRequired"),
  quantity: z.number().int().min(1, "cart.validation.minQuantityOne"),
});

export const updateCartItemSchema = z.object({
  item: cartItemSchema,
});

export type AddCartItemPayload = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemPayload = z.infer<typeof updateCartItemSchema>;
