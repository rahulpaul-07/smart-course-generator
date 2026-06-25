const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  let getMineReqCount = 0;
  
  client.on('Network.requestWillBeSent', (e) => {
    if (e.request.url.includes('/api/courses/mine')) {
      getMineReqCount++;
      console.log(`\n--- Request #${getMineReqCount}: GET /courses/mine ---`);
      console.log(`[Method] ${e.request.method}`);
      console.log(`[URL] ${e.request.url}`);
      console.log(`[Request Headers] Cache-Control: ${e.request.headers['Cache-Control'] || 'None'}`);
    }
    if (e.request.url.includes('/api/collab/templates')) {
      console.log(`\n--- Request: ${e.request.method} /collab/templates ---`);
    }
  });

  client.on('Network.responseReceived', (e) => {
    if (e.response.url.includes('/api/courses/mine')) {
      console.log(`[Response Status] ${e.response.status}`);
      console.log(`[From Disk Cache] ${e.response.fromDiskCache}`);
      console.log(`[From Prefetch Cache] ${e.response.fromPrefetchCache}`);
      console.log(`[Response Headers] ETag: ${e.response.headers['etag'] || 'None'}, Cache-Control: ${e.response.headers['cache-control'] || 'None'}`);
    }
  });

  client.on('Network.requestServedFromCache', (e) => {
    // This event fires if the browser serves the request from memory cache instead of hitting the network layer
    console.log(`[Network.requestServedFromCache] Request ID: ${e.requestId} was served from Memory/Disk cache without revalidation.`);
  });

  console.log("Navigating to http://localhost:5173 ...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Mock login by injecting token
  await page.evaluate(() => {
    localStorage.setItem('token', 'mocked-jwt-token');
  });

  console.log("Going to Dashboard...");
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  
  console.log("Going to Community...");
  await page.evaluate(() => {
    window.history.pushState({}, '', '/community');
    window.dispatchEvent(new Event('popstate'));
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log("Navigating back to Dashboard (simulating Link click)...");
  await page.evaluate(() => {
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new Event('popstate'));
  });
  await new Promise(r => setTimeout(r, 2000));

  await browser.close();
  console.log("Test finished.");
})();
