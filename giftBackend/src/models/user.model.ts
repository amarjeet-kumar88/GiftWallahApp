import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  name?: string;
  email?: string;
  phone: string;
  password?: string;
  isPhoneVerified: boolean;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    roles: {
      type: [String],
      enum: ["user", "admin"],
      default: ["user"]
    }
  },
  { timestamps: true }
);

// ✅ FIX: Prevent OverwriteModelError during hot reloads
export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
