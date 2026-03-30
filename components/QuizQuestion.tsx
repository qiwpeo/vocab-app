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
        <span className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
          [{questionNum}/{totalQuestions}]
        </span>
        <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
          {pct}%
        </span>
      </div>
      <div className="retro-progress-track w-full h-2 p-0.5 mb-6">
        <div
          className="retro-progress-fill h-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* CRT Screen Question */}
      <div className="retro-screen p-6 mb-6 text-center">
        <p className="text-xs mb-2" style={{ color: 'var(--crt-green)', fontFamily: 'var(--font-mono)' }}>
          &gt; What does this mean?
        </p>
        <p className="text-2xl" style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontWeight: 600 }}>
          {question}
        </p>
        <span className="cursor-blink mt-2" style={{ background: 'var(--crt-green)', width: '6px', height: '12px' }} />
      </div>

      {/* Options as keyboard keys */}
      <div className="space-y-3">
        {options.map((opt, idx) => {
          let extraClass = '';
          let extraStyle = {};
          if (selected !== null) {
            if (idx === correctIndex) {
              extraStyle = { background: 'var(--screen-black)', color: 'var(--crt-green)', boxShadow: '0 0 8px rgba(51,255,0,0.2)' };
            } else if (idx === selected) {
              extraStyle = { background: '#8B0000', color: '#F0E68C', boxShadow: '0 1px 0 #5a0000' };
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`w-full text-left p-4 rounded retro-key transition-all ${extraClass}`}
              style={extraStyle}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded flex items-center justify-center text-xs shrink-0"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: selected !== null && idx === correctIndex ? 'var(--crt-green)' : selected !== null && idx === selected ? '#F0E68C' : 'var(--beige-dark)',
                    color: selected !== null && (idx === correctIndex || idx === selected) ? 'var(--screen-black)' : 'var(--ink-black)',
                    borderRadius: '3px',
                    fontWeight: 'bold',
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
