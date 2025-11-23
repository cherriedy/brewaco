import { z } from "zod";

export const createTypeSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, "type.validation.nameRequired"),
  slug: z.string().optional(),
});

export const updateTypeSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, "type.validation.nameRequired").optional(),
  slug: z.string().optional(),
});

export type CreateTypePayload = z.infer<typeof createTypeSchema>;
export type UpdateTypePayload = z.infer<typeof updateTypeSchema>;
