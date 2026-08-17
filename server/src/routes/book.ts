import { FastifyInstance } from "fastify";
import { searchBooks } from "../services/bookSearch";
import {
  getLibraryBooks,
  addBookToLibrary,
  updateBookStatus,
  removeBookFromLibrary,
} from "../services/bookLibrary";
import { AddBookRequest, BookStatus } from "../types/book";

export async function bookRoutes(app: FastifyInstance) {
  // Search Google Books
  app.get("/api/books/search", async (req) => {
    const { q } = req.query as { q?: string };

    const results = await searchBooks(q ?? "");

    return results;
  });

  // Get all books in the user's library
  app.get("/api/books", async () => {
    return getLibraryBooks();
  });

  // Add a book to the user's library
  app.post("/api/books", async (req) => {
    const body = req.body as AddBookRequest;

    const book = await addBookToLibrary(body);

    return book;
  });

  // Change book status
  app.patch("/api/books/:id/status", async (req) => {
    const { id } = req.params as { id: string };

    const { status } = req.body as {
      status: BookStatus;
    };

    return updateBookStatus(Number(id), status);
  });

  // Remove book from library
  app.delete("/api/books/:id", async (req) => {
    const { id } = req.params as { id: string };

    await removeBookFromLibrary(Number(id));

    return { success: true };
  });
}
