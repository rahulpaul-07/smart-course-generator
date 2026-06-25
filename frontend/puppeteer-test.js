const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Create a CDPSession to get detailed network info including cache status
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  const requests = new Map();

  client.on('Network.requestWillBeSent', (event) => {
    if (event.request.url.includes('/api/courses/mine') || event.request.url.includes('/api/collab/templates')) {
      requests.set(event.requestId, { url: event.request.url, method: event.request.method, reqHeaders: event.request.headers });
      console.log(`\n[Network] -> ${event.request.method} ${event.request.url}`);
      // console.log(`[Request Headers]`, event.request.headers);
    }
  });

  client.on('Network.responseReceived', (event) => {
    const req = requests.get(event.requestId);
    if (req) {
      console.log(`[Network] <- ${event.response.status} ${event.response.url}`);
      console.log(`[From Disk Cache] ${event.response.fromDiskCache}`);
      console.log(`[From Prefetch Cache] ${event.response.fromPrefetchCache}`);
      // console.log(`[Response Headers]`, event.response.headers);
    }
  });

  // Since we don't have an auth token easily, let's just observe if we can bypass auth for testing or log in.
  // Actually, we can just intercept the requests and mock them, OR we can see if it even fires.
  // Wait, if it redirects to login, we can't test it.
  
  // Let's set a mock token
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('token', 'mock_token');
    // Auth bypass for testing purposes might not work if the backend returns 401.
    // But the browser behavior for GET /courses/mine (caching) would still happen regardless of 401!
    // Let's test the react navigation flow.
  });
  
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  
  console.log("\n--- Navigating to Community ---");
  // Assuming Sidebar has a link to community, let's just click it
  const communityLink = await page.$('a[href="/community"]');
  if (communityLink) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      communityLink.click()
    ]);
  } else {
    await page.goto('http://localhost:5173/community', { waitUntil: 'networkidle2' });
  }

  console.log("\n--- Navigating to Course (Mocking Clone) ---");
  // We can't easily mock clone if it fails 401, so let's just navigate manually to simulate the redirect
  await page.evaluate(() => {
    // If the app has window.ReactRouter, we could use it, but let's just click back to dashboard
  });
  await page.goto('http://localhost:5173/course/12345', { waitUntil: 'networkidle2' });

  console.log("\n--- Navigating back to Dashboard ---");
  const dashboardLink = await page.$('a[href="/dashboard"]');
  if (dashboardLink) {
    // Wait for the request!
    await dashboardLink.click();
    await new Promise(r => setTimeout(r, 2000));
  } else {
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  }

  await browser.close();
})();
