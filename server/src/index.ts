import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { bookRoutes } from "./routes/book";
import { sessionRoutes } from "./routes/readingSession";
import { readingPlanRoutes } from "./routes/readingPlan";
import { testDatabaseConnection } from "./db/db.connect";

const app = Fastify({ logger: false });

const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

async function start() {
  try {
    await app.register(cors, {
      origin: FRONTEND_URL,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    });

    app.register(bookRoutes);
    app.register(sessionRoutes);
    app.register(readingPlanRoutes);

    await testDatabaseConnection();

    await app.listen({ port: PORT, host: HOST });

    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();
