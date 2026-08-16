import type { BookSearchResult } from "../../types/book";

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  console.log("This is called");

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  const q = query.trim() || "subject:fiction";

  const url =
    `https://www.googleapis.com/books/v1/volumes` +
    `?q=${encodeURIComponent(q)}` +
    `&printType=books` +
    `&orderBy=relevance` +
    `&maxResults=20` +
    `${apiKey ? `&key=${apiKey}` : ""}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items) {
    return [];
  }

  return data.items
    .filter((item: any) => item.volumeInfo.imageLinks?.thumbnail)
    .map((item: any) => ({
      googleBooksId: item.id,
      title: item.volumeInfo.title ?? "Untitled",
      author: item.volumeInfo.authors?.join(", ") ?? "Unknown author",
      genre: item.volumeInfo.categories?.[0] ?? null,
      coverUrl: item.volumeInfo.imageLinks?.thumbnail ?? null,
      pageCount: item.volumeInfo.pageCount ?? null,
      ratingsCount: item.volumeInfo.ratingsCount ?? 0,
    }))
    .sort((a: any, b: any) => b.ratingsCount - a.ratingsCount);
}
