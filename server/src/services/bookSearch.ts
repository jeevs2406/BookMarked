import { BookSearchResult } from "../types";

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  console.log("Reaches service");

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  console.log(apiKey)

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20${apiKey ? `&key=${apiKey}` : ''}`;

  console.log("Before Google fetch");

  const res = await fetch(url);

  console.log("After Google fetch");

  const data = await res.json();

  console.log("After JSON");
  console.log(data)

  if (!data.items) return [];

  console.log(data)

  const polished_data = data.items.map((item: any) => ({
    googleBooksId: item.id,
    title: item.volumeInfo.title ?? 'Untitled',
    author: item.volumeInfo.authors?.join(', ') ?? 'Unknown author',
    genre: item.volumeInfo.categories?.[0] ?? null,
    coverUrl: item.volumeInfo.imageLinks?.thumbnail ?? null,
    pageCount: item.volumeInfo.pageCount ?? null,
  }));

  console.log(polished_data)

  return polished_data
}