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
  const pct = Math.round((questionNum / totalQuestions) * 100);

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
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-indigo-500">
          {questionNum} / {totalQuestions}
        </span>
        <span className="text-xs text-gray-400">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 mb-6 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
        <p className="text-2xl font-bold text-center text-white">
          {question}
        </p>
      </div>

      <div className="space-y-3">
        {options.map((opt, idx) => {
          let style = 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md';
          if (selected !== null) {
            if (idx === correctIndex) {
              style = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-400/20';
            } else if (idx === selected) {
              style = 'bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20';
            } else {
              style = 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 opacity-50';
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${style}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  selected !== null && idx === correctIndex
                    ? 'bg-emerald-400 text-white'
                    : selected !== null && idx === selected
                    ? 'bg-rose-400 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {idx + 1}
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
