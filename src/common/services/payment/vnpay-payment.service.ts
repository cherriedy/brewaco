import crypto from "crypto";
import qs from "qs";

const vnp_TmnCode = process.env.VNP_TMN_CODE!;
const vnp_HashSecret = process.env.VNP_HASH_SECRET!;
const vnp_Url = process.env.VNP_URL!;
const vnp_ReturnUrl = process.env.VNP_RETURN_URL!;

const date = new Date();
const vnp_CreateDate = date.getFullYear().toString() +
  ("0" + (date.getMonth() + 1)).slice(-2) +
  ("0" + date.getDate()).slice(-2) +
  ("0" + date.getHours()).slice(-2) +
  ("0" + date.getMinutes()).slice(-2) +
  ("0" + date.getSeconds()).slice(-2);


interface CreateVnpayUrlParams {
  amount: number; // đơn vị VND
  orderId: string;
  orderInfo: string;
}

export const createVnpayUrl = ({ amount, orderId, orderInfo }: CreateVnpayUrlParams) => {
  const vnp_Params: Record<string, string | number> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: (amount * 100).toString(),
    vnp_ReturnUrl,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate
  };

  // 1. Sắp xếp param
  const sortedParams: Record<string, string | number> = {};
  Object.keys(vnp_Params).sort().forEach(key => {
    sortedParams[key] = vnp_Params[key];
  });

  // 2. Tạo signData (không encode)
  const signData = Object.entries(sortedParams)
    .map(([key, val]) => `${key}=${val}`) // raw, chưa encode
    .join('&');


  // 3. Tạo HMAC
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const secureHash = hmac.update(signData, "utf-8").digest("hex");

  // 4. Encode tất cả param khi nối URL
  const paramsForUrl: Record<string, string | number> = {};
  Object.entries(sortedParams).forEach(([key, val]) => {
    paramsForUrl[key] = encodeURIComponent(val.toString());
  });
  paramsForUrl["vnp_SecureHash"] = secureHash;

  const paymentUrl = `${vnp_Url}?${qs.stringify(paramsForUrl, { encode: false })}`;
  return paymentUrl;
};
