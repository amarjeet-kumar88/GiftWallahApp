import Razorpay from "razorpay";
import { ENV } from "./env";

console.log("Razorpay config =>", {
  key: ENV.RAZORPAY_KEY_ID,
  secretLoaded: !!ENV.RAZORPAY_KEY_SECRET,
});

export const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});
