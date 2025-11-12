import { PaymentGateway } from "#gateway/payment/base.gateway.js";
import { VNPayGateway } from "#gateway/payment/vnpay.gateway.js";
import { PaymentResult } from "#interfaces/payment.result.js";
import { PaymentMethod } from "#types/payment.js";

export class VerifyPaymentService {
  private readonly gateways: Map<PaymentMethod, PaymentGateway>;

  constructor() {
    this.gateways = new Map();
    this.gateways.set("VNPay", new VNPayGateway());
  }

  /**
   * Verifies payment callback from gateway
   * @param provider - Payment provider
   * @param params - Callback parameters
   * @returns Payment result
   */
  async invoke(provider: PaymentMethod, params: any): Promise<PaymentResult> {
    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new Error("PAYMENT_GATEWAY_NOT_SUPPORTED");
    }

    return await gateway.verifyPayment(params);
  }
}
