import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent?: ICategory["_id"] | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// FIX: Prevent OverwriteModelError
export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);
