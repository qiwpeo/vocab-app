'use client';

import { useWrongNotes } from '@/hooks/useWrongNotes';
import { getExamById } from '@/lib/words';
import { WrongNoteEntry } from '@/lib/types';
import { useState, useMemo, useCallback } from 'react';
import QuizQuestion from '@/components/QuizQuestion';
import { addWrongNote } from '@/lib/storage';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WrongNotesPage() {
  const { notes, remove, refresh } = useWrongNotes();
  const entries = Object.values(notes);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizResults, setQuizResults] = useState<{ word: string; correct: boolean }[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const grouped = entries.reduce<Record<string, WrongNoteEntry[]>>((acc, entry) => {
    const exam = getExamById(entry.examId);
    const label = exam?.exam.label ?? entry.examId;
    if (!acc[label]) acc[label] = [];
    acc[label].push(entry);
    return acc;
  }, {});

  const quizItems = useMemo(() => {
    if (!quizMode) return [];
    const allWords = entries.map((e) => e.word);
    const shuffled = shuffle(allWords);
    return shuffled.map((w) => {
      const others = allWords.filter((o) => o.id !== w.id);
      const samePOS = shuffle(others.filter((o) => o.pos === w.pos));
      const diffPOS = shuffle(others.filter((o) => o.pos !== w.pos));
      const distractors = [...samePOS, ...diffPOS].slice(0, 3);
      const options = shuffle([w, ...distractors].map((x) => x.meaning));
      return { word: w, question: w.word, options, correctIndex: options.indexOf(w.meaning) };
    });
  }, [quizMode, entries]);

  const handleQuizAnswer = useCallback((correct: boolean) => {
    const item = quizItems[quizIdx];
    setQuizResults((prev) => [...prev, { word: item.word.word, correct }]);
    if (!correct) {
      const entry = entries.find((e) => e.word.id === item.word.id);
      if (entry) addWrongNote(item.word, entry.examId);
    }
    if (quizIdx + 1 >= quizItems.length) setQuizFinished(true);
    else setQuizIdx((prev) => prev + 1);
  }, [quizIdx, quizItems, entries]);

  if (entries.length === 0 && !quizMode) {
    return (
      <div className="text-center py-20">
        <div className="crt-flat inline-block px-8 py-6 mb-4 rounded-sm shadow-screen">
          <p className="text-crt font-mono" style={{ fontSize: 14 }}>
            &gt; 오답노트가 비어있습니다_<span className="cursor-blink" />
          </p>
        </div>
        <p className="font-mono text-sm text-beige-shadow">
          퀴즈에서 틀린 단어가 자동으로 추가됩니다.
        </p>
      </div>
    );
  }

  if (quizMode) {
    if (quizFinished) {
      const correctCount = quizResults.filter((r) => r.correct).length;
      const score = Math.round((correctCount / quizResults.length) * 100);
      return (
        <div className="max-w-lg mx-auto">
          <div className="crt-flat p-6 text-center mb-6 rounded-sm shadow-screen">
            <p className="text-crt font-mono text-xs mb-2">&gt; Wrong Notes Quiz Complete</p>
            <div className="font-mono text-5xl mb-2"
              style={{ color: score >= 80 ? 'var(--crt-green)' : score >= 50 ? '#F6C829' : '#D83335',
                       textShadow: score >= 80 ? '0 0 8px rgba(51,255,0,0.4)' : undefined }}>
              {score}%
            </div>
            <p className="font-mono text-sm" style={{ color: '#888' }}>{correctCount}/{quizResults.length} correct</p>
          </div>
          <button onClick={() => { setQuizMode(false); setQuizIdx(0); setQuizResults([]); setQuizFinished(false); refresh(); }}
            className="w-full py-3 btn btn-sm">돌아가기</button>
        </div>
      );
    }
    const item = quizItems[quizIdx];
    if (!item) return null;
    return (
      <div>
        <button onClick={() => { setQuizMode(false); setQuizIdx(0); setQuizResults([]); setQuizFinished(false); }}
          className="font-mono text-sm text-beige-shadow hover:opacity-70 transition-opacity mb-4 inline-block">
          &larr; [오답노트로]
        </button>
        <QuizQuestion question={item.question} options={item.options} correctIndex={item.correctIndex}
          onAnswer={handleQuizAnswer} questionNum={quizIdx + 1} totalQuestions={quizItems.length} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl" style={{ fontWeight: 600 }}>오답노트</h1>
        {entries.length >= 4 && (
          <button onClick={() => setQuizMode(true)} className="btn btn-sm">오답 퀴즈</button>
        )}
      </div>

      {Object.entries(grouped).map(([label, items]) => (
        <section key={label} className="mb-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-beige-shadow mb-3">
            ── {label} ({items.length}개) ──
          </h2>
          <div className="space-y-2">
            {items.map((entry) => (
              <div key={entry.word.id} className="face-front rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif" style={{ fontWeight: 600 }}>{entry.word.word}</span>
                    <span className="sticker-badge text-center px-1.5 py-0.5 rounded-sm" style={{ fontSize: 10 }}>
                      ×{entry.wrongCount}
                    </span>
                  </div>
                  <p className="font-serif text-sm text-beige-shadow mt-0.5">{entry.word.meaning}</p>
                </div>
                <button onClick={() => remove(entry.word.id)} className="shrink-0 ml-3 key px-3 py-1.5 text-xs font-mono">
                  완료
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
