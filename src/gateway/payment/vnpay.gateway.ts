import { PaymentGateway } from "#gateway/payment/base.gateway.js";
import { PaymentResult } from "#interfaces/payment.result.js";
import crypto from "crypto";
import querystring from "qs";

export class VNPayGateway implements PaymentGateway {
  private readonly hashSecret: string;
  private readonly returnUrl: string;
  private readonly tmnCode: string;
  private readonly version: string;
  private readonly vnpayUrl: string;

  constructor() {
    this.version = process.env.VNPAY_VERSION || "";
    this.tmnCode = process.env.VNPAY_TMN_CODE || "";
    this.hashSecret = process.env.VNPAY_HASH_SECRET || "";
    this.vnpayUrl = process.env.VNPAY_URL || "";
    this.returnUrl = process.env.VNPAY_RETURN_URL || "";
  }

  async createPayment(
    orderId: string,
    amount: number,
    metadata: any,
  ): Promise<{
    redirectUrl: string;
  }> {
    // Get current time to create vnp_CreateDate
    const createDate = this.formatDate(new Date());

    // Create an object containing parameters to send to VNPay
    const params: Record<string, any> = {
      vnp_Amount: Math.round(amount) * 100,
      vnp_Command: "pay",
      vnp_CreateDate: createDate,
      vnp_CurrCode: "VND",
      vnp_IpAddr: metadata.ipAddr,
      vnp_Locale: "vn",
      vnp_OrderInfo: metadata.orderInfo,
      vnp_OrderType: "other",
      vnp_ReturnUrl: this.returnUrl,
      vnp_TmnCode: this.tmnCode,
      vnp_TxnRef: orderId,
      vnp_Version: this.version,
    };

    const sortedParams = this.sortObject(params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    sortedParams.vnp_SecureHash = this.hmacSHA512(signData);

    // Create payment URL: use querystring.stringify with encode: false
    const redirectUrl = `${this.vnpayUrl}?${querystring.stringify(sortedParams, { encode: false })}`;
    return { redirectUrl };
  }

  async verifyPayment(params: any): Promise<PaymentResult> {
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sortedParams = this.sortObject(params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const checkSum = this.hmacSHA512(signData);

    // Verify the secure hash
    if (secureHash !== checkSum) {
      return {
        amount: parseInt(params.vnp_Amount || "0") / 100,
        rawResponse: params,
        status: "FAILED",
        transactionId: params.vnp_TransactionNo || "",
      };
    }

    // Check response code
    const responseCode = params.vnp_ResponseCode;
    const status = responseCode === "00" ? "SUCCESS" : "FAILED";

    return {
      amount: parseInt(params.vnp_Amount || "0") / 100,
      rawResponse: params,
      status,
      transactionId: params.vnp_TransactionNo || "",
    };
  }

  private formatDate(date: Date): string {
    const pad = (num: number) => (num < 10 ? `0${num}` : num);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private hmacSHA512(data: string): string {
    return crypto
      .createHmac("sha512", this.hashSecret)
      .update(Buffer.from(data, "utf-8"))
      .digest("hex");
  }

  private sortObject(obj: Record<string, any>): Record<string, any> {
    const sorted: Record<string, string> = {};
    const str: string[] = [];
    let key: string;
    for (key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let i = 0; i < str.length; i++) {
      sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+");
    }
    return sorted;
  }
}
