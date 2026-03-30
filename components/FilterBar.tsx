'use client';

export type FilterType = 'all' | 'not-memorized' | 'memorized';

export default function FilterBar({
  current,
  onChange,
}: {
  current: FilterType;
  onChange: (f: FilterType) => void;
}) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'not-memorized', label: '미암기' },
    { value: 'memorized', label: '완료' },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`key px-3 py-1.5 text-sm ${
            current === f.value ? 'key-pressed' : ''
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
