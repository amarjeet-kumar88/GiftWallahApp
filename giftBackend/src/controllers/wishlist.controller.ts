// src/controllers/wishlist.controller.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  addToWishlist,
  clearWishlist,
  getWishlistForUser,
  isProductInWishlist,
  removeFromWishlist,
  getWishlistCountForUser,
} from "../services/wishlist.service";
import { successResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const getWishlistController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const wishlist = await getWishlistForUser(req.user.userId);
    res.status(200).json(successResponse("Wishlist fetched", { wishlist }));
  } catch (error) {
    next(error);
  }
};

export const getWishlistCountController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const count = await getWishlistCountForUser(req.user.userId);
    res.status(200).json(successResponse("Wishlist count", { count }));
  } catch (error) {
    next(error);
  }
};

export const addToWishlistController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const { productId } = req.body;
    if (!productId) throw new ApiError(400, "productId is required");

    const wishlist = await addToWishlist(req.user.userId, productId);
    res.status(200).json(successResponse("Added to wishlist", { wishlist }));
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlistController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const { productId } = req.params;
    const wishlist = await removeFromWishlist(req.user.userId, productId);

    res.status(200).json(successResponse("Removed from wishlist", { wishlist }));
  } catch (error) {
    next(error);
  }
};

export const clearWishlistController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const wishlist = await clearWishlist(req.user.userId);
    res.status(200).json(successResponse("Wishlist cleared", { wishlist }));
  } catch (error) {
    next(error);
  }
};

export const isInWishlistController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const { productId } = req.params;
    const exists = await isProductInWishlist(req.user.userId, productId);

    res.status(200).json(successResponse("Wishlist check", { inWishlist: exists }));
  } catch (error) {
    next(error);
  }
};
