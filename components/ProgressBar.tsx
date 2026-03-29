'use client';

export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{current}/{total} 암기</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
