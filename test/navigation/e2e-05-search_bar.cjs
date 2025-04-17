// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

/**
 * @requirement REQ-NAV-05 User can search for specific sections using a search bar.
 */
test.describe('REQ-NAV-05 - Search Bar Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
    });

    test('should search and navigate to specific sections', async ({ page }) => {
        const searchQuery = 'Contact'; // Example search query

        await page.fill('input[placeholder="Search"]', searchQuery);
        await page.press('input[placeholder="Search"]', 'Enter');
        await expect(page).toHaveURL(`**/${searchQuery.toLowerCase()}`);
    });
});