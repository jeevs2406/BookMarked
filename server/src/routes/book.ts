import { FastifyInstance } from "fastify";
import { searchBooks } from "../services/bookSearch";
import { db } from "../db/db.connect"
import { books } from "../db/schema";

export async function bookRoutes(app: FastifyInstance) {
  app.get("/api/books/search", async (req, reply) => {
    const { q } = req.query as { q?: string };
    const results = await searchBooks(q ?? "");
    return results;
  });

  app.post("/api/books", async (req, reply) => {
    const body = req.body as {
      googleBooksId: string;
      title: string;
      author: string;
      genre: string | null;
      coverUrl: string | null;
      pageCount: number | null;
    };

    const [inserted] = await db
      .insert(books)
      .values({
        googleBooksId: body.googleBooksId,
        title: body.title,
        author: body.author,
        genre: body.genre,
        coverUrl: body.coverUrl,
        totalPages: body.pageCount,
      })
      .returning();

    return inserted;
  });
}
