import { forgotPassword } from "#common/controllers/auth/forgot-password.controller.js";
import { adminLogin } from "#common/controllers/auth/login.controller.js";
import { resetPassword } from "#common/controllers/auth/reset-password.controller.js";
import { validateResetCode } from "#common/controllers/auth/validate-reset-code.controller.js";
import { Router } from "express";

const router = Router();

// Admin login - only allows admin role
router.post("/login", adminLogin);

// Password reset flows (reused from common controllers)
router.post("/forgot-password", forgotPassword);
router.post("/validate-reset-code", validateResetCode);
router.post("/reset-password", resetPassword);

export default router;
