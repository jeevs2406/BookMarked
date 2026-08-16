CREATE TABLE "reading_plan_books" (
	"id" serial PRIMARY KEY,
	"plan_id" integer NOT NULL,
	"book_id" integer NOT NULL,
	"reading_order" integer NOT NULL,
	"deadline" date NOT NULL,
	"estimated_finish_date" date,
	"pages_remaining" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_plans" (
	"id" serial PRIMARY KEY,
	"order_mode" varchar(20) NOT NULL,
	"required_pages_per_day" integer,
	"total_pages_remaining" integer,
	"total_reading_minutes" integer,
	"total_pages_read" integer,
	"overall_completion_date" date,
	"status" varchar(20),
	"target_min_per_day" integer,
	"actual_min_per_day" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "plan_book";--> statement-breakpoint
ALTER TABLE "reading_plan_books" ADD CONSTRAINT "reading_plan_books_plan_id_reading_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "reading_plans"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reading_plan_books" ADD CONSTRAINT "reading_plan_books_book_id_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE;