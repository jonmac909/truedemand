import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const failedRequests = [];

  page.on('response', async response => {
    if (response.status() >= 400) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
      console.log(`❌ ${response.status()} - ${response.url()}`);
    }
  });

  await page.goto('http://localhost:3001/onboarding', {
    waitUntil: 'networkidle',
    timeout: 10000
  });

  await page.waitForTimeout(2000);

  console.log('\n=== FAILED REQUESTS ===');
  if (failedRequests.length === 0) {
    console.log('✅ No failed requests');
  } else {
    failedRequests.forEach(req => {
      console.log(`${req.status} ${req.statusText}: ${req.url}`);
    });
  }

  await browser.close();
})();
