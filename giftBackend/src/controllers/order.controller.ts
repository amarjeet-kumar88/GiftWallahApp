import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { successResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { createOrderFromCart } from "../services/order.service";
import { createRazorpayOrderForUser } from "../services/payment.service";
import { ENV } from "../config/env";
import { Order } from "../models/order.model";

export const createCODOrderController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const { addressId } = req.body;

    const order = await createOrderFromCart(
      req.user.userId,
      addressId,
      "cod"
    );

    res
      .status(201)
      .json(successResponse("COD order created", { order }));
  } catch (error) {
    next(error);
  }
};

export const createOnlineOrderInitController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const { addressId } = req.body;

    // 1) Razorpay order create
    const rpOrder = await createRazorpayOrderForUser(req.user.userId);

    // 2) Local order create with razorpayOrderId
    const order = await createOrderFromCart(
      req.user.userId,
      addressId,
      "online",
      rpOrder.id
    );

    res.status(201).json(
      successResponse("Online order initiated", {
        razorpayOrder: rpOrder,
        order,
        razorpayKeyId: ENV.RAZORPAY_KEY_ID
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getMyOrdersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const orders = await Order.find({ user: req.user.userId }).sort({
      createdAt: -1
    });

    res
      .status(200)
      .json(successResponse("Orders fetched", { orders }));
  } catch (error) {
    next(error);
  }
};
