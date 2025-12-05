import { z } from "zod";

// FIX 1: Removed `required_error`
export const reviewBodySchema = z.object({
  rating: z
    .number()
    .min(1, "rating is required")
    .max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional()
});

// FIX 2: Use plain object, not z.object({...})
export const addOrUpdateReviewSchema = {
  params: z.object({
    productId: z.string().min(1)
  }),
  body: reviewBodySchema
};

export const reviewProductParamSchema = {
  params: z.object({
    productId: z.string().min(1)
  })
};
