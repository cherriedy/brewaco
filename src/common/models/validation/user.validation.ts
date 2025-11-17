import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1, "user.name.required").optional(),
  phone: z.string().min(1, "user.phone.required").optional(),
  address: z
    .object({
      province: z.object({ code: z.string(), name: z.string() }).optional(),
      district: z.object({ code: z.string(), name: z.string() }).optional(),
      ward: z.object({ code: z.string(), name: z.string() }).optional(),
      detail: z.string().optional(),
    })
    .optional(),
});

export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
