import { FastifyInstance } from "fastify";
import { searchBooks } from "../services/bookSearch";

export async function bookRoutes(app: FastifyInstance) {
  app.get("/api/books/search", async (req, reply) => {
    const { q } = req.query as { q?: string };
    const results = await searchBooks(q ?? "");
    return results;
  });
}
