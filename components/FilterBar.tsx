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
    { value: 'memorized', label: '암기완료' },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            current === f.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
