import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { successResponse } from "../utils/apiResponse";
import { getUserOrders, getOrderByIdForUser } from "../services/order.service";
import { ApiError } from "../utils/apiError";

// GET /api/orders
export const getMyOrdersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const orders = await getUserOrders(req.user.userId);
    return res
      .status(200)
      .json(successResponse("Orders fetched", { orders }));
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:orderId
export const getMyOrderByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const order = await getOrderByIdForUser(
      req.user.userId,
      req.params.orderId
    );
    return res
      .status(200)
      .json(successResponse("Order fetched", { order }));
  } catch (error) {
    next(error);
  }
};
