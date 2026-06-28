import { useState, useEffect } from 'react';

export function useFocusMode(initialState: boolean = false) {
  const [isFocusMode, setIsFocusMode] = useState(initialState);

  useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isFocusMode]);

  return { isFocusMode, setIsFocusMode };
}
