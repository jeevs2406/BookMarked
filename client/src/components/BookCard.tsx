import type { BookSearchResult, BookStatus } from "../../../types/book";

interface BookCardProps {
  book: BookSearchResult;
  status: BookStatus | null | undefined;
  onStatusChange: (book: BookSearchResult, status: BookStatus | null) => void;
}

export function BookCard({ book, status, onStatusChange }: BookCardProps) {
  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const newStatus = value === "" ? null : (value as BookStatus);

    onStatusChange(book, newStatus);
  }

  return (
    <div className="bg-bg-secondary rounded-lg p-3 shadow-md hover:bg-bg-elevated transition-colors">
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

      <h3 className="font-serif text-text-primary text-sm leading-snug">
        {book.title}
      </h3>

      <p className="font-sans text-text-secondary text-xs mt-1">
        {book.author}
      </p>

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
