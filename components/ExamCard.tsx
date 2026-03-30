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
      <div className="face-front rounded-lg p-5 hover:translate-y-[-2px] transition-all duration-200 cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg" style={{ fontWeight: 600 }}>
            {data.exam.label}
          </h3>
          <span className="font-mono text-xs px-2 py-0.5 bg-screen text-crt rounded-sm">
            {data.words.length} words
          </span>
        </div>
        <ProgressBar current={memorizedCount} total={data.words.length} />
        <div className="grill mt-3" style={{ width: 32, height: 10 }}>
          <div className="vent" /><div className="vent" /><div className="vent" /><div className="vent" />
          <div className="vent" /><div className="vent" /><div className="vent" /><div className="vent" />
        </div>
      </div>
    </Link>
  );
}
