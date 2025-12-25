import { Request, Response } from "express";
import { z } from "zod";
import { ChatRequestSchema } from "../utils/validate";
import { handleChat } from "../services/chat.service";
import { prisma } from "../prisma/client";

/* ---------------- POST MESSAGE ---------------- */
export async function postChat(req: Request, res: Response) {
  try {
    const body = { ...(req.body ?? {}) };
    if (body.sessionId === null) delete body.sessionId;

    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request payload",
      });
    }

    const { message, sessionId } = parsed.data;
    const result = await handleChat(message, sessionId);

    return res.json(result);
  } catch (err) {
    console.error("postChat error:", err);
    return res.status(500).json({
      reply:
        "Our support system is temporarily unavailable. Please try again shortly.",
    });
  }
}

/* ---------------- GET CHAT HISTORY ---------------- */

// Validate route param
const SessionParamSchema = z.object({
  sessionId: z.string().uuid(),
});

export async function getChatHistory(req: Request, res: Response) {
  try {
    const parsed = SessionParamSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid sessionId",
      });
    }

    const { sessionId } = parsed.data;

    // Ensure session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({
        error: "Chat session not found",
      });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return res.json({
      sessionId,
      messages,
    });
  } catch (err) {
    console.error("getChatHistory error:", err);
    return res.status(500).json({
      error:
        "Our support system is temporarily unavailable. Please try again shortly.",
    });
  }
}
