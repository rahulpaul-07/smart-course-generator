import { useState, useEffect } from 'react';
import { baseURL } from '../utils/api';

export function useCertificate(id: string | undefined) {
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificate = () => {
    if (!id) return;
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
          } catch (e) {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then(data => {
        setCertificate(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  return { certificate, loading, error, refetch: fetchCertificate };
}
