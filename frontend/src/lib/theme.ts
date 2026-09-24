export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

export function getStoredTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {
    // storage blocked (private mode, sandboxed iframe)
  }
  return 'system';
}

export function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Persist and apply a theme preference. The single place that touches the
 * root class list -- this logic used to be written out separately in
 * useAuth and SettingsPage (and inline in index.html for first paint).
 */
export function applyTheme(preference: ThemePreference = getStoredTheme()) {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // non-fatal
  }
  const root = document.documentElement;
  const resolved = resolveTheme(preference);
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}
