import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import chatRoutes from "./routes/chat.routes";
import { Request, Response } from "express";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
