import { razorpay } from "../config/razorpay";
import { Cart } from "../models/cart.model";
import { ApiError } from "../utils/apiError";
import crypto from "crypto";
import { ENV } from "../config/env";

export const createRazorpayOrderForUser = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const amountInPaise = cart.totalPrice * 100;

  const rpOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `order_rcpt_${Date.now()}`,
    notes: {
      userId
    }
  });

  return rpOrder;
};

export const verifyRazorpaySignature = (params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const body = razorpayOrderId + "|" + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpaySignature;
};
