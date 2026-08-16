import { useState } from "react";
import type { LibraryBook } from "../../../types/book";

interface LogProgressModalProps {
  book: LibraryBook;
  onClose: () => void;
  onSaved: (book: LibraryBook) => void;
}

export function LogProgressModal({
  book,
  onClose,
  onSaved,
}: LogProgressModalProps) {
  const [pagesRead, setPagesRead] = useState(String(book.pagesRead ?? 0));

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const newPagesRead = Number(pagesRead);
    const hoursValue = Number(hours || 0);
    const minutesValue = Number(minutes || 0);

    // Basic validation
    if (Number.isNaN(newPagesRead) || newPagesRead < 0) {
      return;
    }

    if (book.pageCount !== null && newPagesRead > book.pageCount) {
      return;
    }

    if (hoursValue < 0 || minutesValue < 0 || minutesValue > 59) {
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/${book.id}/progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pagesRead: newPagesRead,
            hours: hoursValue,
            minutes: minutesValue,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to save progress");
      }

      const updatedBook: LibraryBook = await res.json();

      onSaved(updatedBook);
      onClose();
    } catch (error) {
      console.error("Failed to save reading progress:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="bg-bg-secondary rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-serif text-text-primary text-xl">
            Log Reading Progress
          </h2>

          <p className="text-text-secondary text-sm mt-1">{book.title}</p>
        </div>

        {/* Current page */}
        <div className="mb-5">
          <label className="block text-text-primary text-sm mb-2">
            Current page
          </label>

          <input
            type="number"
            min="0"
            max={book.pageCount ?? undefined}
            value={pagesRead}
            onChange={(e) => setPagesRead(e.target.value)}
            className="w-full bg-bg-elevated text-text-primary rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-accent-terracotta"
          />

          <p className="text-text-secondary text-xs mt-1">
            Last recorded page: {book.pagesRead ?? 0}
            {book.pageCount !== null && ` / ${book.pageCount}`}
          </p>
        </div>

        {/* Time spent */}
        <div className="mb-6">
          <label className="block text-text-primary text-sm mb-2">
            Time spent reading
          </label>

          <div className="flex gap-3">
            {/* Hours */}
            <div className="flex-1">
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-full bg-bg-elevated text-text-primary rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-accent-terracotta"
              />

              <p className="text-text-secondary text-xs mt-1">hours</p>
            </div>

            {/* Minutes */}
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="0"
                className="w-full bg-bg-elevated text-text-primary rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-accent-terracotta"
              />

              <p className="text-text-secondary text-xs mt-1">minutes</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm text-text-secondary hover:bg-bg-elevated transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-accent-moss text-bg-primary text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>
        </div>
      </div>
    </div>
  );
}
