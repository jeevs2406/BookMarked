import type { BookStatus } from "./book";

export type ReadingPlanOrderMode = "RECOMMENDED" | "CURRENT";

export type ReadingPlanStatus = "ON_TRACK" | "BEHIND" | "COMPLETED";

// NOTE: Request types refer to data sent from frontend, Response type is
// data sent back to the frontend from the backend

export interface ReadingPlanBookRequest {
  bookId: number;
  readingOrder: number;
  deadline: string;
}

export interface ReadingPlanBookResponse {
  id?: number; // For calculation, not necessarily stored as part of a plan
  bookId: number;

  readingOrder: number;
  deadline: string;

  estimatedFinishDate: string | null;
  pagesRemaining: number;

  // Book information needed by frontend
  googleBooksId: string;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
  pageCount: number | null;

  status: BookStatus;
  pagesRead: number;
}

// Calculation sections does not save in database, just to determine feasability
export interface CalculateReadingPlanRequest {
  personalPagesPerHour: number;
  orderMode: ReadingPlanOrderMode;
  books: ReadingPlanBookRequest[];
  targetMinPerDay: number;
}

export interface CalculateReadingPlanResponse {
  orderMode: ReadingPlanOrderMode;
  targetMinPerDay: number;

  requiredPagesPerDay: number;
  totalPagesRemaining: number;
  totalReadingMinutes: number;
  pagesRead: number;

  overallCompletionDate: string;
  status: ReadingPlanStatus;

  books: ReadingPlanBookResponse[];
}

export interface SaveReadingPlanRequest {
  orderMode: ReadingPlanOrderMode;
  targetMinPerDay: number;

  requiredPagesPerDay: number;
  totalPagesRemaining: number;
  totalReadingMinutes: number;
  pagesRead: number;

  overallCompletionDate: string;
  status: ReadingPlanStatus;

  books: ReadingPlanBookResponse[];
}

export interface SaveReadingPlanResponse {
  id: number;

  orderMode: ReadingPlanOrderMode;
  targetMinPerDay: number;
  actualMinPerDay: number;

  requiredPagesPerDay: number | null;
  totalPagesRemaining: number | null;
  totalReadingMinutes: number | null;
  pagesRead: number | null;

  overallCompletionDate: string | null;
  status: ReadingPlanStatus | null;

  createdAt: Date;
  updatedAt: Date;

  books: ReadingPlanBookResponse[];
}
