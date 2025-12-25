import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import chatRoutes from "./routes/chat.routes";
import { Request, Response } from "express";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",                   // local Vite
      "https://spur-assist.vercel.app", // Vercel frontend
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(helmet());
app.use(express.json());

app.use("/api", chatRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
