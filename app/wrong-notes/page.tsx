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

  // Quiz state
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
      <div className="text-center py-16">
        <p className="text-gray-400 dark:text-gray-500 text-lg mb-2">
          오답노트가 비어있습니다
        </p>
        <p className="text-sm text-gray-400">
          퀴즈에서 틀린 단어가 자동으로 추가됩니다.
        </p>
      </div>
    );
  }

  // Quiz mode
  if (quizMode) {
    if (quizFinished) {
      const correctCount = quizResults.filter((r) => r.correct).length;
      return (
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            오답노트 퀴즈 결과
          </h1>
          <div className="text-center py-8">
            <div className="text-5xl font-bold text-blue-500 mb-2">
              {correctCount}/{quizResults.length}
            </div>
          </div>
          <button
            onClick={() => {
              setQuizMode(false);
              setQuizIdx(0);
              setQuizResults([]);
              setQuizFinished(false);
              refresh();
            }}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium"
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
          className="text-sm text-gray-500 mb-4"
        >
          &larr; 오답노트로 돌아가기
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
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          오답노트
        </h1>
        {entries.length >= 4 && (
          <button
            onClick={() => setQuizMode(true)}
            className="text-sm px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            오답 퀴즈
          </button>
        )}
      </div>

      {Object.entries(grouped).map(([label, items]) => (
        <section key={label} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
            {label} ({items.length}개)
          </h2>
          <div className="space-y-2">
            {items.map((entry) => (
              <div
                key={entry.word.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {entry.word.word}
                    </span>
                    <span className="text-xs text-red-500">
                      {entry.wrongCount}회 오답
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.word.meaning}
                  </p>
                </div>
                <button
                  onClick={() => remove(entry.word.id)}
                  className="shrink-0 ml-3 text-xs px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors"
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
