import type { ReadingPlanBookResponse } from "../types/readingPlan";

interface ReadingPlanBookCardProps {
  book: ReadingPlanBookResponse;
  estimatedMinutes: number;
  order?: number;
  onDeadlineChange: (bookId: number, deadline: string) => void;
}

export function ReadingPlanBookCard({
  book,
  order,
  estimatedMinutes,
  onDeadlineChange,
}: ReadingPlanBookCardProps) {
  const pagesRemaining =
    book.pageCount !== null ? book.pageCount - book.pagesRead : null;

  const progress =
    book.pageCount && book.pageCount > 0
      ? Math.min(100, Math.round((book.pagesRead / book.pageCount) * 100))
      : 0;

  return (
    <div className="bg-bg-secondary rounded-lg p-5">
      <div className="flex gap-5">
        <div className="w-20 h-28 flex-shrink-0 bg-bg-elevated rounded-md overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">
              No cover
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div>
            {order && (
              <p className="text-text-secondary text-xs mb-1">
                #{order} in reading order
              </p>
            )}

            <h3 className="font-serif text-text-primary text-lg">
              {book.title}
            </h3>
            <p className="text-text-secondary text-sm mt-1">{book.author}</p>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-text-secondary">
                {book.pagesRead} / {book.pageCount ?? "?"} pages
              </span>
              <span className="text-text-secondary">{progress}%</span>
            </div>
            <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-terracotta"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-text-secondary text-xs">Remaining</p>
              <p className="text-text-primary text-sm mt-1">
                {pagesRemaining !== null
                  ? `${pagesRemaining} pages`
                  : "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-text-secondary text-xs">
                Estimated reading time
              </p>
              <p className="text-text-primary text-sm mt-1">
                {formatMinutes(estimatedMinutes)}
              </p>
            </div>

            {book.estimatedFinishDate && (
              <div>
                <p className="text-text-secondary text-xs">Estimated finish</p>
                <p className="text-text-primary text-sm mt-1">
                  {formatDate(book.estimatedFinishDate)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-text-secondary/10">
            <label className="block text-text-secondary text-xs mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={book.deadline ?? ""}
              onChange={(e) => onDeadlineChange(book.bookId, e.target.value)}
              className="bg-bg-elevated text-text-primary rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-terracotta"
            />
            {!book.deadline && (
              <p className="text-yellow-400 text-xs mt-2">
                Add a deadline before calculating your plan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}
