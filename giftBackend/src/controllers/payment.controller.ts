import { Request, Response, NextFunction } from "express";
import { verifyRazorpaySignature } from "../services/payment.service";
import { markOrderPaid } from "../services/order.service";
import { successResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const verifyPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiError(400, "Missing Razorpay payment details");
    }

    const isValid = verifyRazorpaySignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    if (!isValid) {
      throw new ApiError(400, "Invalid payment signature");
    }

    const order = await markOrderPaid(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    res
      .status(200)
      .json(successResponse("Payment verified successfully", { order }));
  } catch (error) {
    next(error);
  }
};
