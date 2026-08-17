export interface ReadingSession {
  id: number;
  bookId: number;
  previousPage: number;
  newPage: number;
  durationMinutes: number;
  createdAt: string;
}

export interface CreateReadingSessionRequest {
  newPage: number;
  durationMinutes: number;
}
