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
    return <div className="text-center py-12 font-mono text-beige-shadow">[ERROR] 해당 시험을 찾을 수 없습니다.</div>;
  }

  // Setup
  if (!started) {
    return (
      <div className="max-w-lg mx-auto">
        <Link href={`/exam/${examId}`} className="font-mono text-sm text-beige-shadow hover:opacity-70 transition-opacity mb-4 inline-block">
          &larr; [돌아가기]
        </Link>

        <div className="crt-flat p-5 mb-6 rounded-sm shadow-screen">
          <p className="text-crt font-mono text-xs mb-1">&gt; Quiz Configuration</p>
          <p className="font-serif text-lg" style={{ color: '#fff', fontWeight: 600 }}>퀴즈 설정</p>
          <p className="font-mono text-xs mt-1" style={{ color: '#888' }}>{examData.exam.label}</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="spec-label block mb-2 font-mono text-beige-shadow">퀴즈 모드</label>
            <div className="flex gap-2">
              {([['en-to-kr', '영 → 한'], ['kr-to-en', '한 → 영']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setMode(v)}
                  className={`flex-1 py-3 text-sm key ${mode === v ? 'key-pressed' : ''}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="spec-label block mb-2 font-mono text-beige-shadow">출제 범위</label>
            <div className="flex gap-2">
              {([['all', '전체 단어'], ['not-memorized', '미암기만']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setScope(v)}
                  className={`flex-1 py-3 text-sm key ${scope === v ? 'key-pressed' : ''}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="spec-label block mb-2 font-mono text-beige-shadow">문제 수</label>
            <div className="flex gap-2">
              {([10, 20, 'all'] as const).map((v) => (
                <button key={String(v)} onClick={() => setCount(v)}
                  className={`flex-1 py-3 text-sm key ${count === v ? 'key-pressed' : ''}`}>
                  {v === 'all' ? '전체' : `${v}문제`}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStarted(true)} className="w-full py-4 btn text-lg mt-2">
            퀴즈 시작
          </button>
        </div>
      </div>
    );
  }

  // Results
  if (finished) {
    const correctCount = results.filter((r) => r.correct).length;
    const wrongWords = results.filter((r) => !r.correct);
    const score = Math.round((correctCount / results.length) * 100);

    return (
      <div className="max-w-lg mx-auto">
        <div className="crt-flat p-6 text-center mb-6 rounded-sm shadow-screen">
          <p className="text-crt font-mono text-xs mb-2">&gt; Quiz Complete</p>
          <div className="font-mono text-5xl mb-2"
            style={{ color: score >= 80 ? 'var(--crt-green)' : score >= 50 ? '#F6C829' : '#D83335',
                     textShadow: score >= 80 ? '0 0 8px rgba(51,255,0,0.4)' : undefined }}>
            {score}%
          </div>
          <p className="font-mono text-sm" style={{ color: '#888' }}>{correctCount}/{results.length} correct</p>
        </div>

        {wrongWords.length > 0 && (
          <div className="mb-6">
            <h2 className="font-mono text-xs uppercase tracking-widest text-error mb-3">
              ── 틀린 단어 ({wrongWords.length}개) → 오답노트 ──
            </h2>
            <div className="space-y-2">
              {wrongWords.map(({ word }) => (
                <div key={word.id} className="face-front rounded p-3 flex items-center gap-3"
                  style={{ borderLeft: '3px solid #D83335' }}>
                  <span className="font-serif" style={{ fontWeight: 600 }}>{word.word}</span>
                  <span className="font-mono text-sm text-beige-shadow">{word.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { setStarted(false); setFinished(false); setCurrentIdx(0); setResults([]); }}
            className="flex-1 py-3 btn btn-sm">다시 풀기</button>
          <Link href={`/exam/${examId}`} className="flex-1 py-3 text-center key rounded text-sm">단어장으로</Link>
        </div>
      </div>
    );
  }

  const item = quizItems[currentIdx];
  if (!item) return null;
  return <QuizQuestion question={item.question} options={item.options} correctIndex={item.correctIndex}
    onAnswer={handleAnswer} questionNum={currentIdx + 1} totalQuestions={quizItems.length} />;
}
