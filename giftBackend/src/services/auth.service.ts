import { User, IUser } from "../models/user.model";
import bcrypt from "bcryptjs";
import { OTP } from "../models/otp.model";
import { ApiError } from "../utils/apiError";
import { sendOTPViaSMS } from "./sms.service";
import { signAccessToken } from "../utils/jwt";

const OTP_EXPIRY_MINUTES = 5;
const SALT_ROUNDS = 10;

const generateNumericOTP = (length = 6): string => {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

// Step 1: Send OTP
export const sendLoginOTP = async (phone: string): Promise<void> => {
  // normalize phone (you can improve as needed)
  const normalizedPhone = phone.trim();

  if (!normalizedPhone) {
    throw new ApiError(400, "Phone number is required");
  }

  const otpCode = generateNumericOTP(6);
  const codeHash = await bcrypt.hash(otpCode, SALT_ROUNDS);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await OTP.create({
    phone: normalizedPhone,
    codeHash,
    expiresAt
  });

  await sendOTPViaSMS(normalizedPhone, otpCode);
};

// Step 2: Verify OTP & Login / Register
export const verifyLoginOTP = async (params: {
  phone: string;
  otp: string;
  name?: string;
  email?: string;
}): Promise<{ token: string; user: IUser }> => {
  const { phone, otp, name, email } = params;
  const normalizedPhone = phone.trim();

  if (!normalizedPhone || !otp) {
    throw new ApiError(400, "Phone and OTP are required");
  }

  const latestOtp = await OTP.findOne({
    phone: normalizedPhone,
    isUsed: false
  }).sort({ createdAt: -1 });

  if (!latestOtp) {
    throw new ApiError(400, "OTP not found or already used");
  }

  if (latestOtp.expiresAt < new Date()) {
    throw new ApiError(400, "OTP has expired");
  }

  const isMatch = await bcrypt.compare(otp, latestOtp.codeHash);
  if (!isMatch) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Mark OTP as used
  latestOtp.isUsed = true;
  await latestOtp.save();

  // Find or create user
  let user: IUser | null = await User.findOne({ phone: normalizedPhone });

  if (!user) {
    user = await User.create({
      phone: normalizedPhone,
      name,
      email,
      isPhoneVerified: true,
      roles: ["user"]
    });
  } else {
    user.isPhoneVerified = true;
    if (name && !user.name) user.name = name;
    if (email && !user.email) user.email = email;
    await user.save();
  }

  // yahan extra safety + type narrowing:
  if (!user) {
    throw new ApiError(500, "User could not be created");
  }

  const token = signAccessToken({
    userId: user._id.toString(),
    roles: user.roles
  });

  return {
    token,
    user
  };
}

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();
  return user;
};