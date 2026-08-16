import { db } from "../db/db.connect";
import { eq } from "drizzle-orm";
import { books } from "../db/schema";
import type { BookStatus, AddBookRequest } from "../../types/book";

export async function getLibraryBooks() {
  console.log("library getter");
  return await db.select().from(books);
}

export async function addBookToLibrary(book: AddBookRequest) {
  const [inserted] = await db
    .insert(books)
    .values({
      googleBooksId: book.googleBooksId,
      title: book.title,
      author: book.author,
      genre: book.genre,
      coverUrl: book.coverUrl,
      pageCount: book.pageCount,
      status: book.status,
    })
    .returning();

  return inserted;
}

export async function updateBookStatus(bookId: number, status: BookStatus) {
  const [updated] = await db
    .update(books)
    .set({ status })
    .where(eq(books.id, bookId))
    .returning();

  return updated;
}

export async function removeBookFromLibrary(bookId: number) {
  await db.delete(books).where(eq(books.id, bookId));
}
