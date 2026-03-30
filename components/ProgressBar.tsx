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
      <div className="flex justify-between text-xs mb-1.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
        <span>{current}/{total} memorized</span>
        <span>{pct}%</span>
      </div>
      <div className="retro-progress-track w-full h-2.5 p-0.5">
        <div
          className="retro-progress-fill h-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
