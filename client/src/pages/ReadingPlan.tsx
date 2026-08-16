import { useState, useEffect } from "react";

import type {
  ReadingPlanBookResponse,
  ReadingPlanStatus,
  ReadingPlanBookRequest,
} from "../../../types/readingPlan";

import { ReadingPlanBookCard } from "../components/ReadingPlanBookCard";
import { ReadingStats } from "../components/ReadingStats";
import { PlanControls } from "../components/PlanControls";
import { PlanSummary } from "../components/PlanSummary";
import { AddBooksModal } from "../components/AddBooksModal";

const API_BASE = import.meta.env.VITE_API_URL;
const GENERAL_PACE_PAGES_PER_HOUR = 60;
const ORDER_MODE = "RECOMMENDED" as const;

interface LibraryBook {
  id: number;
  googleBooksId: string;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  status: string;
  pagesRead: number;
}

export function ReadingPlan() {
  const [planBooks, setPlanBooks] = useState<ReadingPlanBookResponse[]>([]);
  const [planEntries, setPlanEntries] = useState<ReadingPlanBookRequest[]>([]);

  const [targetMinPerDay, setTargetMinPerDay] = useState(60);
  const [actualMinPerDay, setActualMinPerDay] = useState(0);

  const [hasCalculated, setHasCalculated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [calculatedResults, setCalculatedResults] = useState({
    totalPagesRemaining: 0,
    totalReadingMinutes: 0,
    requiredPagesPerDay: 0,
    status: "ON_TRACK" as ReadingPlanStatus,
  });

  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [showAddBooks, setShowAddBooks] = useState(false);

  const currentlyReading = planBooks.filter(
    (book) => book.status === "READING",
  );
  const plannedBooks = planBooks.filter(
    (book) => book.status === "WANT_TO_READ",
  );

  function invalidateCalculation() {
    setHasCalculated(false);
  }

  function estimateMinutesRemaining(book: ReadingPlanBookResponse): number {
    const pagesRemaining = Math.max((book.pageCount ?? 0) - book.pagesRead, 0);
    const pagesPerHour =
      actualMinPerDay > 0 ? actualMinPerDay : GENERAL_PACE_PAGES_PER_HOUR;
    return Math.ceil((pagesRemaining / pagesPerHour) * 60);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [planRes, libraryRes] = await Promise.all([
        fetch(`${API_BASE}/api/reading-plan`),
        fetch(`${API_BASE}/api/books`),
      ]);

      const planData = await planRes.json();
      const libraryData = await libraryRes.json();

      if (cancelled) return;

      if (planData) {
        setActualMinPerDay(planData.actualMinPerDay ?? 0);
        setPlanBooks(planData.books);
        setPlanEntries(
          planData.books.map((b: ReadingPlanBookResponse) => ({
            bookId: b.bookId,
            readingOrder: b.readingOrder,
            deadline: b.deadline,
          })),
        );
        setHasCalculated(true);
      }

      setLibraryBooks(libraryData);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCalculate() {
    if (planEntries.length === 0) return;

    const res = await fetch(`${API_BASE}/api/reading-plan/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderMode: ORDER_MODE,
        targetMinPerDay,
        books: planEntries,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Calculation failed:", err);
      return;
    }

    const data = await res.json();

    setPlanBooks(data.books);
    setCalculatedResults({
      totalPagesRemaining: data.totalPagesRemaining,
      totalReadingMinutes: data.totalReadingMinutes,
      requiredPagesPerDay: data.requiredPagesPerDay,
      status: data.status,
    });
    setHasCalculated(true);
  }

  async function handleSavePlan() {
    if (!hasCalculated) return;

    await fetch(`${API_BASE}/api/reading-plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderMode: ORDER_MODE,
        targetMinPerDay,
        requiredPagesPerDay: calculatedResults.requiredPagesPerDay,
        totalPagesRemaining: calculatedResults.totalPagesRemaining,
        totalReadingMinutes: calculatedResults.totalReadingMinutes,
        pagesRead: planBooks.reduce((total, b) => total + b.pagesRead, 0),
        overallCompletionDate: planBooks.at(-1)?.estimatedFinishDate ?? "",
        status: calculatedResults.status,
        books: planBooks,
      }),
    });
  }

  function handleDeadlineChange(bookId: number, deadline: string) {
    setPlanEntries((entries) =>
      entries.map((entry) =>
        entry.bookId === bookId ? { ...entry, deadline } : entry,
      ),
    );
    setPlanBooks((books) =>
      books.map((book) =>
        book.bookId === bookId ? { ...book, deadline } : book,
      ),
    );
    invalidateCalculation();
  }

  function handleAddBook(bookId: number) {
    const book = libraryBooks.find((b) => b.id === bookId);
    if (!book || planEntries.some((e) => e.bookId === book.id)) return;

    const currentYear = new Date().getFullYear();
    const defaultDeadline = new Date(currentYear, 11, 31);
    const deadlineStr = defaultDeadline.toISOString().split("T")[0];

    setPlanEntries((entries) => [
      ...entries,
      {
        bookId: book.id,
        readingOrder: entries.length + 1,
        deadline: deadlineStr,
      },
    ]);

    setPlanBooks((books) => [
      ...books,
      {
        bookId: book.id,
        readingOrder: books.length + 1,
        deadline: deadlineStr,
        estimatedFinishDate: null,
        pagesRemaining: Math.max((book.pageCount ?? 0) - book.pagesRead, 0),
        googleBooksId: book.googleBooksId,
        title: book.title,
        author: book.author,
        genre: book.genre,
        coverUrl: book.coverUrl,
        pageCount: book.pageCount,
        status: book.status as ReadingPlanBookResponse["status"],
        pagesRead: book.pagesRead,
      },
    ]);

    invalidateCalculation();
  }

  if (loading) {
    return (
      <div className="p-8 text-text-secondary">
        Loading your reading plan...
      </div>
    );
  }

  const booksNotInPlan = libraryBooks.filter(
    (b) => !planEntries.some((e) => e.bookId === b.id),
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <ReadingStats
        overallAverage={GENERAL_PACE_PAGES_PER_HOUR}
        personalAverage={actualMinPerDay}
      />

      <section>
        <h1 className="font-serif text-text-primary text-4xl">Your Plan</h1>

        <div className="flex items-center gap-3 mt-4 mb-8">
          <label className="text-text-secondary text-sm">
            Target reading time per day (minutes)
          </label>
          <input
            type="number"
            min={1}
            value={targetMinPerDay}
            onChange={(e) => {
              setTargetMinPerDay(Number(e.target.value));
              invalidateCalculation();
            }}
            className="bg-bg-secondary text-text-primary rounded-md px-3 py-1 w-24 outline-none focus:ring-2 focus:ring-accent-terracotta"
          />

          <button
            type="button"
            onClick={() => setShowAddBooks(true)}
            className="ml-auto px-4 py-2 rounded-md border border-text-secondary/30 text-text-primary text-sm hover:bg-bg-elevated"
          >
            + Add books to plan
          </button>
        </div>

        <section className="mb-10">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="font-serif text-text-primary text-xl">
              Currently Reading
            </h2>
            <span className="text-text-secondary text-sm">
              {currentlyReading.length}
            </span>
          </div>

          {currentlyReading.length === 0 ? (
            <p className="text-text-secondary text-sm">
              You are not currently reading any books.
            </p>
          ) : (
            <div className="space-y-4">
              {currentlyReading.map((book) => (
                <ReadingPlanBookCard
                  key={book.bookId}
                  book={book}
                  estimatedMinutes={estimateMinutesRemaining(book)}
                  onDeadlineChange={handleDeadlineChange}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="font-serif text-text-primary text-xl">Up Next</h2>
            <span className="text-text-secondary text-sm">
              {plannedBooks.length}
            </span>
          </div>

          <p className="text-text-secondary text-sm mb-5">
            Books are shown in recommended reading order. Calculate your plan to
            generate finish estimates.
          </p>

          {plannedBooks.length === 0 ? (
            <p className="text-text-secondary text-sm">
              No books have been added to your reading plan yet.
            </p>
          ) : (
            <div className="space-y-4">
              {plannedBooks.map((book, index) => (
                <ReadingPlanBookCard
                  key={book.bookId}
                  book={book}
                  order={index + 1}
                  estimatedMinutes={estimateMinutesRemaining(book)}
                  onDeadlineChange={handleDeadlineChange}
                />
              ))}
            </div>
          )}
        </section>

        <PlanControls
          onCalculate={handleCalculate}
          onSave={handleSavePlan}
          hasCalculated={hasCalculated}
        />
      </section>

      {hasCalculated && (
        <PlanSummary
          totalPagesRemaining={calculatedResults.totalPagesRemaining}
          totalHours={Number(
            (calculatedResults.totalReadingMinutes / 60).toFixed(1),
          )}
          requiredPagesPerDay={calculatedResults.requiredPagesPerDay}
          status={
            calculatedResults.status === "COMPLETED"
              ? "ON_TRACK"
              : calculatedResults.status
          }
        />
      )}

      {showAddBooks && (
        <AddBooksModal
          books={booksNotInPlan}
          onAdd={handleAddBook}
          onClose={() => setShowAddBooks(false)}
        />
      )}
    </div>
  );
}
