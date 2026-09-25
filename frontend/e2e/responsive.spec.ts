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

test('mobile menu opens and links to sections', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('#mobile-nav').getByText('Features')).toBeVisible();
});
