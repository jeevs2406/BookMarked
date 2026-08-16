CREATE TABLE "plan_book" (
	"id" serial PRIMARY KEY,
	"book_id" integer NOT NULL,
	"deadline" timestamp NOT NULL,
	"deadline_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" RENAME COLUMN "total_pages" TO "page_count";--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "status" text DEFAULT 'WANT_TO_READ' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_google_books_id_key" UNIQUE("google_books_id");--> statement-breakpoint
ALTER TABLE "plan_book" ADD CONSTRAINT "plan_book_book_id_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id");