'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo, useCallback } from 'react';
import { getExamById } from '@/lib/words';
import { WordData } from '@/lib/types';
import QuizQuestion from '@/components/QuizQuestion';
import { useWrongNotes } from '@/hooks/useWrongNotes';
import { getMemorizedMap } from '@/lib/storage';
import Link from 'next/link';

type QuizMode = 'en-to-kr' | 'kr-to-en';
type WordScope = 'all' | 'not-memorized';
type QuestionCount = 10 | 20 | 'all';

interface QuizItem {
  word: WordData;
  question: string;
  options: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(
  words: WordData[],
  allWords: WordData[],
  mode: QuizMode
): QuizItem[] {
  return words.map((w) => {
    const others = allWords.filter((o) => o.id !== w.id);
    const distractors = shuffle(others).slice(0, 3);

    if (mode === 'en-to-kr') {
      const options = shuffle([w, ...distractors].map((x) => x.meaning));
      return {
        word: w,
        question: w.word,
        options,
        correctIndex: options.indexOf(w.meaning),
      };
    } else {
      const options = shuffle([w, ...distractors].map((x) => x.word));
      return {
        word: w,
        question: w.meaning,
        options,
        correctIndex: options.indexOf(w.word),
      };
    }
  });
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const examData = getExamById(examId);

  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<QuizMode>('en-to-kr');
  const [scope, setScope] = useState<WordScope>('all');
  const [count, setCount] = useState<QuestionCount>('all');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<{ word: WordData; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const { add: addWrong } = useWrongNotes();

  const quizItems = useMemo(() => {
    if (!examData || !started) return [];
    let words = examData.words;
    if (scope === 'not-memorized') {
      const mem = getMemorizedMap();
      words = words.filter((w) => !mem[w.id]);
    }
    words = shuffle(words);
    if (count !== 'all') {
      words = words.slice(0, count);
    }
    return buildQuiz(words, examData.words, mode);
  }, [examData, started, scope, count, mode]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      const item = quizItems[currentIdx];
      setResults((prev) => [...prev, { word: item.word, correct }]);
      if (!correct) {
        addWrong(item.word, examId);
      }
      if (currentIdx + 1 >= quizItems.length) {
        setFinished(true);
      } else {
        setCurrentIdx((prev) => prev + 1);
      }
    },
    [currentIdx, quizItems, addWrong, examId]
  );

  if (!examData) {
    return (
      <div className="text-center py-12 text-gray-500">
        해당 시험을 찾을 수 없습니다.
      </div>
    );
  }

  // Setup screen
  if (!started) {
    return (
      <div className="max-w-lg mx-auto">
        <Link href={`/exam/${examId}`} className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 mb-4 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          돌아가기
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
          퀴즈 설정
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
          {examData.exam.label}
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              퀴즈 모드
            </label>
            <div className="flex gap-2">
              {([['en-to-kr', '영 → 한'], ['kr-to-en', '한 → 영']] as const).map(
                ([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setMode(v)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      mode === v
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    {l}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              출제 범위
            </label>
            <div className="flex gap-2">
              {([['all', '전체 단어'], ['not-memorized', '미암기만']] as const).map(
                ([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setScope(v)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      scope === v
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    {l}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              문제 수
            </label>
            <div className="flex gap-2">
              {([10, 20, 'all'] as const).map((v) => (
                <button
                  key={String(v)}
                  onClick={() => setCount(v)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    count === v
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                      : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                  }`}
                >
                  {v === 'all' ? '전체' : `${v}문제`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all duration-200 mt-2"
          >
            퀴즈 시작
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (finished) {
    const correctCount = results.filter((r) => r.correct).length;
    const wrongWords = results.filter((r) => !r.correct);
    const score = Math.round((correctCount / results.length) * 100);

    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
          퀴즈 결과
        </h1>
        <div className="text-center py-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 mb-6">
          <div className="text-6xl font-extrabold text-white mb-1">
            {score}
          </div>
          <p className="text-white/70 text-lg">
            {correctCount} / {results.length} 정답
          </p>
        </div>

        {wrongWords.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-rose-500 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              틀린 단어 ({wrongWords.length}개) — 오답노트에 추가됨
            </h2>
            <div className="space-y-2">
              {wrongWords.map(({ word }) => (
                <div
                  key={word.id}
                  className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 rounded-xl"
                >
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {word.word}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    {word.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setStarted(false);
              setFinished(false);
              setCurrentIdx(0);
              setResults([]);
            }}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200"
          >
            다시 풀기
          </button>
          <Link
            href={`/exam/${examId}`}
            className="flex-1 py-3 text-center bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
          >
            단어장으로
          </Link>
        </div>
      </div>
    );
  }

  // Quiz screen
  const item = quizItems[currentIdx];
  if (!item) return null;

  return (
    <QuizQuestion
      question={item.question}
      options={item.options}
      correctIndex={item.correctIndex}
      onAnswer={handleAnswer}
      questionNum={currentIdx + 1}
      totalQuestions={quizItems.length}
    />
  );
}
