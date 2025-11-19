import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().min(1, "order.validation.productIdRequired"),
  name: z.string().min(1, "order.validation.productNameRequired"),
  price: z.number().min(0, "order.validation.pricePositive"),
  quantity: z.number().int().min(1, "order.validation.quantityMinOne"),
  images: z.array(z.string()).optional().default([]),
});

const shippingAddressSchema = z.object({
  province: z.string().min(1, "order.validation.provinceRequired"),
  district: z.string().min(1, "order.validation.districtRequired"),
  ward: z.string().min(1, "order.validation.wardRequired"),
  detail: z.string().min(1, "order.validation.detailRequired"),
  phone: z.string().min(1, "order.validation.phoneRequired"),
  recipientName: z.string().min(1, "order.validation.recipientNameRequired"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "order.validation.itemsRequired"),
  paymentMethod: z.enum(["COD", "VNPAY", "MOMO"], {
    message: "order.validation.invalidPaymentMethod",
  }),
  promotionCode: z.string().optional(),
  totalAmount: z.number().min(0, "order.validation.totalAmountPositive"),
  shippingAddress: shippingAddressSchema,
  note: z.string().optional(),
  discountAmount: z.number().min(0).optional().default(0),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(
    ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"],
    { message: "order.validation.invalidStatus" }
  ).optional(),
  paymentStatus: z.enum(
    ["PENDING", "PAID", "FAILED"],
    { message: "order.validation.invalidStatus" }
  ).optional(),
});

export const getOrdersQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(10),
  page: z.number().int().min(1).optional().default(1),

  sortBy: z.enum(["createdAt", "totalAmount", "orderStatus"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),

  status: z
    .enum(["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"])
    .optional(),
});

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusPayload = z.infer<typeof updateOrderStatusSchema>;
