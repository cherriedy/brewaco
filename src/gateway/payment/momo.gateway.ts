import { PaymentGateway } from "#gateway/payment/base.gateway.js";
import { PaymentResult } from "#interfaces/payment.result.js";
import crypto from "crypto";
import axios from "axios";

class MomoGateway implements PaymentGateway {
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly redirectUrl: string;
  private readonly ipnUrl: string;

  constructor() {
    this.partnerCode = process.env.MOMO_PARTNER_CODE!;
    this.accessKey = process.env.MOMO_ACCESS_KEY!;
    this.secretKey = process.env.MOMO_SECRET_KEY!;
    this.redirectUrl = process.env.MOMO_REDIRECT_URL!;
    this.ipnUrl = process.env.MOMO_IPN_URL!;
  }

  async createPayment(
    orderId: string,
    amount: number,
    metadata: any,
  ): Promise<{ redirectUrl: string }> {
    const requestId = `${orderId}_${Date.now()}`;
    const orderInfo = metadata?.orderInfo || `Thanh toán đơn hàng #${orderId}`;
    const requestType = "captureWallet";
    const extraData = metadata?.extraData || "";

    const rawSignature =
      `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}` +
      `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}` +
      `&redirectUrl=${this.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      requestType,
      extraData,
      signature,
      lang: "vi",
    };

    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody,
    );

    return { redirectUrl: momoRes.data.payUrl };
  }

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    const requestId = `${transactionId}_${Date.now()}`;
    const orderId = `${transactionId}_${Date.now()}`;
    const description = "Refund test";

    const rawSignature =
      `accessKey=${this.accessKey}&amount=${amount}&description=${description}` +
      `&orderId=${orderId}&partnerCode=${this.partnerCode}` +
      `&requestId=${requestId}&transId=${transactionId}`;

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount,
      orderId,
      transId: transactionId,
      lang: "vi",
      description,
      signature,
    };
    const response = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/refund",
      requestBody,
    );
    return response.data.resultCode === 0;
  }

  async verifyPayment(params: any): Promise<PaymentResult> {
    const rawSignature =
      `accessKey=${this.accessKey}&amount=${params.amount}&extraData=${params.extraData}&message=${params.message}` +
      `&orderId=${params.orderId}&orderInfo=${params.orderInfo}&orderType=${params.orderType}&partnerCode=${params.partnerCode}` +
      `&payType=${params.payType}&requestId=${params.requestId}&responseTime=${params.responseTime}` +
      `&resultCode=${params.resultCode}&transId=${params.transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");

    if (expectedSignature !== params.signature) {
      return {
        amount: Number(params.amount),
        rawResponse: params,
        status: "FAILED",
        transactionId: params.transId || "",
      };
    }

    const status: "PAID" | "FAILED" =
      params.resultCode === 0 ? "PAID" : "FAILED";
    return {
      amount: Number(params.amount),
      rawResponse: params,
      status,
      transactionId: params.transId || "",
    };
  }
}

export default MomoGateway;
