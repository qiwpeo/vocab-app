'use client';

import { useState } from 'react';
import { WordData } from '@/lib/types';

export default function WordCard({
  word,
  isMemorized,
  onToggleMemorized,
  hideMeaning,
}: {
  word: WordData;
  isMemorized: boolean;
  onToggleMemorized: () => void;
  hideMeaning: boolean;
}) {
  const [showMeaning, setShowMeaning] = useState(false);
  const meaningVisible = !hideMeaning || showMeaning;

  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-200 ${
        isMemorized
          ? 'bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50 opacity-50'
          : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {word.word}
            </h3>
            {word.questionNumber && (
              <span className="text-xs font-medium px-2 py-0.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                {word.questionNumber}번
              </span>
            )}
          </div>

          {hideMeaning && !showMeaning ? (
            <button
              onClick={() => setShowMeaning(true)}
              className="text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium mb-2"
            >
              뜻 보기
            </button>
          ) : (
            <>
              {hideMeaning && (
                <button
                  onClick={() => setShowMeaning(false)}
                  className="text-sm text-gray-400 hover:text-gray-500 mb-1"
                >
                  뜻 숨기기
                </button>
              )}
              <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">
                {word.meaning}
              </p>
            </>
          )}

          {meaningVisible && word.example && (
            <div className="text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 mt-1">
              <p className="italic">&quot;{word.example}&quot;</p>
              {word.exampleMeaning && <p className="mt-0.5">{word.exampleMeaning}</p>}
            </div>
          )}
        </div>

        <button
          onClick={onToggleMemorized}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            isMemorized
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
              : 'border-2 border-gray-200 dark:border-slate-600 text-transparent hover:border-indigo-400 hover:scale-110'
          }`}
          aria-label={isMemorized ? '암기 해제' : '암기 완료'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
