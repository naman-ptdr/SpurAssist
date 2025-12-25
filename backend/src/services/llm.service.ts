import { GoogleGenAI } from "@google/genai";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_INSTRUCTIONS = `
You are SpurBot, a professional customer support agent for SpurStore, an e-commerce store.

You can help customers with:
- Products and buying guidance
- Order placement and order processing
- Shipping and delivery timelines
- Returns and refunds
- Support-related questions

Knowledge base:
- Shipping: We ship to USA, UK, and India. Free shipping on orders above $50.
- Returns: 30-day return policy for unused items with original tags.
- Support hours: Monday to Friday, 9 AM – 6 PM EST.

Rules:
- Answer like a real e-commerce support agent.
- If a question is clearly unrelated to shopping or customer support
  (e.g. coding, math, politics, jokes, general knowledge),
  reply EXACTLY:
  "I’m sorry, I can only assist with SpurStore products, orders, shipping, and support."
- Keep answers short and professional (2–4 sentences).
`;


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/* ---------------- FAQ FALLBACK ---------------- */
function faqFallback(message: string): string | null {
  const m = message.toLowerCase();

  if (m.includes("ship") && (m.includes("usa") || m.includes("us"))) {
    return "Yes, we ship to the USA. Orders above $50 qualify for free shipping.";
  }

  if (m.includes("ship") && m.includes("india")) {
    return "Yes, we ship across India. Free shipping applies to orders over $50.";
  }

  if (m.includes("return")) {
    return "We offer a 30-day return policy for unused items with original tags.";
  }

  if (m.includes("refund")) {
    return "Refunds are processed within 5–7 business days after return approval.";
  }

  if (m.includes("support") || m.includes("hours")) {
    return "Our support hours are Monday to Friday, 9 AM to 6 PM EST.";
  }

  return null;
}

/* ---------------- RATE LIMITING ---------------- */
let lastCallAt = 0;
const MIN_INTERVAL_MS = 3000; // 1 call / 3 seconds

/* ---------------- MAIN LLM HANDLER ---------------- */
export async function generateReply(history: ChatMessage[]): Promise<string> {
  try {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY missing");
    return "Our support system is temporarily unavailable. Please try again shortly.";
  }

  const userMessage = history.length > 0 ? history[history.length - 1].content ?? "" : "";

  /* FAQ FALLBACK FIRST (VERY IMPORTANT) */
  const faq = faqFallback(userMessage);
  if (faq) return faq;

    /* BASIC RATE LIMITING */
    const now = Date.now();
    if (now - lastCallAt < MIN_INTERVAL_MS) {
      return "Please wait a moment before sending another message.";
    }
    lastCallAt = now;

    /* PROMPT BUILD */
    const prompt = `
${SYSTEM_INSTRUCTIONS}

Conversation:
${history
  .map((m) => `${m.role === "assistant" ? "Agent" : "Customer"}: ${m.content}`)
  .join("\n")}

Agent:
`;

    /* GEMINI CALL */
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return (
      response.text?.trim() ??
      "I’m sorry, I can only assist with SpurStore products, shipping, and support."
    );
  } catch (err: any) {
    /* QUOTA / RATE LIMIT */
    if (err?.status === 429) {
      console.warn("Gemini quota exceeded");
      return "Our support agents are currently busy. Please try again shortly.";
    }

    /* INVALID API KEY */
    if (err?.status === 401 || err?.status === 403) {
      console.error("Gemini auth error");
      return "Our support system is temporarily unavailable. Please try again shortly.";
    }

    /* MODEL / CONFIG ERRORS */
    if (err?.status === 404) {
      console.error("Gemini model not found");
      return "Our support system is temporarily unavailable. Please try again shortly.";
    }

    /* NETWORK / UNKNOWN */
    console.error("Gemini unknown error:", err);
    return "Our support system is temporarily unavailable. Please try again shortly.";
  }
}
