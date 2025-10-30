import { z } from "zod";

export const createCategorySchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, "category.validation.nameRequired"),
  slug: z.string().optional(),
});

export const updateCategorySchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, "category.validation.nameRequired").optional(),
  slug: z.string().optional(),
});

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>;
