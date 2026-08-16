CREATE TABLE "reading_sessions" (
	"id" serial PRIMARY KEY,
	"book_id" integer NOT NULL,
	"previous_page" integer NOT NULL,
	"new_page" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_book_id_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE;