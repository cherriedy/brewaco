import crypto from "crypto";
import axios from "axios";
import { Payment } from "#common/models/payment.model.js";
import { Order } from "#common/models/order.model.js";
import { CreatePaymentPayload } from "#common/models/validation/payment.validation.js";

const partnerCode = process.env.MOMO_PARTNER_CODE!;
const accessKey = process.env.MOMO_ACCESS_KEY!;
const secretKey = process.env.MOMO_SECRET_KEY!;
const redirectUrl = process.env.MOMO_REDIRECT_URL!;
const ipnUrl = process.env.MOMO_IPN_URL!;

export class CreateMomoPaymentService {
  static async execute(data: CreatePaymentPayload) {
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const requestId = `${order._id}_${Date.now()}`;
    const orderInfo = `Thanh toán đơn hàng #${order._id}`;
    const requestType = "captureWallet";
    const extraData = "";

    const rawSignature =
      `accessKey=${accessKey}&amount=${data.amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
      `&orderId=${order._id}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount: data.amount,
      orderId: order._id,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      signature,
      lang: "vi",
    };

    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody
    );

    await Payment.create({
      orderId: order._id,
      paymentMethod: "MOMO",
      transactionId: momoRes.data.transId || null,
      amount: data.amount,
      payUrl: momoRes.data.payUrl,
      gatewayResponseCode: momoRes.data.resultCode,
      rawResponse: momoRes.data,
      status: "PENDING",
    });

    return momoRes.data.payUrl;
  }
}
