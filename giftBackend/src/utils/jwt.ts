import { UserRole } from "../models/user.model";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env";

export interface JWTPayload {
  userId: string;
  roles: UserRole[];
}

const JWT_SECRET: Secret = ENV.JWT_SECRET as Secret;

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (ENV.JWT_EXPIRES_IN as unknown as SignOptions["expiresIn"]) ?? "7d";

export const signAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};
