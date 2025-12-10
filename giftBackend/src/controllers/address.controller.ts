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

// GET /api/addresses
export const getMyAddressesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const addresses = await getAddressesForUser(req.user.userId);

    return res
      .status(200)
      .json(successResponse("Addresses fetched", { addresses }));
  } catch (error) {
    next(error);
  }
};

// POST /api/addresses
export const createMyAddressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const address = await createAddressForUser(req.user.userId, req.body);

    return res
      .status(201)
      .json(successResponse("Address created", { address }));
  } catch (error) {
    next(error);
  }
};

// PUT /api/addresses/:addressId
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

    return res
      .status(200)
      .json(successResponse("Address updated", { address }));
  } catch (error) {
    next(error);
  }
};

// DELETE /api/addresses/:addressId
export const deleteMyAddressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    await deleteAddressForUser(req.user.userId, req.params.addressId);

    return res
      .status(200)
      .json(successResponse("Address deleted", {}));
  } catch (error) {
    next(error);
  }
};

// PATCH /api/addresses/:addressId/default
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

    return res
      .status(200)
      .json(successResponse("Default address updated", { address }));
  } catch (error) {
    next(error);
  }
};
