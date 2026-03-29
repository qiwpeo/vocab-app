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
          className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
            current === f.value
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
              : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
