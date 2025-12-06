import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../utils/apiError";
import { successResponse } from "../utils/apiResponse";
import {
  createAddressForUser,
  deleteAddressForUser,
  getAddressesForUser,
  setDefaultAddressForUser,
  updateAddressForUser,
} from "../services/address.service";

export const getMyAddressesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const addresses = await getAddressesForUser(req.user.userId);
    res.status(200).json(successResponse("Addresses fetched", { addresses }));
  } catch (error) {
    next(error);
  }
};

export const createMyAddressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const address = await createAddressForUser(req.user.userId, req.body);
    res.status(201).json(successResponse("Address created", { address }));
  } catch (error) {
    next(error);
  }
};

export const updateMyAddressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const address = await updateAddressForUser(
      req.user.userId,
      req.params.addressId,
      req.body
    );
    res.status(200).json(successResponse("Address updated", { address }));
  } catch (error) {
    next(error);
  }
};

export const deleteMyAddressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    await deleteAddressForUser(req.user.userId, req.params.addressId);
    res.status(200).json(successResponse("Address deleted", {}));
  } catch (error) {
    next(error);
  }
};

export const setMyDefaultAddressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const address = await setDefaultAddressForUser(
      req.user.userId,
      req.params.addressId
    );
    res.status(200).json(successResponse("Default address updated", { address }));
  } catch (error) {
    next(error);
  }
};
