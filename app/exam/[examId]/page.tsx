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
      <div className="text-center py-12 font-mono text-beige-shadow">
        [ERROR] 해당 시험을 찾을 수 없습니다.
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
        <Link href="/" className="font-mono text-sm text-beige-shadow hover:opacity-70 transition-opacity mb-3 inline-block">
          &larr; [목록으로]
        </Link>
        <h1 className="font-serif text-2xl mb-1" style={{ fontWeight: 600 }}>
          {examData.exam.label}
        </h1>
        <p className="font-mono text-sm text-beige-shadow mb-4">
          {examData.words.length} words loaded
        </p>
        <ProgressBar current={memorizedCount} total={examData.words.length} />
      </div>

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <FilterBar current={filter} onChange={setFilter} />
        <div className="flex items-center gap-2">
          <button onClick={() => setHideMeaning(!hideMeaning)}
            className={`key px-3 py-1.5 text-sm ${hideMeaning ? 'key-pressed' : ''}`}>
            {hideMeaning ? '학습중' : '뜻 보기'}
          </button>
          <Link href={`/exam/${examId}/flashcard`} className="key px-3 py-1.5 text-sm inline-block text-center">
            카드
          </Link>
          <Link href={`/exam/${examId}/quiz`} className="btn btn-sm inline-block text-center">
            퀴즈
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {filteredWords.map((word) => (
          <WordCard key={word.id} word={word} isMemorized={!!memorized[word.id]}
            onToggleMemorized={() => toggle(word.id)} hideMeaning={hideMeaning} />
        ))}
        {filteredWords.length === 0 && (
          <div className="text-center py-12 font-mono text-beige-shadow">
            [EMPTY] 해당하는 단어가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
