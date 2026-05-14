const assert = require('assert');
const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  try {
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
    await assertVisibleText(page, 'Circuit Hero');

    await page.click('#tryDemoLink');
    await page.waitForURL(/mission-briefing\.html\?level=1-1/);
    await assertVisibleText(page, 'First Light');

    await page.goto('http://127.0.0.1:3000/story-map.html', { waitUntil: 'networkidle' });
    await page.locator('.tab-item[data-target="workbench.html?level=sandbox"]').click();
    await page.waitForURL(/workbench\.html\?level=sandbox/);
    await assertVisibleText(page, 'Sandbox Lab');
    await assertVisibleText(page, 'LAB');

    await page.goto('http://127.0.0.1:3000/story-map.html', { waitUntil: 'networkidle' });
    await page.locator('.tab-item[data-target="profile.html"]').click();
    await page.waitForURL(/profile\.html/);
    await assertVisibleText(page, 'Learning Progress');
    await assertVisibleText(page, 'Badges');

    await page.click('#encyclopediaBtn');
    await assertVisibleText(page, 'Component Encyclopedia');
    await assertVisibleText(page, 'Battery');
  } finally {
    await browser.close();
  }

  console.log('e2e flow passed');
}

async function assertVisibleText(page, text) {
  const locator = page.getByText(text, { exact: false }).first();
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  assert.ok(await locator.isVisible());
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
