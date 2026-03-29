'use client';

import { useState } from 'react';

interface QuizQuestionProps {
  question: string;
  options: string[];
  correctIndex: number;
  onAnswer: (correct: boolean) => void;
  questionNum: number;
  totalQuestions: number;
}

export default function QuizQuestion({
  question,
  options,
  correctIndex,
  onAnswer,
  questionNum,
  totalQuestions,
}: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      onAnswer(idx === correctIndex);
      setSelected(null);
    }, 800);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {questionNum} / {totalQuestions}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
        <p className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">
          {question}
        </p>
      </div>
      <div className="space-y-3">
        {options.map((opt, idx) => {
          let style = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400';
          if (selected !== null) {
            if (idx === correctIndex) {
              style = 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300';
            } else if (idx === selected) {
              style = 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300';
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`w-full text-left p-4 rounded-xl border transition-all ${style}`}
            >
              <span className="text-gray-900 dark:text-gray-100">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
