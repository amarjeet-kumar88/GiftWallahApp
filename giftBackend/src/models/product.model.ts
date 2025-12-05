import mongoose, { Document, Schema } from "mongoose";

export interface IProductImage {
  url: string;          // GCP public URL
  publicId?: string;    // अगर GCP में id या path store करना हो
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: IProductImage[];
  category: mongoose.Types.ObjectId;
  attributes: Record<string, string>; // e.g. { color: "red", size: "M" }
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String }
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    brand: { type: String },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    images: {
      type: [productImageSchema],
      default: []
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    attributes: {
      type: Map,
      of: String,
      default: {}
    },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
