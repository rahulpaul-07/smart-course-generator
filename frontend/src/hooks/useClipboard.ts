import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useClipboard({ timeout = 2000, successMessage = 'Copied to clipboard!' } = {}) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (value: string) => {
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);
        setHasCopied(true);
        if (successMessage) {
          toast.success(successMessage);
        }

        setTimeout(() => {
          setHasCopied(false);
        }, timeout);
      } catch (err) {
        toast.error('Failed to copy to clipboard');
        console.error('Failed to copy: ', err);
      }
    },
    [timeout, successMessage]
  );

  return { hasCopied, copyToClipboard };
}
