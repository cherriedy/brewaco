import { createContact } from "#common/controllers/contact/create-contact.controller.js";
import { Router } from "express";

const router = Router();

router.post("/", createContact);

export default router;
