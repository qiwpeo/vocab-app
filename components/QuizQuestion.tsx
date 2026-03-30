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
        <span className="font-mono text-sm text-beige-shadow">[{questionNum}/{totalQuestions}]</span>
        <span className="font-mono text-xs text-beige-shadow">{pct}%</span>
      </div>
      <div className="progress-track w-full h-2 p-0.5 mb-6">
        <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
      </div>

      {/* CRT question screen */}
      <div className="crt-flat p-6 mb-6 text-center rounded-sm shadow-screen">
        <p className="text-crt font-mono text-xs mb-2">&gt; What does this mean?</p>
        <p className="font-serif text-2xl" style={{ color: '#fff', fontWeight: 600 }}>{question}</p>
        <span className="cursor-blink mt-2" />
      </div>

      {/* Key options */}
      <div className="space-y-3">
        {options.map((opt, idx) => {
          let cls = 'key';
          if (selected !== null && idx === correctIndex) {
            cls = 'key-pressed';
          } else if (selected !== null && idx === selected) {
            cls = '';
          }

          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
              className={`w-full text-left p-4 rounded transition-all ${cls}`}
              style={
                selected !== null && idx === selected && idx !== correctIndex
                  ? { background: '#8B0000', color: '#F0E68C', boxShadow: '0 1px 0 #5a0000, 0 1px 4px rgba(0,0,0,0.3)', transform: 'translateY(4px)' }
                  : selected !== null && idx === correctIndex
                  ? { background: 'var(--screen-black)', color: 'var(--crt-green)', textShadow: '0 0 4px rgba(51,255,0,0.4)', boxShadow: '0 2px 0 #000, 0 2px 4px rgba(0,0,0,0.3)', transform: 'translateY(4px)' }
                  : {}
              }
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded flex items-center justify-center text-xs font-mono shrink-0"
                  style={{
                    background: selected !== null && idx === correctIndex ? 'var(--crt-green)' : selected !== null && idx === selected ? '#F0E68C' : 'var(--beige-dark)',
                    color: selected !== null && (idx === correctIndex || idx === selected) ? 'var(--screen-black)' : 'var(--ink-black)',
                    borderRadius: 3,
                    fontWeight: 'bold',
                  }}>
                  {idx + 1}
                </span>
                <span className="font-serif" style={{ fontSize: '1rem' }}>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
