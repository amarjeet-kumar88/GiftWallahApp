import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  addOrUpdateCartItem,
  clearCart,
  getCartForUser,
  removeCartItem
} from "../services/cart.service";
import { successResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const getCartController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const cart = await getCartForUser(req.user.userId);
    res.status(200).json(successResponse("Cart fetched", { cart }));
  } catch (error) {
    next(error);
  }
};

export const addOrUpdateCartItemController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const { productId, quantity } = req.body;
    const cart = await addOrUpdateCartItem(
      req.user.userId,
      productId,
      Number(quantity)
    );

    res
      .status(200)
      .json(successResponse("Cart updated", { cart }));
  } catch (error) {
    next(error);
  }
};

export const removeCartItemController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const cart = await removeCartItem(req.user.userId, req.params.productId);
    res
      .status(200)
      .json(successResponse("Item removed from cart", { cart }));
  } catch (error) {
    next(error);
  }
};

export const clearCartController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const cart = await clearCart(req.user.userId);
    res
      .status(200)
      .json(successResponse("Cart cleared", { cart }));
  } catch (error) {
    next(error);
  }
};
