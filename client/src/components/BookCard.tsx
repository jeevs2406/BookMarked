import type { BookSearchResult } from "../types";

export function BookCard({ book }: { book: BookSearchResult }) {
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
    </div>
  );
}
