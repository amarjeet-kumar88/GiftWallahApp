import { Response, NextFunction } from "express";
import crypto from "crypto";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../utils/apiError";
import { successResponse } from "../utils/apiResponse";
import { getCartForUser } from "../services/cart.service";
import { razorpay } from "../config/razorpay";
import { ENV } from "../config/env";
import { createPaidOrderFromCart } from "../services/order.service";


// POST /api/checkout/create-order
export const createRazorpayOrderController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const userId = req.user.userId;
    const cart = await getCartForUser(userId);

    if (!cart || cart.totalItems === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    const amountInPaise = Math.round(cart.totalPrice * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_rcpt_${cart._id}`,
    };

    try {
      const order = await razorpay.orders.create(options);

      return res
        .status(200)
        .json(successResponse("Razorpay order created", { order }));
    } catch (err: any) {
      console.error("Razorpay error:", err);

      // Razorpay ka common structure hai:
      // { statusCode: 401, error: { description, code } }
      if (err?.statusCode === 401) {
        throw new ApiError(
          500,
          `Razorpay authentication failed: ${err?.error?.description || "check your API key & secret"}`
        );
      }

      throw new ApiError(
        500,
        err?.error?.description || "Failed to create Razorpay order"
      );
    }
  } catch (error) {
    next(error);
  }
};


// POST /api/checkout/verify-payment
export const verifyRazorpayPaymentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const userId = req.user.userId;
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      address,
    } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      throw new ApiError(400, "Payment details are incomplete");
    }

    // signature verify
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw new ApiError(400, "Invalid payment signature");
    }

    // verified → cart se order create
    const order = await createPaidOrderFromCart({
      userId,
      address,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return res
      .status(200)
      .json(successResponse("Payment verified & order placed", { order }));
  } catch (error) {
    next(error);
  }
};
