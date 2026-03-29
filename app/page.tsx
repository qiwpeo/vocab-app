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
        <h1 className="text-3xl font-extrabold gradient-text mb-2">
          모의고사 단어장
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          고1 영어 모의고사 핵심 단어를 학습하세요
        </p>
      </div>
      {years.map((year) => (
        <section key={year} className="mb-8">
          <h2 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3">
            {year}년
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
