import { cloudinary } from "../config/cloudinary";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";

export interface UploadedImage {
  url: string;
  publicId: string;
}

export const uploadImageBufferToCloudinary = async (
  buffer: Buffer,
  folder = "products"
): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result) {
          logger.error("Cloudinary upload error:", error);
          return reject(new ApiError(500, "Failed to upload image"));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(buffer);
  });
};

export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error("Cloudinary delete error:", error);
    // user ko error mat do, kyunki product delete ho sakta hai,
    // sirf log rakhna kafi hai
  }
};
