'use client';

import { useState } from 'react';
import { WordData } from '@/lib/types';

const POS_LABEL: Record<string, string> = {
  verb: 'v.',
  noun: 'n.',
  adj: 'adj.',
  adv: 'adv.',
};

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
      className={`retro-card rounded-lg p-4 transition-all duration-200 ${
        isMemorized ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-lg" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              {word.word}
            </h3>
            <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
              {POS_LABEL[word.pos] ?? word.pos}
            </span>
            {word.questionNumber && (
              <span className="text-xs px-1.5 py-0.5" style={{
                fontFamily: 'var(--font-mono)',
                background: 'var(--screen-black)',
                color: '#fff',
                borderRadius: '2px',
                fontSize: '10px',
              }}>
                Q{word.questionNumber}
              </span>
            )}
          </div>

          {hideMeaning && !showMeaning ? (
            <button
              onClick={() => setShowMeaning(true)}
              className="text-sm hover:opacity-70 transition-opacity"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}
            >
              [뜻 보기]
            </button>
          ) : (
            <>
              {hideMeaning && (
                <button
                  onClick={() => setShowMeaning(false)}
                  className="text-xs hover:opacity-70 mb-1"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}
                >
                  [숨기기]
                </button>
              )}
              <p className="text-base mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                {word.meaning}
              </p>
            </>
          )}

          {meaningVisible && word.example && (
            <div className="retro-screen mt-2 px-3 py-2 text-xs" style={{ fontSize: '12px' }}>
              <span style={{ color: 'var(--crt-green)' }}>&gt; </span>
              <span style={{ color: '#ccc' }}>{word.example}</span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleMemorized}
          className={`shrink-0 w-8 h-8 rounded retro-key flex items-center justify-center text-xs transition-all ${
            isMemorized ? 'retro-key-active' : ''
          }`}
          style={{ fontFamily: 'var(--font-mono)' }}
          aria-label={isMemorized ? '암기 해제' : '암기 완료'}
        >
          {isMemorized ? '✓' : ''}
        </button>
      </div>
    </div>
  );
}
