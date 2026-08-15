import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  googleBooksId: text('google_books_id').notNull(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  genre: text('genre'),
  coverUrl: text('cover_url'),
  totalPages: integer('total_pages'),
  pagesRead: integer('pages_read').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});