// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

/**
 * @requirement REQ-NAV-03 User can use keyboard shortcuts to navigate between sections.
 */
test.describe('REQ-NAV-03 - Keyboard Shortcuts Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
    });

    test('should navigate between sections using keyboard shortcuts', async ({ page }) => {
        const shortcuts = {
            'Dashboard': 'Alt+1',
            'Tools': 'Alt+2',
            'Contact': 'Alt+3'
        };

        for (const [section, shortcut] of Object.entries(shortcuts)) {
            await page.keyboard.press(shortcut);
            await expect(page).toHaveURL(`**/${section.toLowerCase()}`);
        }
    });
});