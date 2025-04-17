// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Selectors for this test
const SELECTORS = {
    TOOLS_LINK: 'a[href="/tools"]',
    NEW_TOOL_BUTTON: 'a[href="/tools/new"] button',
    SAVE_TOOL_BUTTON: 'button[data-testid="save-tool-button"]',
    ERROR_ALERT: 'div[role="alert"]',
};

/**
 * @requirement REQ-TOOL-02 Tool creation is blocked if the name field is empty.
 */
test.describe('REQ-TOOL-02 - Block creation with empty name', () => {
    test('should display validation error when saving without a name', async ({ page }) => {
        // Navigate to Tools page
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Open New Tool form
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');

        // Leave name empty and fill other required fields
        await page.fill('input#tool-description', 'Only description');
        await page.click('button#category');
        await page.click('div[role="option"]:has-text("General")');

        // Attempt to save
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);

        // Verify validation error is shown and creation is blocked
        const alert = await page.waitForSelector(SELECTORS.ERROR_ALERT);
        expect(await alert.textContent()).toContain('Tool name is required');
        expect(page.url()).toContain('/tools/new');
    });
});