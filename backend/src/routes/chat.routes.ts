import { Router } from "express";
import { postChat, getChatHistory } from "../controllers/chat.controller";

const router = Router();

router.post("/chat/message", postChat);
router.get("/chat/session/:sessionId", getChatHistory);

export default router;
