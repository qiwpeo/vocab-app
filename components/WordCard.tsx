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
      className={`border rounded-xl p-4 transition-all ${
        isMemorized
          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {word.word}
            </h3>
            {word.questionNumber && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                {word.questionNumber}번
              </span>
            )}
          </div>

          {hideMeaning && !showMeaning ? (
            <button
              onClick={() => setShowMeaning(true)}
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 mb-2"
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
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {word.meaning}
              </p>
            </>
          )}

          {meaningVisible && (
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
              <p className="italic">&quot;{word.example}&quot;</p>
              <p>{word.exampleMeaning}</p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleMemorized}
          className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
            isMemorized
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-blue-400'
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
