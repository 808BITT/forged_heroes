// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

/**
 * @requirement REQ-NAV-01 User can navigate to different sections of the application using the main menu.
 */
test.describe('REQ-NAV-01 - Main Menu Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
    });

    test('should navigate to different sections using the main menu', async ({ page }) => {
        const navItems = [
            { label: 'Dashboard', path: '/' },
            { label: 'Tool List', path: '/tools' },
            { label: 'New Tool', path: '/tools/new' },
        ];

        for (const { label, path } of navItems) {
            await page.click(`nav >> text=${label}`);
            await expect(page).toHaveURL(`${APP_URL}${path}`);
        }

        // lleros dropdown + sub‑menu
        await page.click(`nav >> text=lleros`);
        const llerosSubItems = [
            { label: 'Tools', path: '/tools' },
            { label: 'Barracks', path: '/barracks' },
            { label: 'Academy', path: '/academy' },
            { label: 'Armory', path: '/armory' },
            { label: 'Command Center', path: '/command-center' },
        ];

        for (const { label, path } of llerosSubItems) {
            await page.click(`nav >> text=${label}`);
            await expect(page).toHaveURL(`${APP_URL}${path}`);
        }
    });
});