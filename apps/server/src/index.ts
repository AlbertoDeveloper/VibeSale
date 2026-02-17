import "dotenv/config";
import cors from "cors";
import express from "express";

import type { ApiMessageResponse } from "@vibesale/shared";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/message", (_req, res) => {
  const payload: ApiMessageResponse = {
    message: "Backend is running with TypeScript.",
    timestamp: new Date().toISOString()
  };

  res.json(payload);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
