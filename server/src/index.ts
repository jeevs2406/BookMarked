import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { bookRoutes } from "./routes/book";
import { sessionRoutes } from "./routes/session";
import { readingPlanRoutes } from "./routes/readingPlan";
import { testDatabaseConnection } from "./db/db.connect";

const app = Fastify({ logger: false });

async function start() {
  try {
    await app.register(cors, {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    });

    app.register(bookRoutes);
    app.register(sessionRoutes);
    app.register(readingPlanRoutes);

    await testDatabaseConnection();

    await app.listen({ port: 3001 });

    console.log("Server running on port 3001");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();
