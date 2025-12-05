import mongoose from "mongoose";
import { Review } from "../models/Review.model";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/apiError";

interface ReviewInput {
  rating: number;
  title?: string;
  comment?: string;
}

const recalcProductRating = async (productId: string) => {
  const agg = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const product = await Product.findById(productId);
  if (!product) return;

  if (agg.length > 0) {
    product.averageRating = agg[0].avgRating;
    product.totalReviews = agg[0].totalReviews;
  } else {
    product.averageRating = 0;
    product.totalReviews = 0;
  }

  await product.save();
};

export const addOrUpdateReview = async (
  userId: string,
  productId: string,
  data: ReviewInput
) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  let review = await Review.findOne({ user: userId, product: productId });

  if (review) {
    review.rating = data.rating;
    review.title = data.title;
    review.comment = data.comment;
    await review.save();
  } else {
    review = await Review.create({
      user: userId,
      product: productId,
      rating: data.rating,
      title: data.title,
      comment: data.comment
    });
  }

  await recalcProductRating(productId);

  return review;
};

export const deleteReview = async (userId: string, productId: string) => {
  const review = await Review.findOneAndDelete({
    user: userId,
    product: productId
  });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await recalcProductRating(productId);
};

export const getReviewsForProduct = async (productId: string) => {
  const reviews = await Review.find({ product: productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  return reviews;
};
