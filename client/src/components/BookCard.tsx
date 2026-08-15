export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
}

export function BookCard({ book }: { book: Book }) {
  return (
    <div className="bg-bg-secondary rounded-lg p-3 shadow-md hover:bg-bg-elevated transition-colors">
      <img
        src={book.coverUrl}
        alt={`${book.title} cover`}
        className="w-full aspect-[2/3] object-cover rounded-md mb-3"
      />
      <h3 className="font-serif text-text-primary text-sm leading-snug">{book.title}</h3>
      <p className="font-sans text-text-secondary text-xs mt-1">{book.author}</p>
    </div>
  );
}