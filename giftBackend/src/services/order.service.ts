import { Address } from "../models/Address.model";
import { Cart } from "../models/cart.model";
import { Order} from "../models/order.model";
import { PaymentMethod } from "../models/order.model";
import { ApiError } from "../utils/apiError";
import { clearCart } from "./cart.service";

export const createOrderFromCart = async (
  userId: string,
  addressId: string,
  paymentMethod: PaymentMethod,
  razorpayOrderId?: string
) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const order = await Order.create({
    user: userId,
    items: cart.items,
    totalItems: cart.totalItems,
    totalAmount: cart.totalPrice,
    address: {
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country
    },
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    status: paymentMethod === "cod" ? "confirmed" : "created",
    razorpayOrderId
  });

  if (paymentMethod === "cod") {
    await clearCart(userId);
  }

  return order;
};

export const markOrderPaid = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    throw new ApiError(404, "Order not found for this Razorpay order id");
  }

  order.paymentStatus = "paid";
  order.status = "confirmed";
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  await order.save();

  await clearCart(order.user.toString());

  return order;
};
