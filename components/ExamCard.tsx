'use client';

import Link from 'next/link';
import { ExamData } from '@/lib/types';
import ProgressBar from './ProgressBar';
import { useMemorizedCount } from '@/hooks/useProgress';

export default function ExamCard({
  examId,
  data,
}: {
  examId: string;
  data: ExamData;
}) {
  const wordIds = data.words.map((w) => w.id);
  const memorizedCount = useMemorizedCount(wordIds);

  return (
    <Link href={`/exam/${examId}`}>
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer bg-white dark:bg-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {data.exam.label}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          총 {data.words.length}개 단어
        </p>
        <ProgressBar current={memorizedCount} total={data.words.length} />
      </div>
    </Link>
  );
}
