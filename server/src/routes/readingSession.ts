import { FastifyInstance } from "fastify";
import {
  createReadingSession,
  getReadingSessions,
} from "../services/readingSession";
import type { CreateReadingSessionRequest } from "../../types/session";

export async function sessionRoutes(app: FastifyInstance) {
  app.get("/api/books/reading-sessions", async () => {
    return getReadingSessions();
  });

  // Create a reading session and update the book's pagesRead
  app.post("/api/books/:id/reading-sessions", async (req, reply) => {
    const { id } = req.params as {
      id: string;
    };

    const body = req.body as CreateReadingSessionRequest;

    try {
      const result = await createReadingSession(Number(id), body);

      return result;
    } catch (error) {
      console.error("Failed to create reading session:", error);

      return reply.status(400).send({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create reading session",
      });
    }
  });
}
