import { login } from "#controllers/auth/login.controller.js";
import { register } from "#controllers/auth/register.controller.js";
import { Router } from "express";
import { forgotPassword } from "#controllers/auth/forgot-password.controller.js";
import { validateResetCode } from "#controllers/auth/validate-reset-code.controller.js";
import { resetPassword } from "#controllers/auth/reset-password.controller.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/validate-reset-code", validateResetCode);
router.post("/reset-password", resetPassword);

export default router;
