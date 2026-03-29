'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getExamById } from '@/lib/words';
import { useProgress } from '@/hooks/useProgress';
import { getMemorizedMap } from '@/lib/storage';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const POS_LABEL: Record<string, string> = {
  verb: '동사',
  noun: '명사',
  adj: '형용사',
  adv: '부사',
};

export default function FlashcardPage() {
  const params = useParams();
  const examId = params.examId as string;
  const examData = getExamById(examId);

  const wordIds = examData?.words.map((w) => w.id) ?? [];
  const { memorized, toggle } = useProgress(wordIds);

  const [scope, setScope] = useState<'all' | 'not-memorized'>('not-memorized');
  const [started, setStarted] = useState(false);

  const cards = useMemo(() => {
    if (!examData || !started) return [];
    let words = examData.words;
    if (scope === 'not-memorized') {
      const mem = getMemorizedMap();
      words = words.filter((w) => !mem[w.id]);
    }
    return shuffle(words);
  }, [examData, started, scope]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  const [stats, setStats] = useState({ memorized: 0, skipped: 0 });

  const handleNext = useCallback(
    (direction: 'left' | 'right') => {
      const card = cards[currentIdx];
      if (!card) return;

      if (direction === 'right') {
        if (!memorized[card.id]) toggle(card.id);
        setStats((s) => ({ ...s, memorized: s.memorized + 1 }));
      } else {
        if (memorized[card.id]) toggle(card.id);
        setStats((s) => ({ ...s, skipped: s.skipped + 1 }));
      }

      setExiting(direction);
      setTimeout(() => {
        setExiting(null);
        setDragX(0);
        setFlipped(false);
        setCurrentIdx((i) => i + 1);
      }, 250);
    },
    [cards, currentIdx, memorized, toggle]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    if (isHorizontal.current) {
      e.preventDefault();
      setDragX(dx);
    }
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (Math.abs(dragX) > 80) {
      handleNext(dragX > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
    }
    isHorizontal.current = null;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  };

  const onMouseUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dragX) > 80) {
      handleNext(dragX > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
    }
  };

  if (!examData) {
    return (
      <div className="text-center py-12 text-gray-500">
        해당 시험을 찾을 수 없습니다.
      </div>
    );
  }

  // Setup
  if (!started) {
    const memCount = Object.values(memorized).filter(Boolean).length;
    const notMemCount = examData.words.length - memCount;

    return (
      <div className="max-w-lg mx-auto">
        <Link href={`/exam/${examId}`} className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 mb-4 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          돌아가기
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
          플래시카드
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
          {examData.exam.label}
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              범위
            </label>
            <div className="flex gap-2">
              {([['not-memorized', `미암기 (${notMemCount}개)`], ['all', `전체 (${examData.words.length}개)`]] as const).map(
                ([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setScope(v)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      scope === v
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    {l}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">사용법</p>
            <div className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
              <p>
                <span className="inline-block w-5 text-center font-bold text-indigo-500">tap</span>
                {' '}카드를 탭하면 뜻이 보입니다
              </p>
              <p>
                <span className="inline-block w-5 text-center font-bold text-emerald-500">→</span>
                {' '}오른쪽 스와이프 = 암기 완료
              </p>
              <p>
                <span className="inline-block w-5 text-center font-bold text-rose-500">←</span>
                {' '}왼쪽 스와이프 = 아직 모름
              </p>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all duration-200"
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  // Done
  if (currentIdx >= cards.length) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="py-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 mb-6">
          <p className="text-white/70 text-sm mb-2">완료!</p>
          <div className="text-5xl font-extrabold text-white mb-4">
            {cards.length}장
          </div>
          <div className="flex justify-center gap-8 text-white/80 text-sm">
            <div>
              <span className="block text-2xl font-bold text-emerald-300">{stats.memorized}</span>
              암기
            </div>
            <div>
              <span className="block text-2xl font-bold text-rose-300">{stats.skipped}</span>
              미암기
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setStarted(false);
              setCurrentIdx(0);
              setFlipped(false);
              setStats({ memorized: 0, skipped: 0 });
            }}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200"
          >
            다시 하기
          </button>
          <Link
            href={`/exam/${examId}`}
            className="flex-1 py-3 text-center bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
          >
            단어장으로
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[currentIdx];
  const rotation = dragX * 0.1;
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 300);

  const exitTransform = exiting
    ? `translateX(${exiting === 'right' ? 400 : -400}px) rotate(${exiting === 'right' ? 20 : -20}deg)`
    : `translateX(${dragX}px) rotate(${rotation}deg)`;

  return (
    <div className="max-w-lg mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            setStarted(false);
            setCurrentIdx(0);
            setFlipped(false);
            setStats({ memorized: 0, skipped: 0 });
          }}
          className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          그만하기
        </button>
        <span className="text-sm font-semibold text-indigo-500">
          {currentIdx + 1} / {cards.length}
        </span>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx) / cards.length) * 100}%` }}
        />
      </div>

      {/* Swipe indicators */}
      <div className="relative flex justify-center items-center" style={{ minHeight: '360px' }}>
        {/* Left indicator */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 text-rose-400 font-extrabold text-lg transition-opacity duration-150 pointer-events-none"
          style={{ opacity: dragX < -30 ? Math.min(1, (-dragX - 30) / 50) : 0 }}
        >
          모름
        </div>

        {/* Right indicator */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-400 font-extrabold text-lg transition-opacity duration-150 pointer-events-none"
          style={{ opacity: dragX > 30 ? Math.min(1, (dragX - 30) / 50) : 0 }}
        >
          암기!
        </div>

        {/* Card */}
        <div
          className="w-full cursor-grab active:cursor-grabbing"
          style={{
            transform: exitTransform,
            opacity: exiting ? 0 : opacity,
            transition: exiting || !dragging ? 'all 0.25s ease-out' : 'none',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => {
            if (dragging) {
              setDragging(false);
              setDragX(0);
            }
          }}
          onClick={() => {
            if (Math.abs(dragX) < 5) setFlipped((f) => !f);
          }}
        >
          <div
            className={`rounded-3xl p-8 min-h-[320px] flex flex-col items-center justify-center text-center transition-colors duration-200 ${
              dragX > 30
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700'
                : dragX < -30
                ? 'bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-300 dark:border-rose-700'
                : 'bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700'
            } shadow-xl`}
          >
            {!flipped ? (
              <>
                <span className="text-xs font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider mb-4">
                  {POS_LABEL[card.pos] ?? card.pos}
                </span>
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
                  {card.word}
                </h2>
                <p className="text-sm text-gray-300 dark:text-gray-600">
                  탭하여 뜻 보기
                </p>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider mb-4">
                  {POS_LABEL[card.pos] ?? card.pos}
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">
                  {card.word}
                </h2>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                  {card.meaning}
                </p>
                {card.example && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic max-w-xs">
                    &quot;{card.example}&quot;
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Button controls */}
      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={() => handleNext('left')}
          className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-all hover:scale-110 shadow-md"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          onClick={() => handleNext('right')}
          className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all hover:scale-110 shadow-md"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
