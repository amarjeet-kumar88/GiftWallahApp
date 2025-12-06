import mongoose, { Document, Schema } from "mongoose";

// ---- ITEMS ----
export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

// ---- ADDRESS ----
// Purana code probably `name` use kar raha tha,
// naya checkout `fullName` use karta hai.
// Dono support karenge.
export interface IOrderAddress {
  name?: string;
  fullName?: string;
  phone: string;
  pincode: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  landmark?: string;
}

// ---- PAYMENT METHOD ENUM ----
export enum PaymentMethod {
  RAZORPAY = "RAZORPAY",
  COD = "COD",
}

// ---- NESTED PAYMENT OBJECT (naya style) ----
export interface IOrderPayment {
  provider: string;           // "RAZORPAY"
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// ---- MAIN ORDER ----
// Yahan hum purane + naye sab fields rakh rahe hain:
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];

  amount: number;
  currency: string;

  // Purana code me "confirmed" waqera use ho sakta hai
  status: string;

  address: IOrderAddress;

  // New nested payment object
  payment?: IOrderPayment;

  // Old compatibility fields:
  paymentStatus?: string;          // "paid" / "pending" etc
  paymentMethod?: PaymentMethod;   // enum
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    name: { type: String },      // optional
    fullName: { type: String },  // optional
    phone: { type: String, required: true },
    pincode: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    landmark: { type: String },
  },
  { _id: false }
);

const orderPaymentSchema = new Schema<IOrderPayment>(
  {
    provider: { type: String, required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    razorpaySignature: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    status: { type: String, default: "PAID" },

    address: { type: orderAddressSchema, required: true },

    // new nested payment
    payment: { type: orderPaymentSchema, required: false },

    // compatibility fields for old code (admin, order.service, etc):
    paymentStatus: { type: String, default: "paid" },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.RAZORPAY,
    },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
