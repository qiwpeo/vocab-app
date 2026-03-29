'use client';

import Link from 'next/link';
import { ExamData } from '@/lib/types';
import ProgressBar from './ProgressBar';
import { useMemorizedCount } from '@/hooks/useProgress';

const monthColors: Record<number, string> = {
  3: 'from-emerald-400 to-teal-500',
  6: 'from-blue-400 to-indigo-500',
  9: 'from-orange-400 to-rose-500',
  10: 'from-purple-400 to-pink-500',
};

export default function ExamCard({
  examId,
  data,
}: {
  examId: string;
  data: ExamData;
}) {
  const wordIds = data.words.map((w) => w.id);
  const memorizedCount = useMemorizedCount(wordIds);
  const gradient = monthColors[data.exam.month] ?? 'from-gray-400 to-gray-500';

  return (
    <Link href={`/exam/${examId}`}>
      <div className="card-shine group relative rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${gradient}`} />
        <div className="pl-5 pr-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {data.exam.label}
            </h3>
            <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
              {data.words.length}단어
            </span>
          </div>
          <ProgressBar current={memorizedCount} total={data.words.length} />
        </div>
      </div>
    </Link>
  );
}
