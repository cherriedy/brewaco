import { PaymentResult } from "#interfaces/payment.result.js";

export interface PaymentGateway {
  /**
   * Initiates a payment process for a given order.
   * @param orderId - Unique identifier for the order.
   * @param amount - Payment amount in the smallest currency unit (e.g., cents).
   * @param metadata - Additional data to associate with the payment (e.g., customer info).
   * @returns A promise resolving to an object containing the redirect URL for payment.
   */
  createPayment(
    orderId: string,
    amount: number,
    metadata: object,
  ): Promise<{ redirectUrl: string }>;

  /**
   * (Optional) Issues a refund for a specific transaction.
   * @param transactionId - Identifier of the transaction to refund.
   * @param amount - Amount to refund in the smallest currency unit.
   * @returns A promise resolving to true if the refund was successful, false otherwise.
   */
  refundPayment?(transactionId: string, amount: number): Promise<boolean>;

  /**
   * Verifies the result of a payment using gateway-specific parameters.
   * @param params - Parameters received from the payment gateway (e.g., query or body).
   * @returns A promise resolving to a PaymentResult indicating the payment status.
   */
  verifyPayment(params: any): Promise<PaymentResult>;
}
