import crypto from "crypto";
import { Payment } from "#common/models/payment.model.js";
import { Order } from "#common/models/order.model.js";

const vnp_HashSecret = process.env.VNP_HASH_SECRET!;

export class VerifyVnpayCallbackService {
  static async execute(query: Record<string, string>) {
    const vnp_SecureHash = query["vnp_SecureHash"];
    const vnp_Params = { ...query };
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const sortedKeys = Object.keys(vnp_Params).sort();
   const signData = sortedKeys.map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`).join("&");
const secureHash = crypto.createHmac("sha512", vnp_HashSecret).update(signData).digest("hex");
console.log("signData callback: ", signData)
console.log("secureHash callback: ", secureHash)
console.log("vnp_SecureHash callback: ", vnp_SecureHash)
if (secureHash !== vnp_SecureHash) {
  throw new Error("INVALID_VNPAY_SIGNATURE");
}


    if (secureHash !== vnp_SecureHash) {
      throw new Error("INVALID_VNPAY_SIGNATURE");
    }

    const payment = await Payment.findOne({ transactionId: vnp_Params["vnp_TxnRef"] });
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");

    const orderId = payment.orderId;

    if (vnp_Params["vnp_ResponseCode"] === "00") {
      // Thanh toán thành công
      payment.status = "PAID";
      payment.paidTimestamp = new Date();
      payment.rawResponse = vnp_Params;
      await payment.save();

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "PAID",
        paidTimestamp: new Date(),
      });
    } else {
      // Thanh toán thất bại
      payment.status = "FAILED";
      payment.failedTimestamp = new Date();
      payment.rawResponse = vnp_Params;
      await payment.save();

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "FAILED",
        failedTimestamp: new Date(),
      });
    }

    return { message: "ok" };
  }
}
