import { z } from "zod";

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500, "Message too long"),
  sessionId: z.string().uuid().optional(),
});
