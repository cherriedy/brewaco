import { z } from "zod";
import { authConfig } from "#config/app.js";

export const passwordSchema = z
  .string()
  .min(authConfig.password.length, { message: "registration.passwordLength" })
  .regex(/[A-Z]/, { message: "registration.passwordUpper" })
  .regex(/[a-z]/, { message: "registration.passwordLower" })
  .regex(/[0-9]/, { message: "registration.passwordNumber" })
  .regex(/[^A-Za-z0-9]/, { message: "registration.passwordSpecial" });

export const emailSchema = z.email({ message: "auth.invalidEmail" });
