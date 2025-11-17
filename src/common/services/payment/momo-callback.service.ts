import crypto from "crypto";
import { Order } from "#common/models/order.model.js";
import { MomoCallback } from "#interfaces/momo-callback.interface.js";

const accessKey = process.env.MOMO_ACCESS_KEY!;
const secretKey = process.env.MOMO_SECRET_KEY!;

export const handleMomoCallback = async (data: MomoCallback) => {
  // 1. Kiểm tra chữ ký
  const rawSignature = `accessKey=${accessKey}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}` +
    `&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}` +
    `&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;

  const expectedSignature = crypto.createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  if (expectedSignature !== data.signature) {
    throw new Error("Sai chữ ký callback Momo");
  }

  // 2. Cập nhật database
  if (data.resultCode === 0) {
    await Order.findOneAndUpdate(
      { _id: data.orderId },
      { $set: { paymentStatus: "PAID" } }
    );
    console.log(`Cập nhật đơn hàng ${data.orderId} thành công`);
  } else {
    await Order.findOneAndUpdate(
      { _id: data.orderId },
      { $set: { paymentStatus: "FAILED" } }
    );
  }

  return { message: "ok" };
};
