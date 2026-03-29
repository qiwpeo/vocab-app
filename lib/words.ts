import { ExamData } from './types';

// Import all word data files statically
// When adding a new exam, add an import here and add it to the examDataMap below
import data202403 from '@/data/words/2024-03-g1.json';
import data202406 from '@/data/words/2024-06-g1.json';
import data202409 from '@/data/words/2024-09-g1.json';
import data202410 from '@/data/words/2024-10-g1.json';
import data202503 from '@/data/words/2025-03-g1.json';
import data202506 from '@/data/words/2025-06-g1.json';
import data202509 from '@/data/words/2025-09-g1.json';
import data202510 from '@/data/words/2025-10-g1.json';

const examDataMap: Record<string, ExamData> = {
  '2024-03-g1': data202403 as ExamData,
  '2024-06-g1': data202406 as ExamData,
  '2024-09-g1': data202409 as ExamData,
  '2024-10-g1': data202410 as ExamData,
  '2025-03-g1': data202503 as ExamData,
  '2025-06-g1': data202506 as ExamData,
  '2025-09-g1': data202509 as ExamData,
  '2025-10-g1': data202510 as ExamData,
};

export function getAllExams(): { id: string; data: ExamData }[] {
  return Object.entries(examDataMap).map(([id, data]) => ({ id, data }));
}

export function getExamById(examId: string): ExamData | null {
  return examDataMap[examId] ?? null;
}

export function getExamIds(): string[] {
  return Object.keys(examDataMap);
}
