import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";
import { ApiError } from "../utils/apiError";

export const adminMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.roles.includes("admin")) {
    return next(new ApiError(403, "Forbidden: Admin access required"));
  }
  next();
};
