import { getContacts } from "#common/controllers/contact/get-contacts.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getContacts);

export default router;
