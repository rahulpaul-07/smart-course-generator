import { test, expect } from '@playwright/test';

/**
 * Critical journeys against the real API (see playwright.config.ts). Each test
 * starts from a fresh browser context, so sessions never leak between tests.
 */

test.describe('Public pages', () => {
  test('landing page explains the product and routes to sign-up', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Describe a topic');
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
    // Anonymous visitors must not be told their (non-existent) session expired.
    await expect(page.getByText(/session has expired/i)).toHaveCount(0);
  });

  test('a topic typed in the hero survives the sign-up detour', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('What do you want to learn?').fill('Graph algorithms for interviews');
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page).toHaveURL(/\/signup/);
    const stored = await page.evaluate(() => sessionStorage.getItem('courseai:pending-prompt'));
    expect(stored).toBe('Graph algorithms for interviews');
  });

  test('router status and eval scorecard are public', async ({ page }) => {
    await page.goto('/status');
    await expect(page.getByRole('heading', { name: 'AI Router' })).toBeVisible();
    await page.goto('/evals');
    await expect(page).toHaveURL(/\/evals/);
    await expect(page.getByText(/structure/i).first()).toBeVisible();
  });

  test('unknown routes show the 404 page', async ({ page }) => {
    await page.goto('/definitely-not-a-page');
    await expect(page.getByText(/not found|404/i).first()).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('wrong credentials keep you on the login page with an error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Password', { exact: true }).fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('protected routes redirect anonymous visitors to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('signing in returns you to the page that asked for it', async ({ page, playwright, baseURL }) => {
    const email = `e2e-return-${Date.now()}@example.com`;
    // Separate request context: page.request would share the browser's
    // cookies and sign the page in through the refresh cookie.
    const api = await playwright.request.newContext({ baseURL });
    const created = await api.post('/api/auth/register', {
      data: { name: 'Return Learner', email, password: 'password123' },
    });
    expect(created.status()).toBe(201);
    const { token } = await created.json();
    const onboarded = await api.put('/api/user/onboarding', {
      headers: { Authorization: `Bearer ${token}` },
      data: { learningInterests: ['Testing'], skillLevel: 'beginner' },
    });
    expect(onboarded.status()).toBe(200);
    await api.dispose();

    await page.goto('/leaderboard');
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/leaderboard$/);
  });

  test('sign-up creates an account and starts onboarding', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    await page.goto('/signup');
    await page.getByLabel('Full Name').fill('E2E Learner');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/(onboarding|dashboard)/);
  });
});

test.describe('Guest demo', () => {
  test('a guest lands on a dashboard with a ready course and can read a lesson', async ({ page }) => {
    const cspViolations: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /Content Security Policy/i.test(msg.text())) cspViolations.push(msg.text());
    });
    await page.goto('/');
    await page.getByRole('button', { name: /try the demo/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/guest account/i).filter({ visible: true }).first()).toBeVisible();

    await page.goto('/courses');
    await page.getByText('Asynchronous JavaScript', { exact: false }).first().click();
    await expect(page).toHaveURL(/\/course\//);

    await page.getByText('The Event Loop, Macrotasks and Microtasks').first().click();
    await expect(page).toHaveURL(/\/lesson\//);
    await expect(page.getByRole('heading', { name: 'Two queues, one rule' })).toBeVisible();
    expect(cspViolations).toEqual([]);
  });

  // The refresh cookie is SameSite=Strict and scoped to /api/auth. It reaches
  // the API only because the SPA calls it on its own origin (proxied); with
  // the API on another site, every session ended at access-token expiry.
  test('the session can be refreshed from the browser', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /try the demo/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    const status = await page.evaluate(async () => {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      return res.status;
    });
    expect(status).toBe(200);
  });
});

test.describe('Interview session', () => {
  test('is usable at laptop width and submit is reachable from every section', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.getByRole('button', { name: /try the demo/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/interview-prep');
    await page.getByPlaceholder(/Senior Frontend Engineer/i).fill('Frontend engineer');
    await page.getByRole('button', { name: /generate mock/i }).click();
    await expect(page.getByRole('tablist', { name: 'Interview sections' })).toBeVisible({ timeout: 30000 });

    for (const section of ['MCQs', 'Theory', 'Coding']) {
      await page.getByRole('tab', { name: new RegExp(section) }).click();
      await expect(page.getByRole('button', { name: /submit assessment/i })).toBeVisible();
    }

    // The question column used to be squeezed to ~350px by four side-by-side
    // columns, clipping code. It must now get most of the remaining width.
    const width = await page.locator('main main').evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThan(600);
  });
});
