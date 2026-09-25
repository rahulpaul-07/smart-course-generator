import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setPendingPrompt, takePendingPrompt } from '../pendingPrompt';
import { applyTheme, getStoredTheme, resolveTheme } from '../theme';

describe('pendingPrompt', () => {
  beforeEach(() => sessionStorage.clear());

  it('hands a landing-page topic to the course form exactly once', () => {
    setPendingPrompt('Graph algorithms');
    expect(takePendingPrompt()).toBe('Graph algorithms');
    expect(takePendingPrompt()).toBe('');
  });

  it('caps stored prompts at the API limit', () => {
    setPendingPrompt('x'.repeat(5000));
    expect(takePendingPrompt()).toHaveLength(2000);
  });
});

describe('theme', () => {
  const setSystemDark = (dark: boolean) =>
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: dark && q.includes('dark'), media: q, addEventListener() {}, removeEventListener() {} }));

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to system and ignores garbage in storage', () => {
    localStorage.setItem('theme', 'purple');
    expect(getStoredTheme()).toBe('system');
  });

  it('resolves system against the OS preference', () => {
    setSystemDark(true);
    expect(resolveTheme('system')).toBe('dark');
    setSystemDark(false);
    expect(resolveTheme('system')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });

  it('applies exactly one theme class and persists the preference', () => {
    setSystemDark(false);
    applyTheme('dark');
    applyTheme('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
