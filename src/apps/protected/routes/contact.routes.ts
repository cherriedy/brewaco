import { getContacts } from "#common/controllers/contact/get-contacts.controller.js";
import { updateContactState } from "#common/controllers/contact/update-contact-state.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getContacts);
router.patch("/:id/state", updateContactState);

export default router;
