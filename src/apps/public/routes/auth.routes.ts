import { forgotPassword } from "#common/controllers/auth/forgot-password.controller.js";
import { customerLogin } from "#common/controllers/auth/login.controller.js";
import { register } from "#common/controllers/auth/register.controller.js";
import { resetPassword } from "#common/controllers/auth/reset-password.controller.js";
import { validateResetCode } from "#common/controllers/auth/validate-reset-code.controller.js";
import { Router } from "express";

const router = Router();

router.post("/login", customerLogin);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/validate-reset-code", validateResetCode);
router.post("/reset-password", resetPassword);

export default router;
