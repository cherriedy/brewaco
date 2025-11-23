
import { createType } from "#common/controllers/type/create-type.controller.js";
import { deleteType } from "#common/controllers/type/delete-type.controller.js";
import { getType } from "#common/controllers/type/get-type.controller.js";
import { getTypes } from "#common/controllers/type/get-types.controller.js";
import { updateType } from "#common/controllers/type/update-type.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getTypes);
router.get("/:id", getType);
router.post("/", createType);
router.put("/:id", updateType);
router.delete("/:id", deleteType);

export default router;
