'use client';

import { getAllExams } from '@/lib/words';
import ExamCard from '@/components/ExamCard';

export default function HomePage() {
  const exams = getAllExams();

  const grouped = exams.reduce<Record<number, typeof exams>>((acc, exam) => {
    const year = exam.data.exam.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(exam);
    return acc;
  }, {});

  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, letterSpacing: '-1px', lineHeight: 1 }}>
          <span className="block">모의고사</span>
          <span className="block italic">단어장.</span>
        </h1>
        <p className="text-base mt-3" style={{ fontFamily: 'var(--font-serif)', color: '#888', maxWidth: 360 }}>
          고1 영어 모의고사 핵심 단어를 학습하세요.
          단어장, 퀴즈, 플래시카드로 완벽하게.
        </p>
      </div>
      {years.map((year) => (
        <section key={year} className="mb-8">
          <h2 className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--beige-shadow)' }}>
            ── {year}년 ──
          </h2>
          <div className="grid gap-3">
            {grouped[year]
              .sort((a, b) => a.data.exam.month - b.data.exam.month)
              .map((exam) => (
                <ExamCard key={exam.id} examId={exam.id} data={exam.data} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
