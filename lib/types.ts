export interface WordData {
  id: string;
  word: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  questionNumber?: number;
}

export interface ExamInfo {
  year: number;
  month: number;
  grade: number;
  label: string;
}

export interface ExamData {
  exam: ExamInfo;
  words: WordData[];
}

export interface WrongNoteEntry {
  word: WordData;
  wrongCount: number;
  lastWrongDate: string;
  examId: string;
}

export interface UserProgress {
  memorized: Record<string, boolean>;
  wrongNotes: Record<string, WrongNoteEntry>;
}
