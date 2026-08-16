CREATE TABLE "books" (
	"id" serial PRIMARY KEY,
	"google_books_id" text NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"genre" text,
	"cover_url" text,
	"total_pages" integer,
	"pages_read" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
