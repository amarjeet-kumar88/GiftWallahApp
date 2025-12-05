import { z } from "zod";

export const wishlistAddSchema = {
  body: z.object({
    productId: z.string().min(1),
  }),
};

export const wishlistProductParamSchema = {
  params: z.object({
    productId: z.string().min(1),
  }),
};
