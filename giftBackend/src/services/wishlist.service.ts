import { Wishlist } from "../models/Wishlist.model";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/apiError";

export const getOrCreateWishlist = async (userId: string) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      items: []
    });
  }
  return wishlist;
};

export const getWishlistForUser = async (userId: string) => {
  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    "items.product"
  );
  if (!wishlist) {
    return {
      user: userId,
      items: []
    };
  }
  return wishlist;
};

export const addToWishlist = async (userId: string, productId: string) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  const wishlist = await getOrCreateWishlist(userId);

  const exists = wishlist.items.some(
    (i) => i.product.toString() === productId
  );
  if (!exists) {
    wishlist.items.push({
      product: product._id,
      addedAt: new Date()
    } as any);
    await wishlist.save();
  }

  return wishlist;
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const wishlist = await getOrCreateWishlist(userId);

  wishlist.items = wishlist.items.filter(
    (i) => i.product.toString() !== productId
  );

  await wishlist.save();
  return wishlist;
};

export const isProductInWishlist = async (
  userId: string,
  productId: string
) => {
  const wishlist = await Wishlist.findOne({ user: userId, "items.product": productId });
  return !!wishlist;
};

export const clearWishlist = async (userId: string) => {
  const wishlist = await getOrCreateWishlist(userId);
  wishlist.items = [];
  await wishlist.save();
  return wishlist;
};
