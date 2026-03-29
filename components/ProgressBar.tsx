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
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
        <span>{current}/{total} 암기</span>
        <span className="font-semibold text-indigo-500">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
