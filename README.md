# SpurAssist — AI Customer Support Agent
![Status](https://img.shields.io/badge/Status-Completed-success)
![Stack](https://img.shields.io/badge/Stack-PERN-blue)
![LLM](https://img.shields.io/badge/AI-Google%20Gemini-orange)

> **Submission for:** Spur Founding Full-Stack Engineer Assignment  
> **Author:** Naman Patidar

---

## 1. Project Overview

**SpurAssist** is a domain-specific AI customer support agent designed for **SpurStore**, a fictional e-commerce brand. It simulates a real-world live chat widget where an AI assistant helps customers with shipping, returns, and order inquiries.

This project was built to demonstrate:
1.  **Robust Backend Architecture:** Separation of concerns using Node.js, Express, and TypeScript.
2.  **Stateful Conversations:** Persisting chat sessions and history using PostgreSQL and Prisma.
3.  **LLM Integration:** Context-aware responses using Google Gemini (Flash 2.5) with strict domain guardrails.
4.  **Product UX:** A polished, optimistic UI that handles latency and errors gracefully.

---

## 2. Core Features (Implemented)

### Backend & Architecture
* **Session Persistence:** Automatically creates and retrieves chat sessions. History is preserved across page reloads.
* **Rate Limiting:** Implements a strict per-session rate limit (1 message / 3 seconds) using database timestamps to prevent abuse.
* **Validation:** Strict input validation using Zod to ensure data integrity before it reaches the service layer.
* **Security:** Implemented `helmet` for security headers and configured CORS to allow specific origins (Localhost + Vercel).

### AI & LLM Logic
* **Contextual Awareness:** The agent receives the last 10 messages of the conversation to maintain context.
* **Domain Restriction:** System instructions explicitly forbid answering questions about math, coding, or general topics. The bot defaults to a standard refusal message for out-of-scope queries.
* **Error Handling:** Graceful fallbacks for API timeouts, rate limits (429), or auth errors.

### Frontend & UX
* **Session Restoration:** On load, checks `localStorage` for a `sessionId` and fetches history from the API.
* **Optimistic UI:** Displays the user's message immediately while the request processes.
* **Typing Indicators:** Visual cues while the LLM is generating a response.
* **Auto-Scroll:** Chat window automatically scrolls to the newest message.

---

## 3. Architecture

The application follows a clean **Controller-Service-Repository** pattern to ensure testability and separation of concerns.

### High-Level Flow
1.  **Frontend:** React app sends a payload `{ message, sessionId? }`.
2.  **Controller:** Validates input with Zod.
3.  **Service:** * Checks DB for the session.
    * Enforces Rate Limiting (compares `now` vs `lastMessageAt`).
    * Saves User Message to DB.
    * Fetches recent history.
    * Calls **LLM Service**.
    * Saves Assistant Reply to DB.
4.  **Database:** PostgreSQL stores relational data (Sessions <-> Messages).

### Diagram
```mermaid
flowchart LR
    subgraph Client
        UI[React UI]
    end

    subgraph Backend_Server
        API[Express API]
        Ctrl[Chat Controller]
        Svc[Chat Service]
        LLM[LLM Service]
    end

    subgraph Infrastructure
        DB[(PostgreSQL)]
        AI[Google Gemini API]
    end

    UI -->|POST /message| API
    API --> Ctrl
    Ctrl --> Svc
    Svc -->|Read/Write| DB
    Svc -->|Generate Content| LLM
    LLM -->|Request| AI
```
## 4. LLM Integration & Prompt Design

### Provider
**Google Gemini** (`gemini-2.5-flash`) via the `@google/genai` SDK.

### Why Gemini?
- Low latency
- Cost-efficient
- Strong reasoning for conversational flows

### Prompt Strategy
A system prompt is injected into every request defining:

- **Persona:**  
  *“SpurBot”* — a friendly customer support agent.

- **Knowledge Base:**
  - Shipping: USA, UK, India
  - Returns: 30-day window
  - Refunds: 5–7 business days

- **Strict Guardrails:**  
  If the user asks anything unrelated to shopping, respond **exactly** with:
  > “I’m sorry, I can only assist with SpurStore products, orders, shipping, and support.”

### Context Management
- Only the **last 10 messages** (`MAX_HISTORY`) are sent to the LLM to control token usage and latency.

---

## 5. Database Schema

Prisma ORM with PostgreSQL is used.

### Schema Overview

```prisma
model Session {
  id            String    @id @default(uuid())
  createdAt     DateTime  @default(now())
  lastMessageAt DateTime? // Used for rate limiting
  messages      Message[]
}

model Message {
  id        String   @id @default(uuid())
  content   String
  role      Role     // user | assistant
  createdAt DateTime @default(now())
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId String
}
```

### Design Decisions
- **DB-backed Rate Limiting:** Avoids in-memory state and works across restarts.
- **UUIDs:** Prevent enumeration attacks.
- **Cascade Deletes:** Automatically cleans up messages when a session is removed.

---

## 6. Setup & Run Locally

### Prerequisites
- Node.js v18+
- PostgreSQL (local or cloud)
- npm

---

### A. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/spurassist
GEMINI_API_KEY=your_google_gemini_key
```

Setup Prisma & database:

```bash
npx prisma generate
npx prisma db push
```

Run backend:

```bash
npm run dev
```

Server runs at:  
**http://localhost:4000**

---

### B. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Run frontend:

```bash
npm run dev
```

Open:  
**http://localhost:5173**

---

## 7. Trade-offs & Design Decisions

### If I Had More Time…
- **Redis Caching:** For rate limiting and session metadata at scale.
- **Authentication:** Tie sessions to users for cross-device persistence.
- **Structured Responses:** JSON / tool-based output for richer UI elements.

### Why React Instead of Svelte?
Although Svelte was suggested, React allowed faster delivery using a familiar ecosystem (Vite, Tailwind, Framer Motion), letting me focus on backend correctness and LLM robustness.

### Robustness vs Complexity
**DB-backed rate limiting**
- ✅ Works across restarts and instances
- ❌ Adds a DB write per request  

**Verdict:** Correct trade-off for assignment scope.

---

## 8. API Reference

### POST `/api/chat/message`

**Request**
```json
{
  "message": "Hi",
  "sessionId": "uuid-optional"
}
```

**Response**
```json
{
  "reply": "Hello! How can I help?",
  "sessionId": "uuid"
}
```

---

### GET `/api/chat/session/:sessionId`

**Response**
```json
{
  "sessionId": "uuid",
  "messages": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello!" }
  ]
}
```

---

## 9. Evaluation Checklist (Self-Review)

| Category        | Status | Notes |
|-----------------|--------|-------|
| Correctness     | ✅     | Chats work end-to-end, history persists |
| Code Quality    | ✅     | Typed, validated, clean separation |
| Architecture    | ✅     | Modular and extensible |
| Robustness      | ✅     | Handles bad input, errors, cold starts |
| Product Sense   | ✅     | Typing indicators, auto-scroll, clean UX |
