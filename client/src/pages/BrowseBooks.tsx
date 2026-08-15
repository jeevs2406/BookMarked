import { BookCard } from '../components/BookCard';
import type { Book } from '../components/BookCard'

const placeholderBooks: Book[] = [
  {
    id: "1",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    coverUrl: "..."
  },
  {
    id: "2",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverUrl: "..."
  }
];

export function BrowseBooks() {
  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <h1 className="font-serif text-text-primary text-2xl mb-6">Browse Books</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {placeholderBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}