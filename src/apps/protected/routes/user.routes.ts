import { Router } from "express";
import { getUserProfile } from "#common/controllers/user/get-user-profile.controller.js";

const router = Router();

router.get("/profile", getUserProfile);

export default router;
