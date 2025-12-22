import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/onboarding...');

  try {
    // Set a timeout for navigation
    await page.goto('http://localhost:3000/onboarding', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    console.log('✅ Page loaded successfully!');
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());

    // Take screenshot
    await page.screenshot({ path: 'onboarding-screenshot.png' });
    console.log('Screenshot saved to onboarding-screenshot.png');

    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser console error:', msg.text());
      }
    });

    // Check page content
    const bodyText = await page.textContent('body');
    console.log('Page has content:', bodyText?.length > 0);

  } catch (error) {
    console.error('❌ Error loading page:', error.message);

    // Try to get console logs
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.screenshot({ path: 'onboarding-error.png' });
    console.log('Error screenshot saved to onboarding-error.png');
  }

  await browser.close();
})();
