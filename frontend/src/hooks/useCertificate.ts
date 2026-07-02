import { useState, useEffect, useCallback } from 'react';
import { baseURL } from '../utils/api';
import type { Certificate } from '../types';

export function useCertificate(id: string | undefined) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificate = useCallback(() => {
    if (!id) return;
    // Deferred to a microtask so this is a callback invocation from React's
    // perspective (like a promise .then()), not a synchronous setState call
    // within the effect body -- avoids an extra synchronous re-render pass.
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
      fetch(`${baseURL}/certificates/${id}`)
        .then(async res => {
          if (!res.ok) {
            const text = await res.text();
            let msg = "Certificate not found";
            try {
              const json = JSON.parse(text);
              if (json.error) msg = json.error;
            } catch {
              // Response body wasn't valid JSON; fall back to the generic message above.
            }
            throw new Error(msg);
          }
          return res.json();
        })
        .then(data => {
          setCertificate(data);
          setLoading(false);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Failed to load certificate');
          setLoading(false);
        });
    });
  }, [id]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  return { certificate, loading, error, refetch: fetchCertificate };
}
