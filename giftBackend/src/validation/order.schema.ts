import { z } from "zod";

export const createCodOrderSchema = {
  body: z.object({
    addressId: z.string().min(1, "addressId is required")
  })
};

export const createOnlineOrderInitSchema = {
  body: z.object({
    addressId: z.string().min(1, "addressId is required")
  })
};
