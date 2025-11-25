import { z } from "zod";

export const createPaymentSchema = z.object({
    orderId: z.string().min(1, "payment.validation.orderId"),
    paymentMethod: z.enum(["VNPAY", "MOMO", "COD"], {
        message: "payment.validation.invalidMethod",
    }),
    amount: z.number().min(0, "payment.validation.amountPositive").optional(),
});

export const updatePaymentStatusSchema = z.object({
    status: z.enum(["PAID", "FAILED"], {
        message: "payment.validation.invalidStatus",
    }),
});

export type CreatePaymentPayload = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusPayload = z.infer<typeof updatePaymentStatusSchema>;