const KEY = 'courseai:pending-prompt';

/** Remember a topic typed on the landing page so it survives sign-up. */
export function setPendingPrompt(prompt: string) {
  try {
    sessionStorage.setItem(KEY, prompt.slice(0, 2000));
  } catch {
    // storage unavailable; the user just retypes it
  }
}

/** Read the pending topic once, then forget it. */
export function takePendingPrompt(): string {
  try {
    const value = sessionStorage.getItem(KEY) || '';
    sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return '';
  }
}
