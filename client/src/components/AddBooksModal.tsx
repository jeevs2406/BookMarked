interface AddBookCandidate {
  id: number;
  title: string;
  author: string;
  coverUrl: string | null;
}

interface AddBooksModalProps {
  books: AddBookCandidate[];
  onAdd: (bookId: number) => void;
  onClose: () => void;
}

export function AddBooksModal({ books, onAdd, onClose }: AddBooksModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-lg p-6 max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-text-primary text-lg">
            Add books to your plan
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary text-sm hover:text-text-primary"
          >
            Close
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto">
          {books.length === 0 ? (
            <p className="text-text-secondary text-sm">
              All your library books are already in this plan.
            </p>
          ) : (
            books.map((book) => (
              <button
                key={book.id}
                onClick={() => onAdd(book.id)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-bg-elevated text-left"
              >
                <div className="w-10 h-14 flex-shrink-0 bg-bg-elevated rounded overflow-hidden">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="text-text-primary text-sm truncate">
                    {book.title}
                  </p>
                  <p className="text-text-secondary text-xs truncate">
                    {book.author}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
