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
    <div className={`face-front rounded-lg p-4 transition-all duration-200 ${isMemorized ? 'opacity-40' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-serif text-lg" style={{ fontWeight: 600 }}>{word.word}</h3>
            <span className="font-mono text-xs text-beige-shadow">{POS_LABEL[word.pos] ?? word.pos}</span>
            {word.questionNumber && (
              <span className="sticker-badge text-center px-1.5 py-0.5 rounded-sm" style={{ fontSize: 10 }}>
                Q{word.questionNumber}
              </span>
            )}
          </div>

          {hideMeaning && !showMeaning ? (
            <button onClick={() => setShowMeaning(true)}
              className="font-mono text-sm text-beige-shadow hover:opacity-70 transition-opacity">
              [뜻 보기]
            </button>
          ) : (
            <>
              {hideMeaning && (
                <button onClick={() => setShowMeaning(false)}
                  className="font-mono text-xs text-beige-shadow hover:opacity-70 mb-1">
                  [숨기기]
                </button>
              )}
              <p className="font-serif text-base mb-1">{word.meaning}</p>
            </>
          )}

          {meaningVisible && word.example && (
            <div className="crt-flat mt-2 px-3 py-2 rounded-sm" style={{ fontSize: 12 }}>
              <span className="text-crt">&gt; </span>
              <span style={{ color: '#ccc' }}>{word.example}</span>
            </div>
          )}
        </div>

        <button onClick={onToggleMemorized}
          className={`shrink-0 w-8 h-8 rounded key flex items-center justify-center font-mono text-xs ${isMemorized ? 'key-pressed' : ''}`}
          aria-label={isMemorized ? '암기 해제' : '암기 완료'}>
          {isMemorized ? '✓' : ''}
        </button>
      </div>
    </div>
  );
}
