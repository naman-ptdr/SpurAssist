import { prisma } from "../prisma/client";
import { generateReply, ChatMessage } from "./llm.service";
import { Role } from "@prisma/client";

const MAX_HISTORY = 10;

export async function handleChat(
  message: string,
  sessionId?: string
): Promise<{ reply: string; sessionId: string }> {
  try {
    let session = null;

    if (sessionId) {
      session = await prisma.session.findUnique({
        where: { id: sessionId },
      });
    }

    if (!session) {
      session = await prisma.session.create({ data: {} });
    }

    /* SAVE USER MESSAGE */
    await prisma.message.create({
      data: {
        content: message,
        role: Role.user,
        sessionId: session.id,
      },
    });

    /* FETCH HISTORY */
    const history = await prisma.message.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "desc" },
      take: MAX_HISTORY,
    });

    const chatHistory: ChatMessage[] = history.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    /* GENERATE REPLY */
    const reply = await generateReply(chatHistory);

    /* SAVE ASSISTANT MESSAGE */
    await prisma.message.create({
      data: {
        content: reply,
        role: Role.assistant,
        sessionId: session.id,
      },
    });

    return { reply, sessionId: session.id };
  } catch (err) {
    console.error("Chat service error:", err);
    return {
      reply:
        "Our support system is temporarily unavailable. Please try again shortly.",
      sessionId: sessionId ?? "",
    };
  }
}
