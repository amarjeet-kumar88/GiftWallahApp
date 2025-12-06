import { Order, IOrderAddress, PaymentMethod } from "../models/order.model";
import { getCartForUser, clearCart } from "./cart.service";
import { ApiError } from "../utils/apiError";

/**
 * Cart se PAID order create karega (Razorpay success ke baad).
 */
export const createPaidOrderFromCart = async (params: {
  userId: string;
  address: IOrderAddress;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => {
  const {
    userId,
    address,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = params;

  const cart = await getCartForUser(userId);

  if (!cart || cart.totalItems === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const order = await Order.create({
    user: cart.user,
    items: cart.items.map((i) => ({
      product: i.product,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
    })),
    amount: cart.totalPrice,
    currency: "INR",
    status: "confirmed", // old code bhi isko use kar sakta hai
    address: {
      ...address,
      // dono fields set kar dete hain:
      name: (address as any).name || (address as any).fullName,
      fullName: (address as any).fullName || (address as any).name,
    },
    payment: {
      provider: "RAZORPAY",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    },
    paymentStatus: "paid",
    paymentMethod: PaymentMethod.RAZORPAY,
    razorpayPaymentId,
    razorpaySignature,
  });

  await clearCart(userId);

  return order;
};

/**
 * User ke sare orders
 */
export const getUserOrders = async (userId: string) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

/**
 * Specific order user ke liye
 */
export const getOrderByIdForUser = async (userId: string, orderId: string) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

/**
 * Admin: sabhi orders
 */
export const getAllOrders = async () => {
  return Order.find()
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });
};

/**
 * Admin: order status update (aur optional paymentStatus)
 */
export const updateOrderStatus = async (
  orderId: string,
  status: string,
  paymentStatus?: string
) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;
  if (paymentStatus) {
    (order as any).paymentStatus = paymentStatus;
  }

  await order.save();
  return order;
};


export const markOrderPaid = async (...args: any[]): Promise<void> => {
  // Hum args ko flexible rakhenge:
  // expected: (orderId, razorpayPaymentId?, razorpaySignature?)
  const orderId = args[0];
  const razorpayPaymentId = args[1];
  const razorpaySignature = args[2];

  if (!orderId) {
    throw new ApiError(400, "orderId is required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Old style fields:
  (order as any).paymentStatus = "paid";
  order.status = "confirmed";

  if (razorpayPaymentId) {
    (order as any).razorpayPaymentId = razorpayPaymentId;
  }
  if (razorpaySignature) {
    (order as any).razorpaySignature = razorpaySignature;
  }

  await order.save();
};