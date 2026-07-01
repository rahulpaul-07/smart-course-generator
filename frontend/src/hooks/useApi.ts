import { useAuth } from './useAuth';
import { baseURL } from '../utils/api';

interface Auth0LikeError {
  error?: string;
}

function isAuth0LikeError(err: unknown): err is Auth0LikeError {
  return typeof err === 'object' && err !== null && 'error' in err;
}

export function useApi() {
  const { getToken, login } = useAuth();

  const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    let token: string | null = null;
    try {
      token = await getToken();
    } catch (err) {
      console.warn('Failed to get token for API request', err);
      if (isAuth0LikeError(err) && (err.error === 'login_required' || err.error === 'consent_required')) {
        login();
        throw new Error('Session expired. Redirecting to login...');
      }
    }

    const res = await fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (res.status === 401) {
      login();
      throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = errorText || 'API request failed';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) errorMessage = errorJson.error;
      } catch {
        // Fallback to text
      }
      throw new Error(errorMessage);
    }

    // Some endpoints might return empty body (e.g. DELETE or 204 No Content)
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  return fetchApi;
}
