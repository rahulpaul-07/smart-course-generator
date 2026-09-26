import { describe, expect, it } from 'vitest';
import { messageFromErrorBody } from '../useApi';

describe('messageFromErrorBody', () => {
  it('reads a string error', () => {
    expect(messageFromErrorBody('{"error":"Course not found"}', 'fallback')).toBe('Course not found');
  });

  // The global error handler nests the message. This used to surface in the
  // UI as "[object Object]".
  it('reads a nested error message', () => {
    const body = JSON.stringify({ success: false, error: { message: 'Forbidden', code: 'FORBIDDEN' } });
    expect(messageFromErrorBody(body, 'fallback')).toBe('Forbidden');
  });

  it('falls back for empty, non-JSON or unrecognised bodies', () => {
    expect(messageFromErrorBody('', 'fallback')).toBe('fallback');
    expect(messageFromErrorBody('<html>Bad gateway</html>', 'fallback')).toBe('fallback');
    expect(messageFromErrorBody('{"error":{}}', 'fallback')).toBe('fallback');
  });
});
