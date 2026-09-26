import { authFetch } from '../utils/api';

/** Pull a readable message out of either error shape the API returns. */
export function messageFromErrorBody(text: string, fallback: string): string {
  if (!text) return fallback;
  try {
    const body = JSON.parse(text) as { error?: unknown; message?: unknown };
    if (typeof body.error === 'string' && body.error) return body.error;
    if (body.error && typeof body.error === 'object') {
      const nested = (body.error as { message?: unknown }).message;
      if (typeof nested === 'string' && nested) return nested;
    }
    if (typeof body.message === 'string' && body.message) return body.message;
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * JSON fetch with the app's auth contract (Bearer token, cookies, one
 * transparent refresh-and-retry on 401 via authFetch).
 *
 * This used to call `login()` with no arguments on any 401, which cleared the
 * user and logged them out instead of refreshing the session.
 */
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const res = await authFetch(endpoint, options);

  if (res.status === 401) {
    // authFetch already tried a refresh and announced the expiry.
    throw new Error('Your session has expired. Please log in again.');
  }

  if (!res.ok) {
    throw new Error(messageFromErrorBody(await res.text(), 'API request failed'));
  }

  // Some endpoints return an empty body (DELETE, 204).
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function useApi() {
  return fetchApi;
}
