import { Router } from "express";
import { getUserProfile } from "#common/controllers/user/get-user-profile.controller.js";
import { updateUserProfile } from "#common/controllers/user/update-user-profile.controller.js";
import { changePassword } from "#common/controllers/user/change-password.controller.js";

const router = Router();

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/change-password", changePassword);

export default router;
