import { useState } from "react";
import type { LibraryBook } from "../../../types/book";

interface LogProgressModalProps {
  book: LibraryBook;
  onClose: () => void;
  onSaved: (newPage: number, durationMinutes: number) => Promise<void>;
}

export function LogProgressModal({
  book,
  onClose,
  onSaved,
}: LogProgressModalProps) {
  const [newPage, setNewPage] = useState(String(book.pagesRead));
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");

    const page = Number(newPage);

    if (newPage === "") {
      setError("Please enter a page number.");
      return;
    }

    if (page < book.pagesRead + 1) {
      setError(`New page must be at least ${book.pagesRead + 1}.`);
      return;
    }

    const durationMinutes = hours * 60 + minutes;

    if (durationMinutes <= 0) {
      setError("Please enter how long you spent reading.");
      return;
    }

    if (book.pageCount !== null && page > book.pageCount) {
      setError(`Page cannot be greater than ${book.pageCount}.`);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/${book.id}/reading-sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPage: page,
            durationMinutes,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save reading progress.");
      }

      // Backend returns the updated book
      try {
        await onSaved(page, durationMinutes);
      } catch (error) {
        console.error("Failed to save progress:", error);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save progress:", error);

      setError(
        error instanceof Error ? error.message : "Failed to save progress.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-secondary rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="font-serif text-text-primary text-xl">
          Log Reading Progress
        </h2>

        <p className="text-text-secondary text-sm mt-1">{book.title}</p>

        {/* Current page */}
        <div className="mt-6">
          <label className="block text-text-primary text-sm mb-2">
            Current page
          </label>

          <p className="text-text-secondary text-xs mb-2">
            Last recorded page: {book.pagesRead}
          </p>

          <input
            type="number"
            min={book.pagesRead}
            max={book.pageCount ?? undefined}
            value={newPage}
            onChange={(e) => setNewPage(e.target.value)}
            className="w-full bg-bg-elevated text-text-primary rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-accent-terracotta"
          />
        </div>

        {/* Time */}
        <div className="mt-5">
          <label className="block text-text-primary text-sm mb-2">
            Reading time
          </label>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-text-secondary text-xs mb-1">
                Hours
              </label>

              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full bg-bg-elevated text-text-primary rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-accent-terracotta"
              />
            </div>

            <div className="flex-1">
              <label className="block text-text-secondary text-xs mb-1">
                Minutes
              </label>

              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full bg-bg-elevated text-text-primary rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-accent-terracotta"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm text-text-secondary hover:bg-bg-elevated"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-accent-terracotta text-bg-primary text-sm"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>
        </div>
      </div>
    </div>
  );
}
