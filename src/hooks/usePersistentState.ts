/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * useState wrapper that hydrates from localStorage on mount and writes back
 * whenever the value changes. Mirrors the behaviour previously inlined in
 * App.tsx so consumers do not need to manage useEffect boilerplate.
 */
export function usePersistentState<T>(
  storageKey: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved !== null ? (JSON.parse(saved) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Silently ignore quota/serialisation errors so the UI keeps working.
    }
  }, [storageKey, value]);

  return [value, setValue];
}
