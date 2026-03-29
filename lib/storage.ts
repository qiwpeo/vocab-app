import { UserProgress, WrongNoteEntry, WordData } from './types';

const STORAGE_KEY = 'vocab-app-progress';

function getProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return { memorized: {}, wrongNotes: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { memorized: {}, wrongNotes: {} };
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isMemorized(wordId: string): boolean {
  return getProgress().memorized[wordId] ?? false;
}

export function toggleMemorized(wordId: string): boolean {
  const progress = getProgress();
  const next = !progress.memorized[wordId];
  progress.memorized[wordId] = next;
  saveProgress(progress);
  return next;
}

export function getMemorizedMap(): Record<string, boolean> {
  return getProgress().memorized;
}

export function getWrongNotes(): Record<string, WrongNoteEntry> {
  return getProgress().wrongNotes;
}

export function addWrongNote(word: WordData, examId: string) {
  const progress = getProgress();
  const existing = progress.wrongNotes[word.id];
  progress.wrongNotes[word.id] = {
    word,
    wrongCount: (existing?.wrongCount ?? 0) + 1,
    lastWrongDate: new Date().toISOString(),
    examId,
  };
  saveProgress(progress);
}

export function removeWrongNote(wordId: string) {
  const progress = getProgress();
  delete progress.wrongNotes[wordId];
  saveProgress(progress);
}

export function getMemorizedCount(wordIds: string[]): number {
  const memorized = getProgress().memorized;
  return wordIds.filter((id) => memorized[id]).length;
}
