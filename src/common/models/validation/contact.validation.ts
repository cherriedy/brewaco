import { contactConfig } from "#config/app.js";
import { z } from "zod";

export const createContactSchema = z.object({
  email: z.string("emailRequired").email("invalidEmail"),
  message: z
    .string("contact.validation.message.required")
    .min(
      contactConfig.message.minLength,
      "contact.validation.message.minLength",
    )
    .max(
      contactConfig.message.maxLength,
      "contact.validation.message.maxLength",
    ),
  name: z
    .string("contact.validation.name.required")
    .min(contactConfig.name.minLength, "contact.validation.name.minLength"),
});

export type CreateContactPayload = z.infer<typeof createContactSchema>;
