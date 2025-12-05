import { User } from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import { sendLoginOTP, verifyLoginOTP } from "../services/auth.service";
import { successResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { AuthRequest } from "../middlewares/auth.middleware";

export const sendOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      throw new ApiError(400, "Phone is required");
    }

    await sendLoginOTP(phone);
    res.status(200).json(successResponse("OTP sent successfully"));
  } catch (error) {
    next(error);
  }
};

export const verifyOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, otp, name, email } = req.body;
    const result = await verifyLoginOTP({ phone, otp, name, email });

    res.status(200).json(
      successResponse("Login successful", {
        token: result.token,
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          roles: result.user.roles,
          isPhoneVerified: result.user.isPhoneVerified
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

export const meController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json(
      successResponse("Current user", {
        user
      })
    );
  } catch (error) {
    next(error);
  }
};
