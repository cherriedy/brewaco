import crypto from "crypto";
import axios from "axios";
import { Momo } from "#interfaces/momo.interface.js";

const partnerCode = process.env.MOMO_PARTNER_CODE!;
const accessKey = process.env.MOMO_ACCESS_KEY!;
const secretKey = process.env.MOMO_SECRET_KEY!;
const redirectUrl = process.env.MOMO_REDIRECT_URL!;
const ipnUrl = process.env.MOMO_IPN_URL!;

export const momoPaymentService = async ({ amount, orderId }: Momo) => {
  const requestId = orderId + new Date().getTime();
  const orderInfo = `Thanh toan don hang ${orderId}`;
  const requestType = "captureWallet";
  const extraData = "";

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto.createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    signature,
    lang: "vi"
  };

  const response = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody);
  return response.data.payUrl;
};


