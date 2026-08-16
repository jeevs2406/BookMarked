import { useEffect, useState } from "react";

import { BookCard } from "../components/BookCard";
import { LogProgressModal } from "../components/LogProgressModal";

import type {
  BookSearchResult,
  LibraryBook,
  BookStatus,
} from "../../types/book";

export function Library() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);

  // Book currently being edited in the progress modal
  const [progressBook, setProgressBook] = useState<LibraryBook | null>(null);

  /*
   * Load library when page opens
   */
  useEffect(() => {
    async function loadLibrary() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books`);

        if (!res.ok) {
          throw new Error("Failed to fetch library");
        }

        const data: LibraryBook[] = await res.json();

        setBooks(data);
      } catch (error) {
        console.error("Failed to load library:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLibrary();
  }, []);

  /*
   * Change book status
   */
  async function handleStatusChange(
    book: BookSearchResult,
    newStatus: BookStatus | null,
  ) {
    try {
      const existingBook = books.find(
        (libraryBook) => libraryBook.googleBooksId === book.googleBooksId,
      );

      /*
       * "Not in Library"
       *
       * Remove the book.
       */
      if (newStatus === null) {
        if (!existingBook) {
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/books/${existingBook.id}`,
          {
            method: "DELETE",
          },
        );

        if (!res.ok) {
          throw new Error("Failed to remove book");
        }

        setBooks((previousBooks) =>
          previousBooks.filter(
            (libraryBook) => libraryBook.id !== existingBook.id,
          ),
        );

        return;
      }

      /*
       * Book isn't currently in library.
       *
       * Add it.
       */
      if (!existingBook) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            ...book,
            status: newStatus,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to add book");
        }

        const addedBook: LibraryBook = await res.json();

        setBooks((previousBooks) => [...previousBooks, addedBook]);

        return;
      }

      /*
       * Existing book.
       *
       * Update its status.
       */
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/${existingBook.id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update book status");
      }

      const updatedBook: LibraryBook = await res.json();

      setBooks((previousBooks) =>
        previousBooks.map((libraryBook) =>
          libraryBook.id === updatedBook.id ? updatedBook : libraryBook,
        ),
      );
    } catch (error) {
      console.error("Failed to change book status:", error);
    }
  }

  /*
   * Convert LibraryBook into BookSearchResult
   *
   * BookCard only needs the book information
   * that comes from Google Books.
   */
  function toSearchBook(book: LibraryBook): BookSearchResult {
    return {
      googleBooksId: book.googleBooksId,

      title: book.title,

      author: book.author,

      genre: book.genre,

      coverUrl: book.coverUrl,

      pageCount: book.pageCount,

      ratingsCount: 0, //unrelated to this card rendering, so does not matter
    };
  }

  /*
   * Called when Log Progress is clicked.
   */
  function handleOpenProgress(book: LibraryBook) {
    setProgressBook(book);
  }

  async function handleProgressSaved(newPage: number, durationMinutes: number) {
    if (!progressBook) {
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/${progressBook.id}/reading-sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPage,
            durationMinutes,
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData.error || "Failed to save reading progress");
      }

      const data = await res.json();

      setBooks((previousBooks) =>
        previousBooks.map((existingBook) =>
          existingBook.id === data.book.id ? data.book : existingBook,
        ),
      );

      setProgressBook(null);
    } catch (error) {
      console.error("Failed to save progress:", error);
      throw error;
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-text-secondary">Loading library...</p>
      </div>
    );
  }

  const currentlyReading = books.filter((book) => book.status === "READING");

  const wantToRead = books.filter((book) => book.status === "WANT_TO_READ");

  const completed = books.filter((book) => book.status === "COMPLETED");
  /*
   * Render one section
   */
  function renderSection(
    title: string,
    sectionBooks: LibraryBook[],
    showProgress = false,
  ) {
    return (
      <section className="mb-10">
        {/* Section heading */}
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="font-serif text-text-primary text-xl">{title}</h2>

          <span className="text-text-secondary text-sm">
            {sectionBooks.length}
          </span>
        </div>

        {/* Empty section */}
        {sectionBooks.length === 0 ? (
          <p className="text-text-secondary text-sm">No books here yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sectionBooks.map((libraryBook) => {
              const searchBook = toSearchBook(libraryBook);

              return (
                <BookCard
                  key={libraryBook.id}
                  book={searchBook}
                  status={libraryBook.status}
                  onStatusChange={handleStatusChange}
                  showProgress={showProgress}
                  pagesRead={libraryBook.pagesRead}
                  onLogProgress={
                    showProgress
                      ? () => handleOpenProgress(libraryBook)
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="p-8">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="font-serif text-text-primary text-2xl">My Library</h1>

        <p className="text-text-secondary mt-1">
          {books.length} {books.length === 1 ? "book" : "books"} in your library
        </p>
      </div>

      {/* Currently Reading */}
      {renderSection("Currently Reading", currentlyReading, true)}

      {/* Want to Read */}
      {renderSection("Want to Read", wantToRead)}

      {/* Completed */}
      {renderSection("Completed", completed)}

      {/* Progress modal */}
      {progressBook && (
        <LogProgressModal
          book={progressBook}
          onClose={() => setProgressBook(null)}
          onSaved={handleProgressSaved}
        />
      )}
    </div>
  );
}
