import { useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

/** Fallback for insecure contexts, where navigator.clipboard is undefined. */
function legacyCopy(value: string): boolean {
  try {
    const el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function useClipboard({ timeout = 2000, successMessage = 'Copied to clipboard!' } = {}) {
  const [hasCopied, setHasCopied] = useState(false);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetRef.current) clearTimeout(resetRef.current);
  }, []);

  const copyToClipboard = useCallback(
    async (value: string) => {
      if (!value) return;

      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
          copied = true;
        }
      } catch {
        copied = false;
      }

      if (!copied) copied = legacyCopy(value);

      if (!copied) {
        toast.error('Failed to copy to clipboard');
        return;
      }

      setHasCopied(true);
      if (successMessage) {
        toast.success(successMessage);
      }

      if (resetRef.current) clearTimeout(resetRef.current);
      resetRef.current = setTimeout(() => setHasCopied(false), timeout);
    },
    [timeout, successMessage]
  );

  return { hasCopied, copyToClipboard };
}
