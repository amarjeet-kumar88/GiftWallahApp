import { Request, Response, NextFunction } from "express";
import { uploadImageBufferToCloudinary } from "../services/storage.service";
import { successResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export const uploadProductImageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;

    if (!file || !file.buffer) {
      throw new ApiError(400, "Image file is required");
    }

    const uploaded = await uploadImageBufferToCloudinary(
      file.buffer,
      "products"
    );

    res.status(201).json(
      successResponse("Image uploaded successfully", {
        image: uploaded
      })
    );
  } catch (error) {
    next(error);
  }
};
