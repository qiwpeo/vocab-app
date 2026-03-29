'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { getExamById } from '@/lib/words';
import WordCard from '@/components/WordCard';
import FilterBar, { FilterType } from '@/components/FilterBar';
import ProgressBar from '@/components/ProgressBar';
import { useProgress } from '@/hooks/useProgress';

export default function ExamPage() {
  const params = useParams();
  const examId = params.examId as string;
  const examData = getExamById(examId);
  const [filter, setFilter] = useState<FilterType>('all');
  const [hideMeaning, setHideMeaning] = useState(false);

  if (!examData) {
    return (
      <div className="text-center py-12 text-gray-500">
        해당 시험을 찾을 수 없습니다.
      </div>
    );
  }

  const wordIds = examData.words.map((w) => w.id);
  const { memorized, toggle, memorizedCount } = useProgress(wordIds);

  const filteredWords = examData.words.filter((w) => {
    if (filter === 'memorized') return memorized[w.id];
    if (filter === 'not-memorized') return !memorized[w.id];
    return true;
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {examData.exam.label}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          총 {examData.words.length}개 단어
        </p>
        <ProgressBar current={memorizedCount} total={examData.words.length} />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <FilterBar current={filter} onChange={setFilter} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHideMeaning(!hideMeaning)}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
              hideMeaning
                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {hideMeaning ? '학습 모드' : '뜻 보기'}
          </button>
          <Link
            href={`/exam/${examId}/quiz`}
            className="text-sm px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            퀴즈 시작
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {filteredWords.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            isMemorized={!!memorized[word.id]}
            onToggleMemorized={() => toggle(word.id)}
            hideMeaning={hideMeaning}
          />
        ))}
        {filteredWords.length === 0 && (
          <p className="text-center py-8 text-gray-400">
            해당하는 단어가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
