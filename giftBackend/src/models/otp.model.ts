import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  phone: string;
  codeHash: string;  // bcrypt hashed OTP
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// पुरानी / expired OTP auto delete करने के लिए index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model<IOTP>("OTP", otpSchema);
