import Razorpay from "razorpay";
import { ENV } from "./env";

if (!ENV.RAZORPAY_KEY_ID || !ENV.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay is not configured");
}

export const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET
});
