import { useState, useEffect } from 'react';
import { BookCard } from '../components/BookCard';
import type {
  BookSearchResult,
  LibraryBook,
  BookStatus,
} from '../../../types/book';

export function BrowseBooks() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLibrary();
    runSearch('');
  }, []);

  // Load all books currently in the user's library
  async function loadLibrary() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books`
      );

      if (!res.ok) {
        throw new Error('Failed to fetch library');
      }

      const books: LibraryBook[] = await res.json();

      setLibraryBooks(books);
    } catch (error) {
      console.error('Failed to load library:', error);
    }
  }

  // Search Google Books through our backend
  async function runSearch(searchQuery: string) {
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!res.ok) {
        throw new Error('Failed to search books');
      }

      const data: BookSearchResult[] = await res.json();

      setResults(data);
    } catch (error) {
      console.error('Failed to search books:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  async function handleStatusChange(
    book: BookSearchResult,
    newStatus: BookStatus | null
  ) {
    try {

      // "Not in Library" → remove the book
      if (newStatus === null) {
        const existingBook = libraryBooks.find(
          (libraryBook) =>
            libraryBook.googleBooksId === book.googleBooksId
        );

        if (!existingBook) {
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/books/${existingBook.id}`,
          {
            method: 'DELETE',
          }
        );

        if (!res.ok) {
          throw new Error('Failed to remove book');
        }

        setLibraryBooks((previousBooks) =>
          previousBooks.filter(
            (libraryBook) => libraryBook.id !== existingBook.id
          )
        );

        return;
      }

      // Check whether the book is already in the library
      const existingBook = libraryBooks.find(
        (libraryBook) =>
          libraryBook.googleBooksId === book.googleBooksId
      );

      // Book isn't in library → add it
      if (!existingBook) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/books`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...book,
              status: newStatus,
            }),
          }
        );

        if (!res.ok) {
          throw new Error('Failed to add book');
        }

        const addedBook: LibraryBook = await res.json();

        setLibraryBooks((previousBooks) => [
          ...previousBooks,
          addedBook,
        ]);

        return;
      }

      // Book is already in library → change its status
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/${existingBook.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update book status');
      }

      const updatedBook: LibraryBook = await res.json();

      setLibraryBooks((previousBooks) =>
        previousBooks.map((libraryBook) =>
          libraryBook.id === updatedBook.id
            ? updatedBook
            : libraryBook
        )
      );

    } catch (error) {
      console.error('Failed to change book status:', error);
    }
  }

  return (
    <div className="p-8">

      <h1 className="font-serif text-text-primary text-2xl mb-6">
        Browse Books
      </h1>

      <form
        onSubmit={handleSearch}
        className="mb-6 flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book..."
          className="bg-bg-secondary text-text-primary placeholder-text-secondary rounded-md px-4 py-2 flex-1 outline-none focus:ring-2 focus:ring-accent-terracotta"
        />

        <button
          type="submit"
          className="bg-accent-terracotta text-bg-primary font-sans px-4 py-2 rounded-md"
        >
          Search
        </button>
      </form>

      {loading && (
        <p className="text-text-secondary mb-4">
          Searching...
        </p>
      )}

      {!loading && results.length === 0 && (
        <p className="text-text-secondary">
          No books found.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

        {results.map((book) => {

          const libraryBook = libraryBooks.find(
            (libraryBook) =>
              libraryBook.googleBooksId === book.googleBooksId
          );

          return (
            <BookCard
              key={book.googleBooksId}
              book={book}
              status={libraryBook?.status}
              onStatusChange={handleStatusChange}
            />
          );
        })}

      </div>

    </div>
  );
}