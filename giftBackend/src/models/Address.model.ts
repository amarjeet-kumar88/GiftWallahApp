import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  pincode: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  landmark?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: false }, // abhi optional rakhte hain (hum default "Customer" bhi de rahe)
    phone: { type: String, required: false },
    pincode: { type: String, required: false },
    line1: { type: String, required: false },
    line2: { type: String },
    city: { type: String, required: false },
    state: { type: String, required: false },
    landmark: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Address = mongoose.model<IAddress>("Address", addressSchema);
