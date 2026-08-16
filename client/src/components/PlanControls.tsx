interface PlanControlsProps {
  onCalculate: () => void;
  onSave: () => void;
  hasCalculated: boolean;
}

export function PlanControls({
  onCalculate,
  onSave,
  hasCalculated,
}: PlanControlsProps) {
  return (
    <section className="bg-bg-secondary rounded-lg p-6 mt-8">
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCalculate}
          className="px-6 py-2.5 rounded-md border border-accent-terracotta text-accent-terracotta text-sm font-medium hover:bg-accent-terracotta/10"
        >
          Calculate Plan
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!hasCalculated}
          className="px-6 py-2.5 rounded-md bg-accent-terracotta text-bg-primary text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Reading Plan
        </button>
      </div>
    </section>
  );
}
