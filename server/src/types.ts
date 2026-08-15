export interface Book {
  id: number;
  title: string;
  timeRequiredMinutes: number;
  hardDeadline: Date;
  weight: number;
  genre: string;
}


export interface BookSearchResult {
  googleBooksId: string;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  ratingsCount: number| null
}
