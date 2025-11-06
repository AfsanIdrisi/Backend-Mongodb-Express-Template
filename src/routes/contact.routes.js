import express from "express";
import { ContactForm ,deleteContact,getAllContacts } from "../controllers/contact.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";



const router = express.Router();

router.post("/", ContactForm);
router.get("/all",verifyAccessToken,getAllContacts)
router.delete("/:id" ,deleteContact)
export default router;