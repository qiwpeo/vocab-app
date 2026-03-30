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
      <div className="flex justify-between font-mono text-xs text-beige-shadow mb-1.5">
        <span>{current}/{total} memorized</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-track w-full h-2.5 p-0.5">
        <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
