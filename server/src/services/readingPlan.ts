import { db } from "../db/db.connect";
import { readingPlans, readingPlanBooks, books } from "../db/schema";
import { eq, asc, ne } from "drizzle-orm";
import type { BookStatus } from "../types/book";

import type {
  //   ReadingPlanBookRequest,
  CalculateReadingPlanRequest,
  CalculateReadingPlanResponse,
  SaveReadingPlanRequest,
  //   ReadingPlanResponse,
  ReadingPlanBookResponse,
  ReadingPlanStatus,
} from "../types/readingPlan";

/*
|--------------------------------------------------------------------------
| GET READING PLAN
|--------------------------------------------------------------------------
|
| Returns the currently saved reading plan.
|
*/

export async function getReadingPlan() {
  console.log("reaches reading plan");
  const plan = await db.select().from(readingPlans).limit(1);

  if (plan.length === 0) {
    console.log("returns null?");
    return null;
  }

  const planBooks = await db
    .select({
      id: readingPlanBooks.id,
      bookId: readingPlanBooks.bookId,
      readingOrder: readingPlanBooks.readingOrder,
      deadline: readingPlanBooks.deadline,
      estimatedFinishDate: readingPlanBooks.estimatedFinishDate,
      pagesRemaining: readingPlanBooks.pagesRemaining,

      title: books.title,
      author: books.author,
      genre: books.genre,
      coverUrl: books.coverUrl,
      pageCount: books.pageCount,
      pagesRead: books.pagesRead,
      status: books.status,
      googleBooksId: books.googleBooksId,
    })
    .from(readingPlanBooks)
    .innerJoin(books, eq(readingPlanBooks.bookId, books.id))
    .where(eq(readingPlanBooks.planId, plan[0].id))
    .orderBy(asc(readingPlanBooks.readingOrder));

  return {
    ...plan[0],
    books: planBooks,
  };
}

/*
|--------------------------------------------------------------------------
| SAVE / UPDATE READING PLAN
|--------------------------------------------------------------------------
|
| PUT /api/reading-plan
|
| This saves the plan.
|
| IMPORTANT:
| Calculation does NOT automatically save the plan.
| The user must explicitly click "Save Reading Plan".
|
*/

export async function saveReadingPlan(input: SaveReadingPlanRequest) {
  /*
   * Validate that there is at least one book (also checked in frontend)
   */

  if (input.books.length === 0) {
    throw new Error("Reading plan must contain at least one book.");
  }

  /*
   * Validate that every book has a deadline.
   */

  for (const book of input.books) {
    if (!book.deadline) {
      throw new Error(`Book ${book.bookId} must have a deadline.`);
    }
  }

  /*
   * Check whether a plan already exists.
   */

  const existingPlan = await db.select().from(readingPlans).limit(1);

  console.log("existing plan");
  console.log(existingPlan);

  let planId: number;

  const planFields = {
    orderMode: input.orderMode,
    targetMinPerDay: input.targetMinPerDay,
    requiredPagesPerDay: input.requiredPagesPerDay,
    totalPagesRemaining: input.totalPagesRemaining,
    totalReadingMinutes: input.totalReadingMinutes,
    totalpagesRead: input.pagesRead, // NOTE: schema field is "totalpagesRead" (no capital P), not "pagesRead"
    overallCompletionDate: input.overallCompletionDate,
    status: input.status,
  };

  console.log(planFields);

  /*
   * Create a plan if one doesn't exist.
   */

  if (existingPlan.length === 0) {
    const [newPlan] = await db
      .insert(readingPlans)
      .values(planFields)
      .returning();

    planId = newPlan.id;
  } else {
    /*
     * Update existing plan.
     */

    planId = existingPlan[0].id;

    await db
      .update(readingPlans)
      .set({
        ...planFields,
        updatedAt: new Date(),
      })
      .where(eq(readingPlans.id, planId));

    /*
     * Remove existing plan books.
     *
     * We recreate them from the current frontend state.
     */

    await db
      .delete(readingPlanBooks)
      .where(eq(readingPlanBooks.planId, planId));
  }

  /*
   * Insert the books into the plan.
   */

  await db.insert(readingPlanBooks).values(
    input.books.map((book) => ({
      planId,
      bookId: book.bookId,
      readingOrder: book.readingOrder,
      deadline: book.deadline,
      estimatedFinishDate: book.estimatedFinishDate,
      pagesRemaining: book.pagesRemaining,
    })),
  );

  /*
   * Return the newly saved plan.
   */

  return getReadingPlan();
}

/*
|--------------------------------------------------------------------------
| DELETE READING PLAN
|--------------------------------------------------------------------------
*/

export async function deleteReadingPlan() {
  const existingPlan = await db.select().from(readingPlans).limit(1);

  if (existingPlan.length === 0) {
    return {
      success: true,
    };
  }

  await db.delete(readingPlans).where(eq(readingPlans.id, existingPlan[0].id));

  return {
    success: true,
  };
}

/*
|--------------------------------------------------------------------------
| CALCULATE READING PLAN
|--------------------------------------------------------------------------
|
| BEHOLD! Long function below (with logic explaination)
|
| It takes the current plan from the frontend, calculates the
| results, and returns them. This does NOT save to database
|
*/

export async function calculateReadingPlan(
  input: CalculateReadingPlanRequest,
): Promise<CalculateReadingPlanResponse> {
  /*
   * Every book must have a deadline.
   */

  if (input.books.length === 0) {
    throw new Error("Reading plan must contain at least one book.");
  }

  for (const planBook of input.books) {
    if (!planBook.deadline) {
      throw new Error(`Book ${planBook.bookId} must have a deadline.`);
    }
  }

  if (!input.targetMinPerDay || input.targetMinPerDay <= 0) {
    throw new Error("targetMinPerDay must be a positive number.");
  }

  /*
   * Get the actual books from the database (since its all in the tbr,
   * its stored here).
   */

  const databaseBooks = await db.select().from(books);

  /*
   * Match the books in the plan with the database books.
   */

  const selectedBooks = input.books.map((planBook) => {
    const databaseBook = databaseBooks.find(
      (book) => book.id === planBook.bookId,
    );

    if (!databaseBook) {
      throw new Error(`Book ${planBook.bookId} was not found.`);
    }

    return {
      planBook,
      databaseBook,
    };
  });

  /*
   * Calculate pages remaining for each book.
   */

  const booksWithRemainingPages = selectedBooks.map(
    ({ planBook, databaseBook }) => {
      const pagesRead = databaseBook.pagesRead ?? 0;
      const pageCount = databaseBook.pageCount ?? 0;

      const pagesRemaining = Math.max(pageCount - pagesRead, 0);

      return {
        planBook,
        databaseBook,
        pagesRemaining,
      };
    },
  );

  /*
   * Get today's date. Declared here since both the required-pace
   * calculation below and the day-by-day scheduling further down
   * both need it — declared once, used in both places.
   */

  const today = new Date();
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  /*
   * The minimum sustained pace (pages/day) required to hit every
   * deadline, accounting for books competing for the SAME days.
   *
   * Sorting by deadline and walking through cumulatively (rather
   * than checking each book in isolation) is what correctly
   * catches cases like "10 books each individually finishable in
   * 2 days, all due in 5 days" — which is infeasible in aggregate
   * (20 reading-days of work, 5 calendar days available) even
   * though no single book looks urgent on its own. This is the
   * same cumulative-workload-vs-cumulative-capacity logic as EDF
   * feasibility checking, expressed as a required pace rather
   * than a pass/fail.
   */

  const sortedByDeadline = [...booksWithRemainingPages].sort(
    (a, b) =>
      new Date(a.planBook.deadline).getTime() -
      new Date(b.planBook.deadline).getTime(),
  );

  let cumulativePages = 0;
  let maxRequiredPace = 0;

  for (const { planBook, pagesRemaining } of sortedByDeadline) {
    cumulativePages += pagesRemaining;

    const deadline = new Date(planBook.deadline);
    const daysUntilDeadline = Math.max(
      1,
      Math.ceil((deadline.getTime() - today.getTime()) / millisecondsPerDay),
    );

    const paceRequiredByThisDeadline = cumulativePages / daysUntilDeadline;
    maxRequiredPace = Math.max(maxRequiredPace, paceRequiredByThisDeadline);
  }

  const requiredPagesPerDay = Math.ceil(maxRequiredPace);

  /*
   * Average reading speed.
   *
   * For now this is a placeholder.
   *
   * Later we can calculate the user's personal
   * pages-per-hour from reading_sessions.
   *
   * 42 pages/hour is only a temporary value.
   */

  const pagesPerHour = 42;
  const minutesPerPage = 60 / pagesPerHour;

  /*
   * Time required to finish each book, in minutes, at the
   * placeholder reading speed. This is the real per-book
   * workload the schedule has to fit — everything below is
   * built on this, not on total-pages-divided-by-days.
   */

  const booksWithTimeRequired = booksWithRemainingPages.map((book) => ({
    ...book,
    timeRequiredMinutes: Math.ceil(book.pagesRemaining * minutesPerPage),
  }));

  /*
   * Determine reading order.
   *
   * RECOMMENDED:
   * Earliest deadline first (EDF). This is not just a display
   * order — scheduling strictly in deadline order is what makes
   * the sequential simulation below a valid feasibility check.
   * If the earliest-deadline-first schedule can't hit every
   * deadline, no ordering can — this is the standard EDF
   * optimality result for single-resource deadline scheduling.
   *
   * CURRENT:
   * Preserve the order supplied by the user. This does NOT
   * prove feasibility either way — it just simulates what
   * happens if the user reads in this exact order. A CURRENT
   * plan can show BEHIND even when a RECOMMENDED (EDF) plan
   * for the same books would be feasible.
   */

  let orderedBooks;

  if (input.orderMode === "RECOMMENDED") {
    orderedBooks = [...booksWithTimeRequired].sort((a, b) => {
      const deadlineA = new Date(a.planBook.deadline).getTime();

      const deadlineB = new Date(b.planBook.deadline).getTime();

      return deadlineA - deadlineB;
    });
  } else {
    orderedBooks = [...booksWithTimeRequired].sort(
      (a, b) => a.planBook.readingOrder - b.planBook.readingOrder,
    );
  }

  /*
   * Overall pages remaining.
   */

  const totalPagesRemaining = orderedBooks.reduce(
    (total, book) => total + book.pagesRemaining,
    0,
  );

  /*
   * Overall pages already read.
   */

  const pagesRead = orderedBooks.reduce(
    (total, book) => total + (book.databaseBook.pagesRead ?? 0),
    0,
  );

  /*
   * Total reading time needed across every book.
   */

  const totalReadingMinutes = orderedBooks.reduce(
    (total, book) => total + book.timeRequiredMinutes,
    0,
  );

  /*
   * Sequentially schedule each book, in the order determined
   * above, using the user's real daily reading capacity
   * (targetMinPerDay) to figure out how many days each book
   * actually takes. Each book starts the day after the
   * previous one finishes.
   *
   * When orderMode is RECOMMENDED (deadline order), this
   * sequential walk is exactly the EDF feasibility check:
   * a book's estimatedFinishDate exceeding its own deadline
   * means the cumulative workload up to that deadline exceeds
   * the cumulative capacity available by then — the same
   * condition EDF checks directly, just expressed as dates.
   */

  let currentDate = new Date(today);

  const calculatedBooks: ReadingPlanBookResponse[] = [];

  for (let i = 0; i < orderedBooks.length; i++) {
    const book = orderedBooks[i];

    const alreadyFinished = book.pagesRemaining === 0;

    const daysRequired = alreadyFinished
      ? 0
      : Math.ceil(book.timeRequiredMinutes / input.targetMinPerDay);

    const finishDate = new Date(currentDate);

    finishDate.setDate(finishDate.getDate() + daysRequired);

    calculatedBooks.push({
      id: 0,
      bookId: book.databaseBook.id,

      readingOrder: i + 1,
      deadline: book.planBook.deadline,
      estimatedFinishDate: alreadyFinished
        ? null
        : finishDate.toISOString().split("T")[0],
      pagesRemaining: book.pagesRemaining,

      googleBooksId: book.databaseBook.googleBooksId,
      title: book.databaseBook.title,
      author: book.databaseBook.author,
      genre: book.databaseBook.genre,
      coverUrl: book.databaseBook.coverUrl,
      pageCount: book.databaseBook.pageCount,
      status: book.databaseBook.status as BookStatus,
      pagesRead: book.databaseBook.pagesRead,
    });

    /*
     * The next book starts the day after this one finishes.
     * Unfinished books that require 0 additional days still
     * don't push the next book's start date forward.
     */

    currentDate = finishDate;
  }

  /*
   * Overall completion date.
   */

  const overallCompletionDate = currentDate.toISOString().split("T")[0];

  /*
   * Determine whether the entire plan finishes within the
   * relevant deadlines. Comparing each book's estimated finish
   * date against its own deadline (rather than a single blended
   * pace) is what makes this an accurate, per-deadline check.
   */

  let status: ReadingPlanStatus = "ON_TRACK";

  if (totalPagesRemaining === 0) {
    status = "COMPLETED";
  } else {
    for (const book of calculatedBooks) {
      if (
        book.estimatedFinishDate != null &&
        book.estimatedFinishDate > book.deadline
      ) {
        status = "BEHIND";
        break;
      }
    }
  }

  return {
    orderMode: input.orderMode,
    targetMinPerDay: input.targetMinPerDay,

    books: calculatedBooks,

    requiredPagesPerDay,

    totalPagesRemaining,

    totalReadingMinutes,

    pagesRead,

    overallCompletionDate,

    status,
  };
}
