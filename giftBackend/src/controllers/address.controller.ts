import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createAddress,
  deleteAddress,
  getUserAddresses,
  updateAddress
} from "../services/address.service";
import { successResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const createAddressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const address = await createAddress(req.user.userId, req.body);
    res
      .status(201)
      .json(successResponse("Address created successfully", { address }));
  } catch (error) {
    next(error);
  }
};

export const getAddressesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const addresses = await getUserAddresses(req.user.userId);
    res
      .status(200)
      .json(successResponse("Addresses fetched", { addresses }));
  } catch (error) {
    next(error);
  }
};

export const updateAddressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const address = await updateAddress(
      req.user.userId,
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json(successResponse("Address updated", { address }));
  } catch (error) {
    next(error);
  }
};

export const deleteAddressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    await deleteAddress(req.user.userId, req.params.id);
    res.status(200).json(successResponse("Address deleted"));
  } catch (error) {
    next(error);
  }
};
