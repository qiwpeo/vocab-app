'use client';

import { useState, useCallback, useEffect } from 'react';
import { getMemorizedMap, toggleMemorized as storageToggle, getMemorizedCount } from '@/lib/storage';

export function useProgress(wordIds: string[]) {
  const [memorized, setMemorized] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMemorized(getMemorizedMap());
  }, []);

  const toggle = useCallback((wordId: string) => {
    const next = storageToggle(wordId);
    setMemorized((prev) => ({ ...prev, [wordId]: next }));
  }, []);

  const memorizedCount = wordIds.filter((id) => memorized[id]).length;

  return { memorized, toggle, memorizedCount };
}

export function useMemorizedCount(wordIds: string[]) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(getMemorizedCount(wordIds));
  }, [wordIds]);
  return count;
}
