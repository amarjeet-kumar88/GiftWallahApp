import { Order, PaymentMethod } from "../models/order.model";
import { ApiError } from "../utils/apiError";
import { ensureAddressSavedForUser } from "./address.service";
import { Cart } from "../models/cart.model";

/**
 * Cart se PAID order create karega (Razorpay success ke baad)
 */
interface CreatePaidOrderParams {
  userId: string;
  address: any; // AddressInput
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const createPaidOrderFromCart = async ({
  userId,
  address,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: CreatePaidOrderParams) => {
  // 1) Cart
  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // 2) Address ko SavedAddresses me bhi ensure karo
  const savedAddr = await ensureAddressSavedForUser(userId, address);

  // 3) Order create
  const order = await Order.create({
    user: cart.user,
    items: cart.items,
    amount: cart.totalPrice,
    currency: "INR",

    // tumhare model ke hisaab se
    status: "CONFIRMED", // schema string hai, yeh allowed hai
    paymentStatus: "PAID",
    paymentMethod: PaymentMethod.RAZORPAY,

    address: {
      fullName: savedAddr.fullName,
      phone: savedAddr.phone,
      pincode: savedAddr.pincode,
      line1: savedAddr.line1,
      line2: savedAddr.line2,
      city: savedAddr.city,
      state: savedAddr.state,
      landmark: savedAddr.landmark,
    },

    payment: {
      provider: "RAZORPAY", // ⭐ REQUIRED
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    },

    // compatibility fields (optional, agar kahin use ho rahe ho)
    razorpayPaymentId,
    razorpaySignature,
  });

  // 4) Cart clear
  cart.items = [];
  cart.totalItems = 0;
  cart.totalPrice = 0;
  await cart.save();

  return order;
};

/**
 * Agar tum kahin aur `createOrderFromCartAfterPayment` use kar rahe ho,
 * usko bhi EXACT same payment shape dena zaroori hai.
 */
export const createOrderFromCartAfterPayment = async (params: {
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  address: any;
}) => {
  const { userId, address, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const savedAddr = await ensureAddressSavedForUser(userId, address);

  const order = await Order.create({
    user: userId,
    items: cart.items,
    amount: cart.totalPrice,
    currency: "INR",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paymentMethod: PaymentMethod.RAZORPAY,
    address: {
      fullName: savedAddr.fullName,
      phone: savedAddr.phone,
      pincode: savedAddr.pincode,
      line1: savedAddr.line1,
      line2: savedAddr.line2,
      city: savedAddr.city,
      state: savedAddr.state,
      landmark: savedAddr.landmark,
    },
    payment: {
      provider: "RAZORPAY",       // ⭐ Yahan bhi add Kiya
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    },
    razorpayPaymentId,
    razorpaySignature,
  });

  // cart clear
  cart.items = [];
  cart.totalItems = 0;
  cart.totalPrice = 0;
  await cart.save();

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

  (order as any).paymentStatus = "PAID";
  order.status = "CONFIRMED";

  if (razorpayPaymentId) {
    (order as any).razorpayPaymentId = razorpayPaymentId;
  }
  if (razorpaySignature) {
    (order as any).razorpaySignature = razorpaySignature;
  }

  await order.save();
};

export const cancelOrderForUser = async (userId: string, orderId: string) => {
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) throw new ApiError(404, "Order not found");

  if (
    order.status === "SHIPPED" ||
    order.status === "DELIVERED" ||
    order.status === "CANCELLED"
  ) {
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  order.status = "CANCELLED" as any;
  await order.save();
  return order;
};

interface AddressPayload {
  fullName?: string;
  name?: string;
  phone?: string;
  pincode?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  landmark?: string;
}

export const updateOrderAddressForUser = async (
  userId: string,
  orderId: string,
  payload: AddressPayload
) => {
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) throw new ApiError(404, "Order not found");

  if (order.status !== "pending" && order.status !== "confirmed" && order.status !== "CONFIRMED") {
    throw new ApiError(
      400,
      "Address cannot be updated after order is processed"
    );
  }

  const addr: any = order.address || {};

  addr.fullName = payload.fullName ?? addr.fullName ?? payload.name;
  addr.name = payload.name ?? addr.name ?? addr.fullName;
  addr.phone = payload.phone ?? addr.phone;
  addr.pincode = payload.pincode ?? addr.pincode;
  addr.line1 = payload.line1 ?? addr.line1;
  addr.line2 = payload.line2 ?? addr.line2;
  addr.city = payload.city ?? addr.city;
  addr.state = payload.state ?? addr.state;
  addr.landmark = payload.landmark ?? addr.landmark;

  order.address = addr;

  await order.save();
  return order;
};
