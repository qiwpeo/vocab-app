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

function pickDistractors(word: WordData, allWords: WordData[], count: number): WordData[] {
  const others = allWords.filter((o) => o.id !== word.id);
  const samePOS = shuffle(others.filter((o) => o.pos === word.pos));
  const diffPOS = shuffle(others.filter((o) => o.pos !== word.pos));
  return [...samePOS, ...diffPOS].slice(0, count);
}

function buildQuiz(words: WordData[], allWords: WordData[], mode: QuizMode): QuizItem[] {
  return words.map((w) => {
    const distractors = pickDistractors(w, allWords, 3);
    if (mode === 'en-to-kr') {
      const options = shuffle([w, ...distractors].map((x) => x.meaning));
      return { word: w, question: w.word, options, correctIndex: options.indexOf(w.meaning) };
    } else {
      const options = shuffle([w, ...distractors].map((x) => x.word));
      return { word: w, question: w.meaning, options, correctIndex: options.indexOf(w.word) };
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
    if (count !== 'all') words = words.slice(0, count);
    return buildQuiz(words, examData.words, mode);
  }, [examData, started, scope, count, mode]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      const item = quizItems[currentIdx];
      setResults((prev) => [...prev, { word: item.word, correct }]);
      if (!correct) addWrong(item.word, examId);
      if (currentIdx + 1 >= quizItems.length) setFinished(true);
      else setCurrentIdx((prev) => prev + 1);
    },
    [currentIdx, quizItems, addWrong, examId]
  );

  if (!examData) {
    return (
      <div className="text-center py-12" style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
        [ERROR] 해당 시험을 찾을 수 없습니다.
      </div>
    );
  }

  // Setup screen
  if (!started) {
    return (
      <div className="max-w-lg mx-auto">
        <Link href={`/exam/${examId}`} className="text-sm hover:opacity-70 transition-opacity mb-4 inline-block"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
          &larr; [돌아가기]
        </Link>

        <div className="retro-screen p-5 mb-6">
          <p className="text-xs mb-1" style={{ color: 'var(--crt-green)', fontFamily: 'var(--font-mono)' }}>
            &gt; Quiz Configuration
          </p>
          <p className="text-lg" style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontWeight: 600 }}>
            퀴즈 설정
          </p>
          <p className="text-xs mt-1" style={{ color: '#888', fontFamily: 'var(--font-mono)' }}>
            {examData.exam.label}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
              퀴즈 모드
            </label>
            <div className="flex gap-2">
              {([['en-to-kr', '영 → 한'], ['kr-to-en', '한 → 영']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setMode(v)}
                  className={`flex-1 py-3 text-sm retro-key transition-all ${mode === v ? 'retro-key-active' : ''}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
              출제 범위
            </label>
            <div className="flex gap-2">
              {([['all', '전체 단어'], ['not-memorized', '미암기만']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setScope(v)}
                  className={`flex-1 py-3 text-sm retro-key transition-all ${scope === v ? 'retro-key-active' : ''}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
              문제 수
            </label>
            <div className="flex gap-2">
              {([10, 20, 'all'] as const).map((v) => (
                <button key={String(v)} onClick={() => setCount(v)}
                  className={`flex-1 py-3 text-sm retro-key transition-all ${count === v ? 'retro-key-active' : ''}`}>
                  {v === 'all' ? '전체' : `${v}문제`}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStarted(true)}
            className="w-full py-4 retro-btn rounded-lg text-lg mt-2"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
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
        <div className="retro-screen p-6 text-center mb-6">
          <p className="text-xs mb-2" style={{ color: 'var(--crt-green)', fontFamily: 'var(--font-mono)' }}>
            &gt; Quiz Complete
          </p>
          <div className="text-5xl mb-2" style={{ fontFamily: 'var(--font-mono)', color: score >= 80 ? 'var(--crt-green)' : score >= 50 ? '#F6C829' : '#D83335' }}>
            {score}%
          </div>
          <p className="text-sm" style={{ color: '#888', fontFamily: 'var(--font-mono)' }}>
            {correctCount}/{results.length} correct
          </p>
        </div>

        {wrongWords.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-mono)', color: '#D83335' }}>
              ── 틀린 단어 ({wrongWords.length}개) → 오답노트 ──
            </h2>
            <div className="space-y-2">
              {wrongWords.map(({ word }) => (
                <div key={word.id} className="retro-card rounded p-3 flex items-center gap-3"
                  style={{ borderLeft: '3px solid #D83335' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>{word.word}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)', fontSize: '0.875rem' }}>{word.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { setStarted(false); setFinished(false); setCurrentIdx(0); setResults([]); }}
            className="flex-1 py-3 retro-btn rounded text-sm" style={{ fontFamily: 'var(--font-serif)' }}>
            다시 풀기
          </button>
          <Link href={`/exam/${examId}`}
            className="flex-1 py-3 text-center retro-key rounded text-sm">
            단어장으로
          </Link>
        </div>
      </div>
    );
  }

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
