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
      const distractors = shuffle(others).slice(0, 3);
      const options = shuffle([w, ...distractors].map((x) => x.meaning));
      return {
        word: w,
        question: w.word,
        options,
        correctIndex: options.indexOf(w.meaning),
      };
    });
  }, [quizMode, entries]);

  const handleQuizAnswer = useCallback(
    (correct: boolean) => {
      const item = quizItems[quizIdx];
      setQuizResults((prev) => [...prev, { word: item.word.word, correct }]);
      if (!correct) {
        const entry = entries.find((e) => e.word.id === item.word.id);
        if (entry) addWrongNote(item.word, entry.examId);
      }
      if (quizIdx + 1 >= quizItems.length) {
        setQuizFinished(true);
      } else {
        setQuizIdx((prev) => prev + 1);
      }
    },
    [quizIdx, quizItems, entries]
  );

  if (entries.length === 0 && !quizMode) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4 opacity-30">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-lg font-medium mb-2">
          오답노트가 비어있습니다
        </p>
        <p className="text-sm text-gray-300 dark:text-gray-600">
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
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
            오답노트 퀴즈 결과
          </h1>
          <div className="text-center py-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <div className="text-6xl font-extrabold text-white mb-1">
              {score}
            </div>
            <p className="text-white/70 text-lg">
              {correctCount} / {quizResults.length} 정답
            </p>
          </div>
          <button
            onClick={() => {
              setQuizMode(false);
              setQuizIdx(0);
              setQuizResults([]);
              setQuizFinished(false);
              refresh();
            }}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200"
          >
            돌아가기
          </button>
        </div>
      );
    }

    const item = quizItems[quizIdx];
    if (!item) return null;

    return (
      <div>
        <button
          onClick={() => {
            setQuizMode(false);
            setQuizIdx(0);
            setQuizResults([]);
            setQuizFinished(false);
          }}
          className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 font-medium mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          오답노트로 돌아가기
        </button>
        <QuizQuestion
          question={item.question}
          options={item.options}
          correctIndex={item.correctIndex}
          onAnswer={handleQuizAnswer}
          questionNum={quizIdx + 1}
          totalQuestions={quizItems.length}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          오답노트
        </h1>
        {entries.length >= 4 && (
          <button
            onClick={() => setQuizMode(true)}
            className="text-sm px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-bold hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all duration-200"
          >
            오답 퀴즈
          </button>
        )}
      </div>

      {Object.entries(grouped).map(([label, items]) => (
        <section key={label} className="mb-6">
          <h2 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3">
            {label} ({items.length}개)
          </h2>
          <div className="space-y-2">
            {items.map((entry) => (
              <div
                key={entry.word.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {entry.word.word}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-full">
                      {entry.wrongCount}회
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {entry.word.meaning}
                  </p>
                </div>
                <button
                  onClick={() => remove(entry.word.id)}
                  className="shrink-0 ml-3 text-xs font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
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
