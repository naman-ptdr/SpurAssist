# SpurAssist — AI Customer Support Chatbot
![Author](https://img.shields.io/badge/Author-Naman%20Patidar-brightgreen)
[![Live-Demo](https://img.shields.io/badge/Spur%20Assist-Live-blue)](https://spur-assist.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Profile-blue)](https://github.com/naman-ptdr)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect%20with%20Me-informational)](https://www.linkedin.com/in/naman-patidar/)

---

SpurAssist is a full-stack, domain-restricted AI customer support chatbot built for a sample e-commerce store called SpurStore. It demonstrates session-based chat persistence, LLM integration (Google Gemini), typed database access with Prisma, and a production-minded Express + TypeScript backend with a small React + Vite frontend.

This README is written for a technical evaluation and documents the repository as implemented (frontend + backend).

---

## Contents

- Project Overview
- Features
- Screenshots
- Tech Stack
- Architecture (diagram + explanation)
- AI Design & Prompting
- Database Design (Prisma models)
- API Reference
- Setup & Run (frontend / backend)
- Environment Variables (.env sample)
- Rate Limiting & Security
- Deployment Notes
- Folder Structure
- Future Improvements
- Author

---

## Project Overview

What it is
- SpurAssist is an AI chat assistant for customer support focused on shipping, returns, refunds, and order-related questions for a fictional store — SpurStore.

Problem it solves
- Provides a conversational, history-aware interface for customers to get actionable help while preventing out-of-domain behavior from the LLM.

Why it was built
- A production-minded reference showing LLM integration, typed DB access, session handling, and clean separation of concerns for an assignment or prototype.

---

## Features (implemented)

- Session-based chat persistence (PostgreSQL via Prisma)
- Google Gemini LLM integration (`gemini-2.5-flash`) via `@google/genai`
- Strict domain restriction enforced by system instructions (bot declines out-of-domain requests)
- Session-based rate limiting (per-session minimum interval)
- Conversation history sent to the LLM on each request (bounded history)
- Typed DB access with Prisma models: `Session`, `Message`, `Role` enum
- Express + TypeScript backend with CORS and security middleware (`helmet`)
- Minimal React + Vite frontend that stores `sessionId` in `localStorage` and communicates with backend
- Input validation with `zod`
- Graceful fallback messages for LLM errors, auth issues, and rate-limit violations

Each feature above maps directly to code in `backend/` and `frontend/`.

---

## Screenshots

Add UI screenshots to `./assets/` and update these references after adding files:

- ![Chat UI](./assets/chat-ui.png)
- ![Mobile View](./assets/chat-mobile.png)

Notes:
- Place images in an `assets/` folder at the repository root.

---

## Tech Stack (detailed)

Frontend
- React 19 (`react`, `react-dom`)
- Vite (`vite`, `@vitejs/plugin-react`)
- JavaScript (JSX), plain CSS
- Scripts: `npm run dev`, `npm run build`

Backend
- Node.js + TypeScript
- Express 5 (`express`)
- CORS (`cors`)
- Helmet (`helmet`) for security headers
- dotenv (`dotenv`) for env loading
- Validation: `zod`
- Google Gemini client: `@google/genai`
- Scripts: `npm run dev` (ts-node-dev), `npm run build` (`prisma generate && tsc`)

Database
- PostgreSQL (`pg`)
- Prisma (`prisma`, `@prisma/client`) with `@prisma/adapter-pg` and a `pg` Pool

Tooling & DevOps
- TypeScript, ts-node, ts-node-dev
- ESLint (frontend devDependencies)

Exact backend dependencies (from `backend/package.json`): `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `@google/genai`, `cors`, `dotenv`, `express`, `helmet`, `pg`, `zod`.

Exact frontend dependencies (from `frontend/package.json`): `react`, `react-dom`, `vite`, `@vitejs/plugin-react`.

---

## Architecture

High-level flow:

Frontend (React) → Backend (Express API) → Chat Service → LLM Service (Google Gemini) → PostgreSQL (Prisma)

Mermaid diagram:

```mermaid
flowchart LR
    subgraph FE [Frontend (Vite + React)]
        A[User UI] -->|POST /api/chat/message| B[Backend API]
    end

    subgraph BE [Backend (Express + TS)]
        B --> C[Chat Controller]
        C --> D[Chat Service]
        D --> E[Prisma (Session / Message)]
        D --> F[LLM Service (Google Gemini)]
        F --> D
        E -->|history| F
    end

    subgraph DB [PostgreSQL]
        EDB[(Sessions & Messages)]
    end

    E --> EDB
```

Explanation
- Frontend stores `sessionId` in `localStorage`. On each message it sends the message + optional `sessionId` to POST `/api/chat/message`.
- Backend controller (`backend/src/controllers/chat.controller.ts`) validates input and calls `handleChat` in `backend/src/services/chat.service.ts`.
- `chat.service` ensures a session exists, enforces per-session rate limiting, persists the user message, fetches a bounded recent history (`MAX_HISTORY = 10`), calls the LLM service, persists the assistant reply, and returns `{ reply, sessionId }`.

---

## AI Design & Prompting

Gemini usage
- The project uses `@google/genai` to call `models.generateContent` with model `gemini-2.5-flash` from `backend/src/services/llm.service.ts`.

System instructions
- A multi-paragraph `SYSTEM_INSTRUCTIONS` string is prepended to the conversation. It defines role, tone, store policies, actionable return instructions, and strict domain rules (including the exact out-of-domain rejection sentence).

Domain restriction strategy
- The system instructions include a strict single-sentence rejection for out-of-domain queries:
    - “I’m sorry, I can only assist with SpurStore products, orders, shipping, and support.”
- Conversation history and system instructions are sent on every LLM call to ensure consistent behavior.

Why not keyword-based logic
- Keyword filters are brittle and easy to circumvent. The prompt-first strategy keeps policy centralized and lets the LLM use context and reasoning to comply. The backend still enforces deterministic controls (validation, rate limiting, bounded history).

Error handling
- `llm.service` maps common LLM/client errors (429, 401/403, 404) to friendly fallback messages and logs details for operators.

---

## Database Design (Prisma)

Schema highlights (`backend/prisma/schema.prisma`):

- `Role` enum: `user`, `assistant`

- `Session` model:
    - `id` String @id @default(uuid())
    - `createdAt` DateTime @default(now())
    - `lastMessageAt` DateTime? (used for per-session rate limiting)
    - `messages` relation to `Message[]`

- `Message` model:
    - `id` String @id @default(uuid())
    - `content` String
    - `role` Role
    - `createdAt` DateTime @default(now())
    - `sessionId` FK to `Session`

Relationships
- One `Session` has many `Message`s. Each `Message` belongs to a single `Session`.

Design rationale
- Sessions are first-class to persist conversation state, implement DB-backed rate limiting via `lastMessageAt`, and allow retrieval of messages for a session.

---

## API Reference

Base path: `/api`

1) `POST /api/chat/message`
- Purpose: Send a user message, persist it, call LLM, persist assistant reply, and return reply + sessionId.
- Request
    - Content-Type: `application/json`
    - Body JSON:
        - `message` (string, required, 1..500 chars)
        - `sessionId` (string, optional, UUID)
    - Validation: `zod` schema in `backend/src/utils/validate.ts`
- Success Response (200):
    - `{ reply: string, sessionId: string }`
- Error cases:
    - 400 — Invalid request payload
    - Rate-limit: a friendly reply text is returned such as `Please wait a moment before sending another message.` (handled in service and returned as the `reply` field)
    - 500 — Internal errors: controller returns a friendly fallback reply and status 500

2) `GET /api/chat/session/:sessionId`
- Purpose: Fetch chat messages for a session.
- Request: path param `sessionId` (UUID)
- Success Response (200):
    - `{ sessionId: string, messages: [{ role, content, createdAt }] }`
- Error cases:
    - 400 — invalid `sessionId` (UUID validation)
    - 404 — session not found
    - 500 — server error

Notes
- POST always returns a `sessionId` (new or existing) so the frontend can persist it in `localStorage`.

---

## Setup Instructions (very detailed)

Prerequisites
- Node.js 18+ recommended
- npm (or pnpm/yarn)
- PostgreSQL instance accessible via connection URL

Backend (development)

1. From repo root:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` in `backend/` (see sample below) and set `DATABASE_URL` and `GEMINI_API_KEY`.

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Sync schema to the DB (development):
```bash
npx prisma db push
```

6. (Optional) Use migrations for managed schema changes:
```bash
npx prisma migrate dev --name init
```

7. Run dev server:
```bash
npm run dev
```

Production build & run
```bash
npm run build
npm start
```

Frontend (development)

1. From repo root:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Provide `VITE_API_BASE_URL` in `frontend/.env` or via your hosting platform.

4. Run dev server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

---

## Environment Variables (sample `.env`)

Backend (`backend/.env`)
```
DATABASE_URL=postgresql://dbuser:dbpassword@localhost:5432/spurassist
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000
```

Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:4000/api
```

Keep secrets out of source control and use your platform's secret manager in production.

---

## Rate Limiting & Security

Session-based rate limiting
- Implemented in `backend/src/services/chat.service.ts` via `MIN_INTERVAL_MS = 3000` (3 seconds). Before accepting a message the service compares `session.lastMessageAt` to the current time and returns a friendly reply if messages are sent too frequently.

Why DB-backed session limits
- In-memory/global variables are not safe for horizontally scaled deployments. Storing `lastMessageAt` on the `Session` record is consistent across instances and survives restarts.

Validation & hardening
- Input validation: `zod` (`backend/src/utils/validate.ts`).
- CORS: configured in `backend/src/index.ts` with explicit allowed origins—update to match your deployment domains.
- Security headers: `helmet` is enabled.

Error handling
- Controllers and services are wrapped with try/catch and map errors to non-sensitive fallback messages.

---

## Deployment

Frontend
- Build static assets with `npm run build` and deploy to Vercel.
- Expose `VITE_API_BASE_URL` as an environment variable in the hosting platform.

Backend
- Build (`npm run build`) and deploy Node server to Render.
- Provide `DATABASE_URL` and `GEMINI_API_KEY` as environment variables in the platform.
- Update CORS `origin` list to include deployed frontend host.

Secrets & TLS
- Use platform secret management for `GEMINI_API_KEY` and `DATABASE_URL`.
- Ensure TLS termination is configured for production API endpoints.

---

## Folder Structure

Root
- README.md
- backend/
    - package.json
    - tsconfig.json
    - prisma/
        - schema.prisma
    - src/
        - index.ts
        - controllers/
            - chat.controller.ts
        - services/
            - chat.service.ts
            - llm.service.ts
        - routes/
            - chat.routes.ts
        - prisma/
            - client.ts
        - utils/
            - validate.ts
- frontend/
    - package.json
    - index.html
    - vite.config.js
    - src/
        - main.jsx
        - App.jsx
        - index.css

---

## Future Improvements

- Authentication & user accounts (tie sessions to users and enable order-specific lookups)
- Conversation summarization to reduce LLM token usage while preserving context
- Pagination and archive endpoints for very long histories
- Structured assistant responses (links, action buttons) for richer UX
- Observability: metrics, tracing, error reporting (Sentry/Datadog)
- CI: automated linting, type checks, tests, and migration checks

---

## Author

- Naman Patidar — Full-Stack Developer

---
