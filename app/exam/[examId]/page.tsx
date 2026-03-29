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
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 mb-3 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
          {examData.exam.label}
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
          총 {examData.words.length}개 단어
        </p>
        <ProgressBar current={memorizedCount} total={examData.words.length} />
      </div>

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <FilterBar current={filter} onChange={setFilter} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideMeaning(!hideMeaning)}
            className={`text-sm px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ${
              hideMeaning
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
            }`}
          >
            {hideMeaning ? '학습 모드' : '뜻 보기'}
          </button>
          <Link
            href={`/exam/${examId}/flashcard`}
            className="text-sm px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-orange-200 dark:hover:shadow-orange-900/30 transition-all duration-200"
          >
            플래시카드
          </Link>
          <Link
            href={`/exam/${examId}/quiz`}
            className="text-sm px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all duration-200"
          >
            퀴즈
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
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">해당하는 단어가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
