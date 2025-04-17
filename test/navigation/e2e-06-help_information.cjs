// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

/**
 * @requirement REQ-NAV-06 User can access a help section for guidance on navigation.
 */
test.describe('REQ-NAV-06 - Help Section Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
    });

    test('should navigate to the help section', async ({ page }) => {
        await page.click('nav >> text=Help');
        await expect(page).toHaveURL('**/help');
    });
});