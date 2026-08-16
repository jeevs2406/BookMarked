interface PlanSummaryProps {
  totalPagesRemaining: number;
  totalHours: number;
  requiredPagesPerDay: number;
  status: "ON_TRACK" | "BEHIND";
}

export function PlanSummary({
  totalPagesRemaining,
  totalHours,
  requiredPagesPerDay,
  status,
}: PlanSummaryProps) {
  return (
    <section className="mb-10">
      <h2 className="font-serif text-text-primary text-xl mb-4">
        Plan Summary
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-bg-secondary rounded-lg p-4">
          <p className="text-text-secondary text-xs">Pages remaining</p>

          <p className="text-text-primary text-xl font-semibold mt-1">
            {totalPagesRemaining}
          </p>
        </div>

        <div className="bg-bg-secondary rounded-lg p-4">
          <p className="text-text-secondary text-xs">Total reading time</p>

          <p className="text-text-primary text-xl font-semibold mt-1">
            {totalHours}h
          </p>
        </div>

        <div className="bg-bg-secondary rounded-lg p-4">
          <p className="text-text-secondary text-xs">Required pace</p>

          <p className="text-text-primary text-xl font-semibold mt-1">
            {requiredPagesPerDay}
            <span className="text-sm font-normal"> pages/day</span>
          </p>
        </div>

        <div className="bg-bg-secondary rounded-lg p-4">
          <p className="text-text-secondary text-xs">Plan status</p>

          <p
            className={`text-xl font-semibold mt-1 ${
              status === "ON_TRACK" ? "text-green-400" : "text-red-400"
            }`}
          >
            {status === "ON_TRACK" ? "On track" : "Behind"}
          </p>
        </div>
      </div>
    </section>
  );
}
