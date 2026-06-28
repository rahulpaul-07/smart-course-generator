import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

/**
 * Extracts a normalized error message from an API response.
 */
export function getApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'isDuplicate' in error && error.isDuplicate) {
    return (error as any).message || 'Request already in progress';
  }
  
  if (error instanceof AxiosError) {
    if (error.response?.data?.error) {
      return typeof error.response.data.error === 'string' 
        ? error.response.data.error 
        : JSON.stringify(error.response.data.error);
    }
    return error.message;
  }
  
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Executes an async API promise, automatically catching errors and optionally showing a toast.
 * Returns [data, null] on success, or [null, string] on error.
 */
export async function handleApi<T>(
  promise: Promise<{ data: T }>,
  options?: { showErrorToast?: boolean; fallbackMsg?: string }
): Promise<[T | null, string | null]> {
  try {
    const response = await promise;
    return [response.data, null];
  } catch (error) {
    const errMsg = getApiError(error) || options?.fallbackMsg || 'An error occurred';
    if (options?.showErrorToast) {
      // Don't toast for duplicates as they are handled in interceptor
      if (!((error as any)?.isDuplicate)) {
        toast.error(errMsg);
      }
    }
    return [null, errMsg];
  }
}
