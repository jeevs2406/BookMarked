import type { BookSearchResult, BookStatus } from "../../types/book";

interface BookCardProps {
  book: BookSearchResult;
  status: BookStatus | null | undefined;

  onStatusChange: (book: BookSearchResult, status: BookStatus | null) => void;

  showProgress?: boolean;
  pagesRead?: number;
  onLogProgress?: () => void;
}

export function BookCard({
  book,
  status,
  onStatusChange,
  showProgress = false,
  pagesRead = 0,
  onLogProgress,
}: BookCardProps) {
  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const newStatus = value === "" ? null : (value as BookStatus);

    onStatusChange(book, newStatus);
  }

  const progressPercentage =
    book.pageCount && book.pageCount > 0
      ? Math.min(Math.round((pagesRead / book.pageCount) * 100), 100)
      : 0;

  return (
    <div className="bg-bg-secondary rounded-lg p-3 shadow-md hover:bg-bg-elevated transition-colors">
      {/* Book cover */}
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={`${book.title} cover`}
          className="w-full aspect-[2/3] object-cover rounded-md mb-3"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-bg-elevated rounded-md mb-3 flex items-center justify-center text-text-secondary text-xs">
          No cover
        </div>
      )}

      {/* Book information */}
      <h3 className="font-serif text-text-primary text-sm leading-snug">
        {book.title}
      </h3>

      <p className="font-sans text-text-secondary text-xs mt-1">
        {book.author}
      </p>

      {/* Reading progress */}
      {showProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-text-secondary text-xs">
              Reading progress
            </span>

            <span className="text-text-primary text-xs font-medium">
              {progressPercentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-moss transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

          {/* Page count */}
          <p className="text-text-secondary text-xs mt-1">
            {pagesRead}
            {book.pageCount !== null && ` / ${book.pageCount} pages`}
          </p>

          {/* Log progress button */}
          {onLogProgress && (
            <button
              onClick={onLogProgress}
              className="mt-2 w-full bg-accent-moss text-bg-primary rounded-md px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Log Progress
            </button>
          )}
        </div>
      )}

      {/* Status dropdown */}
      <select
        value={status ?? ""}
        onChange={handleStatusChange}
        className="mt-3 w-full bg-bg-elevated text-text-primary rounded-md px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-accent-terracotta"
      >
        <option value="">Not in Library</option>

        <option value="WANT_TO_READ">Want to Read</option>

        <option value="READING">Currently Reading</option>

        <option value="COMPLETED">Completed</option>
      </select>
    </div>
  );
}
