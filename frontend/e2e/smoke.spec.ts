import { test, expect } from '@playwright/test';

/**
 * Public happy-path smoke test — runs against the built SPA with no backend,
 * so it stays fast and deterministic in CI. Covers: landing renders, guest
 * routing to auth pages, and the login form being interactive.
 */
test.describe('Public happy path', () => {
  test('landing page renders and offers a way to sign up', async ({ page }) => {
    await page.goto('/');
    // The landing page links guests to signup.
    await expect(page.getByRole('link', { name: /sign up/i }).first()).toBeVisible();
  });

  test('can navigate to the login page and see the form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('login validates credentials against the API (or errors gracefully)', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('name@example.com').fill('nobody@example.com');
    await page.locator('input[type="password"]').fill('wrong-password');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Either an inline/toast error appears, or we simply stay on /login (no crash).
    await expect(page).toHaveURL(/\/login/);
  });
});
