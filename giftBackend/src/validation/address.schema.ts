import { z } from "zod";

const addressBody = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().min(4).max(10),
  country: z.string().default("India"),
  isDefault: z.boolean().optional()
});

// ✅ CORRECT
export const createAddressSchema = {
  body: addressBody
};

// ✅ CORRECT
export const updateAddressSchema = {
  params: z.object({
    id: z.string().min(1)
  }),
  body: addressBody.partial()
};

// ✅ CORRECT
export const addressIdParamSchema = {
  params: z.object({
    id: z.string().min(1)
  })
};
