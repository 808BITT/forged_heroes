// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Selectors
const SELECTORS = {
    TOOLS_LINK: 'a[href="/tools"]',
    TOOL_LIST: 'div[data-testid="tool-list"]',
};

/**
 * @requirement REQ-TOOL-12 Tool list loads within 500ms under normal conditions (≤ 100 tools).
 */
test.describe('REQ-TOOL-12 - Tool list performance', () => {
    test('should load tool list within 500ms', async ({ page }) => {
        // Ensure on Tools page
        const startTime = Date.now();
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Wait for tool list to load
        await page.waitForSelector(SELECTORS.TOOL_LIST, { timeout: 500 });

        // Verify load time
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThanOrEqual(500);
    });
});