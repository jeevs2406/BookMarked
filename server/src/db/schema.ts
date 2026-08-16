import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
  varchar,
} from "drizzle-orm/pg-core";

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

export const readingPlans = pgTable("reading_plans", {
  id: serial("id").primaryKey(),

  orderMode: varchar("order_mode", { length: 20 }).notNull(),

  // needs recalculation after logging
  requiredPagesPerDay: integer("required_pages_per_day"),

  // needs recalculation after logging
  totalPagesRemaining: integer("total_pages_remaining"),

  // needs recalculation after logging
  totalReadingMinutes: integer("total_reading_minutes"),

  // needs recalculation after logging
  totalpagesRead: integer("total_pages_read"),

  // needs recalculation after logging
  overallCompletionDate: date("overall_completion_date"),

  status: varchar("status", { length: 20 }),

  targetMinPerDay: integer("target_min_per_day"),

  actualMinPerDay: integer("actual_min_per_day"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const readingPlanBooks = pgTable("reading_plan_books", {
  id: serial("id").primaryKey(),

  planId: integer("plan_id")
    .notNull()
    .references(() => readingPlans.id, { onDelete: "cascade" }),

  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),

  readingOrder: integer("reading_order").notNull(),

  deadline: date("deadline").notNull(),

  // needs recalculation after logging
  estimatedFinishDate: date("estimated_finish_date"),

  // needs recalculation after logging
  pagesRemaining: integer("pages_remaining"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
