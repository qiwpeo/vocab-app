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
      <div className="retro-card rounded-lg p-5 hover:translate-y-[-2px] transition-all duration-200 cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            {data.exam.label}
          </h3>
          <span className="text-xs px-2 py-0.5" style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--screen-black)',
            color: 'var(--crt-green)',
            borderRadius: '3px',
          }}>
            {data.words.length} words
          </span>
        </div>
        <ProgressBar current={memorizedCount} total={data.words.length} />
        {/* Vent grill decoration */}
        <div className="vent-grill mt-3 w-8">
          <div /><div /><div /><div />
          <div /><div /><div /><div />
        </div>
      </div>
    </Link>
  );
}
