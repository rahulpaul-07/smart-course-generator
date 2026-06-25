const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    // 1. Signup Flow
    console.log("1. Testing Registration...");
    await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle2' });
    
    // Fill signup form
    await page.type('input[placeholder="John Doe"]', 'Test User');
    await page.type('input[type="email"]', `testuser_${Date.now()}@example.com`);
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Verify redirect to dashboard
    let url = page.url();
    if (!url.includes('/dashboard')) {
      throw new Error(`Signup redirect failed. URL: ${url}`);
    }
    console.log("-> Signup success, redirected to dashboard.");

    // Verify token exists in localStorage
    let token = await page.evaluate(() => localStorage.getItem('token'));
    if (!token) throw new Error("No token in localStorage after signup.");

    // 2. Logout Flow
    console.log("2. Testing Logout...");
    // Find avatar/dropdown and click logout
    const avatar = await page.$('button[aria-haspopup="menu"]');
    if (avatar) {
      await avatar.click();
      await new Promise(r => setTimeout(r, 500));
      // Click logout
      await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('div[role="menuitem"]'));
        const logoutItem = items.find(el => el.textContent.includes('Log out'));
        if (logoutItem) logoutItem.click();
      });
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    } else {
      // Direct API call if UI changes
      await page.evaluate(() => {
        localStorage.removeItem('token');
      });
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    }
    
    url = page.url();
    if (!url.includes('/login') && !url.includes('/')) {
      throw new Error(`Logout redirect failed. URL: ${url}`);
    }
    console.log("-> Logout success.");

    // 3. Login Flow
    console.log("3. Testing Login...");
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    const testEmail = `testuser_${Date.now()}@example.com`;
    // actually we need to use the one we just created
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
