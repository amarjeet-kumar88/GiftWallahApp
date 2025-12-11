// src/services/cart.service.ts
import mongoose from "mongoose";
import { Cart } from "../models/cart.model";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/apiError";

const recalcCart = (cart: any) => {
  let totalItems = 0;
  let totalPrice = 0;

  (cart.items || []).forEach((item: any) => {
    totalItems += Number(item.quantity || 0);
    totalPrice += Number(item.quantity || 0) * Number(item.price || 0);
  });

  cart.totalItems = totalItems;
  cart.totalPrice = totalPrice;
};

export const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: new mongoose.Types.ObjectId(userId),
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  }
  return cart;
};

export const getCartForUser = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  await cart.populate({
    path: "items.product",
    select: "name images price salePrice isActive slug",
  });
  return cart;
};

export const getCartCountForUser = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  return cart.totalItems || 0;
};

export const addOrUpdateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  quantity = Number(quantity || 1);

  if (quantity < 1) {
    return removeCartItem(userId, productId);
  }

  const product = await Product.findById(productId);
  if (!product || !(product as any).isActive) {
    throw new ApiError(404, "Product not found or inactive");
  }

  if (product.stock < quantity) {
    throw new ApiError(400, "Requested quantity not in stock");
  }

  const cart = await getOrCreateCart(userId);

  const price = product.salePrice ?? product.price;
  const name = product.name;
  const image = product.images && product.images.length ? product.images[0].url : undefined;

  const existingIdx = cart.items.findIndex(
    (i: any) => i.product.toString() === productId
  );

  if (existingIdx > -1) {
    cart.items[existingIdx].quantity = quantity;
    cart.items[existingIdx].price = price;
    cart.items[existingIdx].name = name;
    cart.items[existingIdx].image = image;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price,
      name,
      image,
    } as any);
  }

  recalcCart(cart);
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: "name images price salePrice isActive slug",
  });

  return cart;
};

export const removeCartItem = async (userId: string, productId: string) => {
  const cart = await getOrCreateCart(userId);

  cart.items = cart.items.filter(
    (i: any) => i.product.toString() !== productId
  );

  recalcCart(cart);
  await cart.save();

  await cart.populate({
    path: "items.product",
    select: "name images price salePrice isActive slug",
  });

  return cart;
};

export const clearCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  recalcCart(cart);
  await cart.save();
  return cart;
};
