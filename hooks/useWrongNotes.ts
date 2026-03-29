'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getWrongNotes,
  addWrongNote as storageAdd,
  removeWrongNote as storageRemove,
} from '@/lib/storage';
import { WrongNoteEntry, WordData } from '@/lib/types';

export function useWrongNotes() {
  const [notes, setNotes] = useState<Record<string, WrongNoteEntry>>({});

  useEffect(() => {
    setNotes(getWrongNotes());
  }, []);

  const add = useCallback((word: WordData, examId: string) => {
    storageAdd(word, examId);
    setNotes(getWrongNotes());
  }, []);

  const remove = useCallback((wordId: string) => {
    storageRemove(wordId);
    setNotes(getWrongNotes());
  }, []);

  const refresh = useCallback(() => {
    setNotes(getWrongNotes());
  }, []);

  return { notes, add, remove, refresh };
}
