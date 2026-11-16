import { Router } from "express";
import { sendContactMessageController } from "../controllers/contactControllers";

const router = Router();

router.post("/", sendContactMessageController);

export default router;