import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  addOrUpdateReview,
  deleteReview,
  getReviewsForProduct
} from "../services/review.service";
import { successResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const addOrUpdateReviewController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await addOrUpdateReview(req.user.userId, productId, {
      rating: Number(rating),
      title,
      comment
    });

    res
      .status(200)
      .json(successResponse("Review saved", { review }));
  } catch (error) {
    next(error);
  }
};

export const deleteReviewController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const { productId } = req.params;
    await deleteReview(req.user.userId, productId);

    res.status(200).json(successResponse("Review deleted"));
  } catch (error) {
    next(error);
  }
};

export const getProductReviewsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const reviews = await getReviewsForProduct(productId);
    res
      .status(200)
      .json(successResponse("Reviews fetched", { reviews }));
  } catch (error) {
    next(error);
  }
};
