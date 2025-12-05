import { z } from "zod";

export const cartAddOrUpdateSchema = {
  body: z.object({
    productId: z.string().min(1, "productId is required"),

    quantity: z
      .number()
      .int()
      .min(1, "quantity is required")
  })
};

export const cartRemoveItemSchema = {
  params: z.object({
    productId: z.string().min(1)
  })
};
