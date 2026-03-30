'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getExamById } from '@/lib/words';
import { useProgress } from '@/hooks/useProgress';
import { getMemorizedMap } from '@/lib/storage';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const POS_LABEL: Record<string, string> = { verb: 'v.', noun: 'n.', adj: 'adj.', adv: 'adv.' };

export default function FlashcardPage() {
  const params = useParams();
  const examId = params.examId as string;
  const examData = getExamById(examId);
  const wordIds = examData?.words.map((w) => w.id) ?? [];
  const { memorized, toggle } = useProgress(wordIds);
  const [scope, setScope] = useState<'all' | 'not-memorized'>('not-memorized');
  const [started, setStarted] = useState(false);

  const cards = useMemo(() => {
    if (!examData || !started) return [];
    let words = examData.words;
    if (scope === 'not-memorized') {
      const mem = getMemorizedMap();
      words = words.filter((w) => !mem[w.id]);
    }
    return shuffle(words);
  }, [examData, started, scope]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const [stats, setStats] = useState({ memorized: 0, skipped: 0 });

  const handleNext = useCallback((direction: 'left' | 'right') => {
    const card = cards[currentIdx];
    if (!card) return;
    if (direction === 'right') {
      if (!memorized[card.id]) toggle(card.id);
      setStats((s) => ({ ...s, memorized: s.memorized + 1 }));
    } else {
      if (memorized[card.id]) toggle(card.id);
      setStats((s) => ({ ...s, skipped: s.skipped + 1 }));
    }
    setExiting(direction);
    setTimeout(() => { setExiting(null); setDragX(0); setFlipped(false); setCurrentIdx((i) => i + 1); }, 250);
  }, [cards, currentIdx, memorized, toggle]);

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; startY.current = e.touches[0].clientY; isHorizontal.current = null; setDragging(true); };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (isHorizontal.current === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    if (isHorizontal.current) { e.preventDefault(); setDragX(dx); }
  };
  const onTouchEnd = () => { setDragging(false); if (Math.abs(dragX) > 80) handleNext(dragX > 0 ? 'right' : 'left'); else setDragX(0); isHorizontal.current = null; };
  const onMouseDown = (e: React.MouseEvent) => { startX.current = e.clientX; setDragging(true); };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging) setDragX(e.clientX - startX.current); };
  const onMouseUp = () => { if (!dragging) return; setDragging(false); if (Math.abs(dragX) > 80) handleNext(dragX > 0 ? 'right' : 'left'); else setDragX(0); };

  if (!examData) return <div className="text-center py-12 font-mono text-beige-shadow">[ERROR] 시험 없음</div>;

  // Setup
  if (!started) {
    const memCount = Object.values(memorized).filter(Boolean).length;
    const notMemCount = examData.words.length - memCount;
    return (
      <div className="max-w-lg mx-auto">
        <Link href={`/exam/${examId}`} className="font-mono text-sm text-beige-shadow hover:opacity-70 transition-opacity mb-4 inline-block">
          &larr; [돌아가기]
        </Link>
        <div className="crt-flat p-5 mb-6 rounded-sm shadow-screen">
          <p className="text-crt font-mono text-xs mb-1">&gt; Flashcard Mode</p>
          <p className="font-serif text-lg" style={{ color: '#fff', fontWeight: 600 }}>플래시카드</p>
          <p className="font-mono text-xs mt-1" style={{ color: '#888' }}>{examData.exam.label}</p>
        </div>
        <div className="space-y-5">
          <div>
            <label className="spec-label block mb-2 font-mono text-beige-shadow">범위</label>
            <div className="flex gap-2">
              {([['not-memorized', `미암기 (${notMemCount})`], ['all', `전체 (${examData.words.length})`]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setScope(v)}
                  className={`flex-1 py-3 text-sm key ${scope === v ? 'key-pressed' : ''}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="face-front rounded-lg p-4">
            <p className="spec-label font-mono text-beige-shadow mb-2">사용법</p>
            <div className="space-y-1.5 font-mono text-sm">
              <p><span className="text-beige-shadow">TAP</span> → 카드 뒤집기</p>
              <p><span className="text-ok">→ SWIPE</span> → 암기 완료</p>
              <p><span className="text-error">← SWIPE</span> → 아직 모름</p>
            </div>
          </div>
          <button onClick={() => setStarted(true)} className="w-full py-4 btn text-lg">시작하기</button>
        </div>
      </div>
    );
  }

  // Done
  if (currentIdx >= cards.length) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="crt-flat p-8 mb-6 rounded-sm shadow-screen">
          <p className="text-crt font-mono text-xs mb-2">&gt; Session Complete</p>
          <div className="font-mono text-5xl mb-4" style={{ color: '#fff' }}>{cards.length}</div>
          <p className="font-mono text-sm mb-4" style={{ color: '#888' }}>cards reviewed</p>
          <div className="flex justify-center gap-8 font-mono text-sm">
            <div><span className="block text-2xl text-ok">{stats.memorized}</span><span style={{ color: '#888' }}>암기</span></div>
            <div><span className="block text-2xl text-error">{stats.skipped}</span><span style={{ color: '#888' }}>미암기</span></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setStarted(false); setCurrentIdx(0); setFlipped(false); setStats({ memorized: 0, skipped: 0 }); }}
            className="flex-1 py-3 btn btn-sm">다시 하기</button>
          <Link href={`/exam/${examId}`} className="flex-1 py-3 text-center key rounded text-sm">단어장으로</Link>
        </div>
      </div>
    );
  }

  const card = cards[currentIdx];
  const rotation = dragX * 0.1;
  const exitTransform = exiting
    ? `translateX(${exiting === 'right' ? 400 : -400}px) rotate(${exiting === 'right' ? 20 : -20}deg)`
    : `translateX(${dragX}px) rotate(${rotation}deg)`;

  return (
    <div className="max-w-lg mx-auto select-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { setStarted(false); setCurrentIdx(0); setFlipped(false); setStats({ memorized: 0, skipped: 0 }); }}
          className="font-mono text-sm text-beige-shadow hover:opacity-70">&larr; [그만하기]</button>
        <span className="font-mono text-sm text-beige-shadow">[{currentIdx + 1}/{cards.length}]</span>
      </div>
      <div className="progress-track w-full h-2 p-0.5 mb-6">
        <div className="progress-fill h-full" style={{ width: `${(currentIdx / cards.length) * 100}%` }} />
      </div>

      <div className="relative flex justify-center items-center" style={{ minHeight: 360 }}>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none font-mono font-bold text-error transition-opacity duration-150"
          style={{ opacity: dragX < -30 ? Math.min(1, (-dragX - 30) / 50) : 0 }}>SKIP</div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none font-mono font-bold text-ok transition-opacity duration-150"
          style={{ opacity: dragX > 30 ? Math.min(1, (dragX - 30) / 50) : 0 }}>OK!</div>

        <div className="w-full cursor-grab active:cursor-grabbing"
          style={{ transform: exitTransform, opacity: exiting ? 0 : Math.max(0, 1 - Math.abs(dragX) / 300),
            transition: exiting || !dragging ? 'all 0.25s ease-out' : 'none' }}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
          onMouseLeave={() => { if (dragging) { setDragging(false); setDragX(0); } }}
          onClick={() => { if (Math.abs(dragX) < 5) setFlipped((f) => !f); }}>

          <div className="face-front rounded-lg min-h-[320px] flex flex-col items-center justify-center text-center p-8"
            style={{ borderColor: dragX > 30 ? 'var(--crt-green)' : dragX < -30 ? '#D83335' : undefined,
                     borderWidth: Math.abs(dragX) > 30 ? 2 : undefined }}>
            {!flipped ? (
              <>
                <span className="font-mono text-xs uppercase tracking-widest text-beige-shadow mb-4">{POS_LABEL[card.pos] ?? card.pos}</span>
                <h2 className="font-serif text-4xl mb-6" style={{ fontWeight: 600 }}>{card.word}</h2>
                <p className="font-mono text-xs text-beige-shadow">[tap to flip]</p>
              </>
            ) : (
              <>
                <span className="font-mono text-xs uppercase tracking-widest text-beige-shadow mb-4">{POS_LABEL[card.pos] ?? card.pos}</span>
                <h2 className="font-serif text-3xl mb-3" style={{ fontWeight: 600 }}>{card.word}</h2>
                <p className="font-serif text-xl mb-4">{card.meaning}</p>
                {card.example && (
                  <div className="crt-flat px-3 py-2 rounded-sm text-xs max-w-xs">
                    <span className="text-crt">&gt; </span><span style={{ color: '#ccc' }}>{card.example}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-6">
        <button onClick={() => handleNext('left')} className="w-14 h-14 rounded key flex items-center justify-center font-mono text-lg text-error">✕</button>
        <button onClick={() => handleNext('right')} className="w-14 h-14 rounded key flex items-center justify-center font-mono text-lg text-ok">✓</button>
      </div>
    </div>
  );
}
