interface ReadingStatsProps {
  overallAverage: number;
  personalAverage: number;
}

export function ReadingStats({
  overallAverage,
  personalAverage,
}: ReadingStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
      <div className="bg-bg-secondary rounded-lg p-5">
        <p className="text-text-secondary text-sm">General reading pace</p>
        <p className="text-text-primary text-2xl font-semibold mt-2">
          {overallAverage} pages/hour
        </p>
      </div>

      <div className="bg-bg-secondary rounded-lg p-5">
        <p className="text-text-secondary text-sm">Your reading pace</p>
        <p className="text-text-primary text-2xl font-semibold mt-2">
          {personalAverage * 2} pages/hour
        </p>
      </div>
    </div>
  );
}
