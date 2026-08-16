import { db } from "../db/db.connect";
import { books } from "../db/schema";
import { readingSessions } from "../db/schema";
import { eq } from "drizzle-orm";

import type { CreateReadingSessionRequest } from "../../types/session";

export async function createReadingSession(
  bookId: number,
  data: CreateReadingSessionRequest,
) {
  return await db.transaction(async (tx) => {
    // Get the current state of the book
    const [book] = await tx.select().from(books).where(eq(books.id, bookId));

    if (!book) {
      throw new Error("Book not found");
    }

    const previousPage = book.pagesRead;

    // Validate the new page
    if (data.newPage < previousPage) {
      throw new Error("New page cannot be less than the current page");
    }

    if (data.newPage > (book.pageCount ?? Infinity)) {
      throw new Error("New page cannot exceed the total number of pages");
    }

    if (data.durationMinutes <= 0) {
      throw new Error("Reading duration must be greater than zero");
    }

    const pagesRead = data.newPage - previousPage;

    // Create the reading session
    const [session] = await tx
      .insert(readingSessions)
      .values({
        bookId,
        previousPage,
        newPage: data.newPage,
        durationMinutes: data.durationMinutes,
      })
      .returning();

    // Update the current page on the book
    const [updatedBook] = await tx
      .update(books)
      .set({
        pagesRead: data.newPage,
      })
      .where(eq(books.id, bookId))
      .returning();

    return {
      session,
      book: updatedBook,
      pagesRead,
    };
  });
}
