import { z } from "zod";

const orderItemSchema = z.object({
  name: z.string().min(1, "order.validation.productNameRequired"),
  price: z.number().min(0, "order.validation.pricePositive"),
  productId: z.string().min(1, "order.validation.productIdRequired"),
  quantity: z.number().int().min(1, "order.validation.quantityMinOne"),
});

const shippingAddressSchema = z.object({
  city: z.string().min(1, "order.validation.cityRequired"),
  country: z.string().min(1, "order.validation.countryRequired"),
  phone: z.string().optional(),
  recipientName: z.string().optional(),
  state: z.string().optional(),
  street: z.string().min(1, "order.validation.streetRequired"),
  zip: z.string().min(1, "order.validation.zipRequired"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "order.validation.itemsRequired"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["COD", "VNPay"], {
    message: "order.validation.invalidPaymentMethod",
  }),
  promotionCode: z.string().optional(),
  shippingAddress: shippingAddressSchema,
  totalAmount: z.number().min(0, "order.validation.totalAmountPositive"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["CREATED", "PAID", "SHIPPED", "DELIVERED", "CANCELED"], {
    message: "order.validation.invalidStatus",
  }),
});

export const getOrdersQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(10),
  page: z.number().int().min(1).optional().default(1),
  sortBy: z
    .enum(["createdAt", "totalAmount", "status"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  status: z
    .enum(["CREATED", "PAID", "SHIPPED", "DELIVERED", "CANCELED"])
    .optional(),
});

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type UpdateOrderStatusPayload = z.infer<typeof updateOrderStatusSchema>;
