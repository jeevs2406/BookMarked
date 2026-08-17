interface MessageModalProps {
  type: "error" | "success";
  message: string;
  onClose: () => void;
}

export function MessageModal({ type, message, onClose }: MessageModalProps) {
  const isError = type === "error";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-secondary rounded-lg p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
              isError
                ? "bg-red-500/15 text-red-400"
                : "bg-green-500/15 text-green-400"
            }`}
          >
            {isError ? "!" : "✓"}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="font-serif text-text-primary text-lg">
              {isError ? "Something went wrong" : "Success"}
            </h2>

            <p className="text-text-secondary text-sm mt-2">{message}</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm ${
              isError
                ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                : "bg-accent-terracotta text-bg-primary"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
