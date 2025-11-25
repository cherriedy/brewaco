import { Types } from "mongoose";
import { Payment } from "../../models/payment.model.js";
import { UpdatePaymentStatusPayload } from "#common/models/validation/payment.validation.js";

export class UpdatePaymentStatusService {
    private validCodTransitions: Record<string, string[]> = {
        PENDING: ["PAID", "FAILED"],
        PAID: [],
        FAILED: [],
        REFUNDED: [],
    };

    // Map trạng thái => timestamp
    private statusTimestamps: Record<string, keyof typeof Payment.schema.paths> = {
        PAID: "paidTimestamp",
        FAILED: "failedTimestamp",
        REFUNDED: "refundedTimestamp",
    };

    async updatePaymentStatus(paymentId: string, data: UpdatePaymentStatusPayload) {
        const payment = await Payment.findById(new Types.ObjectId(paymentId));
        if (!payment) throw new Error("PAYMENT_NOT_FOUND");

        if (payment.paymentMethod !== "COD") {
            throw new Error("PAYMENT_METHOD_NOT_ALLOWED");
        }

        if (!payment.status) {
            throw new Error("PAYMENT_INVALID_STATUS");
        }

        if (data.status) {
            const allowed = this.validCodTransitions[payment.status];
            if (!allowed.includes(data.status)) {
                throw new Error("PAYMENT_INVALID_STATUS_TRANSITION");
            }

            payment.status = data.status;
            const timestampField = this.statusTimestamps[data.status];
            if (timestampField) {
                payment.set(timestampField as string, new Date());
            }
        }
        await payment.save();
        return payment;
    }
}
