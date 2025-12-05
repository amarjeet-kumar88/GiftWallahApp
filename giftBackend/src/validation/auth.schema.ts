import { z } from "zod";

export const sendOtpSchema = {
  body: z.object({
    phone: z
      .string()
      .min(1, "Phone is required")
      .min(8, "Phone is too short")
      .max(20, "Phone is too long")
  })
};

export const verifyOtpSchema = {
  body: z.object({
    phone: z
      .string()
      .min(1, "Phone is required")
      .min(8, "Invalid phone number")
      .max(20, "Invalid phone number"),

    otp: z
      .string()
      .min(1, "OTP is required")
      .length(6, "OTP must be 6 digits"),

    name: z.string().min(1).max(100).optional(),
    email: z.string().email("Invalid email").optional()
  })
};
