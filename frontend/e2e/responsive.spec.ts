import { test, expect } from '@playwright/test';

/** Layout checks on a phone-sized viewport. */
for (const path of ['/', '/login', '/signup', '/status']) {
  test(`${path} has no horizontal scroll on mobile`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('signed-in pages have no horizontal scroll on mobile', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /try the demo/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  const overflowOn = async (path: string) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  };

  for (const path of ['/dashboard', '/courses', '/analytics', '/interview-prep', '/roadmaps']) {
    expect(await overflowOn(path), path).toBeLessThanOrEqual(0);
  }

  // The seeded course and its first lesson: long titles and code blocks.
  await page.goto('/courses');
  await page.getByText('Asynchronous JavaScript', { exact: false }).first().click();
  await expect(page).toHaveURL(/\/course\//);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), 'course').toBeLessThanOrEqual(0);

  await page.getByText('The Event Loop, Macrotasks and Microtasks').first().click();
  await expect(page).toHaveURL(/\/lesson\//);
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), 'lesson').toBeLessThanOrEqual(0);
});

test('mobile menu opens and links to sections', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('#mobile-nav').getByText('Features')).toBeVisible();
});
