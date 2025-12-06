export interface ProductImage {
  url: string;
  publicId?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  parent?: string | Category | null;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  brand?: string;
  price: number;
  salePrice?: number;
  stock: number;
  category?: Category;
  images?: ProductImage[];
  averageRating?: number;
  totalReviews?: number;
}

export interface UserSummary {
  _id: string;
  name?: string;
}

export interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment?: string;
  user?: UserSummary;
  createdAt?: string;
}

export interface CartItem {
  // product: populated object ya sirf id
  product: any;
  quantity: number;
  price: number; // snapshot price per unit
  name: string;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface WishlistItem {
  product: Product | string; // populated ya sirf id
  createdAt?: string;
}

export interface Wishlist {
  items: WishlistItem[];
}

export interface Address {
  fullName: string;
  phone: string;
  pincode: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  landmark?: string;
}

export interface OrderSummary {
  amount: number;
  currency: string;
  razorpayOrderId: string;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface OrderAddress {
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

export interface OrderPayment {
  provider: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
  address?: OrderAddress;
  payment?: OrderPayment;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface OrderAddress {
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

export interface OrderPayment {
  provider: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
  address?: OrderAddress;
  payment?: OrderPayment;
}

export interface SavedAddress {
  _id: string;
  fullName: string;
  phone: string;
  pincode: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  landmark?: string;
  isDefault: boolean;
}

