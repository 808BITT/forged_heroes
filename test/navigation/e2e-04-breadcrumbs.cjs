// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

/**
 * @requirement REQ-NAV-04 User can see a breadcrumb trail of their navigation path.
 */
test.describe('REQ-NAV-04 - Breadcrumb Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(APP_URL);
    });

    test('should display accurate breadcrumb trail and navigate correctly for /tools/new', async ({ page }) => {
        // Navigate to /tools/new
        await page.goto(`${APP_URL}/tools/new`);

        // Verify breadcrumb trail
        const breadcrumb = await page.locator('nav.breadcrumb');
        const expectedCrumbs = ['Home', 'Tools', 'New'];

        for (const crumb of expectedCrumbs) {
            await expect(breadcrumb).toContainText(crumb);
        }

        // Verify Home and Tools are clickable
        const homeLink = await page.locator('nav.breadcrumb >> text=Home');
        const toolsLink = await page.locator('nav.breadcrumb >> text=Tools');

        await expect(homeLink).toHaveAttribute('href', '/');
        await expect(toolsLink).toHaveAttribute('href', '/tools');

        // Click on Home and verify navigation
        await homeLink.click();
        await expect(page).toHaveURL(`${APP_URL}/`);

        // Navigate back to /tools/new
        await page.goto(`${APP_URL}/tools/new`);

        // Click on Tools and verify navigation
        await toolsLink.click();
        await expect(page).toHaveURL(`${APP_URL}/tools`);
    });
});