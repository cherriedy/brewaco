import { getType } from "#common/controllers/type/get-type.controller.js";
import { getTypes } from "#common/controllers/type/get-types.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getTypes);
router.get("/:id", getType);

export default router;
