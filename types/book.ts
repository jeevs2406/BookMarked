export type BookStatus = "WANT_TO_READ" | "READING" | "COMPLETED";

export interface BookSearchResult {
  googleBooksId: string;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  ratingsCount: number | null;
}

export interface AddBookRequest extends BookSearchResult {
  status: BookStatus;
}

export interface LibraryBook extends BookSearchResult {
  id: number;
  pagesRead: number;
  status: BookStatus;
}
