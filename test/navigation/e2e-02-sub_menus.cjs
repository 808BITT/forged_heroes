// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

/**
 * @requirement REQ-NAV-02 User can open submenus from the main menu.
 */
test.describe('REQ-NAV-02 - Submenu Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
    });

    test('should open submenus from the main menu', async ({ page }) => {
        // click the dropdown trigger and iterate all items
        await page.click(`nav >> text=lleros`);
        const submenus = [
            { label: 'Tools', path: '/tools' },
            { label: 'Barracks', path: '/barracks' },
            { label: 'Academy', path: '/academy' },
            { label: 'Armory', path: '/armory' },
            { label: 'Command Center', path: '/command-center' },
        ];
        for (const { label, path } of submenus) {
            await page.click(`nav >> text=${label}`);
            await expect(page).toHaveURL(`${APP_URL}${path}`);
        }
    });
});