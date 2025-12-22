import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
    consoleErrors.push(error.message);
  });

  // Listen for failed requests
  page.on('requestfailed', request => {
    networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
    console.log('❌ Request Failed:', request.url(), request.failure()?.errorText);
  });

  console.log('Opening http://localhost:3001/onboarding...\n');

  try {
    await page.goto('http://localhost:3001/onboarding', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(3000);

    console.log('\n=== TEST RESULTS ===');
    console.log('Current URL:', page.url());
    console.log('Page Title:', await page.title());
    console.log('Console Errors:', consoleErrors.length);
    console.log('Network Errors:', networkErrors.length);

    if (consoleErrors.length > 0) {
      console.log('\n🔴 Console Errors Found:');
      consoleErrors.forEach(err => console.log('  -', err));
    }

    if (networkErrors.length > 0) {
      console.log('\n🔴 Network Errors Found:');
      networkErrors.forEach(err => console.log('  -', err));
    }

    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('\n✅ No errors detected! Page is working correctly.');
    }

  } catch (error) {
    console.error('\n❌ Navigation Error:', error.message);
  }

  await page.waitForTimeout(5000);
  await browser.close();
})();
