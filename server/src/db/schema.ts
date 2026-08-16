import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  id: serial("id").primaryKey(),

  googleBooksId: text("google_books_id").notNull().unique(),

  title: text("title").notNull(),
  author: text("author").notNull(),
  genre: text("genre"),
  coverUrl: text("cover_url"),

  pageCount: integer("page_count"),
  pagesRead: integer("pages_read").notNull().default(0),

  status: text("status").notNull().default("WANT_TO_READ"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const readingSessions = pgTable("reading_sessions", {
  id: serial("id").primaryKey(),

  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, {
      onDelete: "cascade",
    }),

  previousPage: integer("previous_page").notNull(),

  newPage: integer("new_page").notNull(),

  durationMinutes: integer("duration_minutes").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const readingPlans = pgTable("plan_book", {
  id: serial("id").primaryKey(),

  bookId: integer("book_id")
    .notNull()
    .references(() => books.id),

  deadline: timestamp("deadline").notNull(),
  deadlineType: text("deadline_type").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});
