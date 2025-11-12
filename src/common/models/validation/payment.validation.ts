import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  orderInfo: z.string().optional(),
});

export type CreatePaymentPayload = z.infer<typeof createPaymentSchema>;
