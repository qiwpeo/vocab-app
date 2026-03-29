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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        고1 영어 모의고사 단어장
      </h1>
      {years.map((year) => (
        <section key={year} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
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
