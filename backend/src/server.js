import express from "express";
import cors from "cors";
import { connectToDatabase } from "./db/connect.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Unexpected server error." });
});

async function start() {
  await connectToDatabase();
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
