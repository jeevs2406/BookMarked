import { useState, useEffect } from 'react';
import { BookCard } from '../components/BookCard';
import type { BookSearchResult } from '../types'

export function BrowseBooks() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Run once on mount, with an empty query — triggers the default view
  useEffect(() => {
    runSearch('');
  }, []);

  async function runSearch(searchQuery: string) {
    setLoading(true);
    const res = await fetch(`http://localhost:3001/api/books/search?q=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  return (
    <div className="p-8">
      <h1 className="font-serif text-text-primary text-2xl mb-6">Browse Books</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
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

      {loading && <p className="text-text-secondary">Searching...</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((book) => (
          <BookCard key={book.googleBooksId} book={book} />
        ))}
      </div>
    </div>
  );
}