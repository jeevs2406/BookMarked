export interface BookSearchResult {
  googleBooksId: string;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
  pageCount: number | null;
}
