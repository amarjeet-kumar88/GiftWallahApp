import { NextFunction, Request, Response } from "express";
import { verifyAccessToken, JWTPayload } from "../utils/jwt";
import { ApiError } from "../utils/apiError";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(new ApiError(401, "Unauthorized: Invalid or expired token"));
  }
};
