// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Selectors
const SELECTORS = {
    TOOLS_LINK: 'a[href="/tools"]',
    NEW_TOOL_BUTTON: 'a[href="/tools/new"] button',
    TOOL_NAME_INPUT: 'input#tool-name',
    TOOL_DESCRIPTION_INPUT: 'input#tool-description',
    CATEGORY_SELECT_TRIGGER: 'button#category',
    SAVE_TOOL_BUTTON: 'button[data-testid="save-tool-button"]',
    TOAST_SUCCESS: 'div[data-variant="success"]',
};

const getCategoryOptionSelector = (category) => `div[role="option"]:has-text("${category}")`;
const getToolListCardSelector = (toolName) => `h3:has-text("${toolName}")`;

/**
 * @requirement REQ-TOOL-04 Users can edit an existing tool's name, type, and description.
 */
test.describe('REQ-TOOL-04 - Edit tool and verify persistence', () => {
    test('should create a tool, edit its name and description, and persist changes', async ({ page }) => {
        const originalName = `EditTestTool ${Date.now()}`;
        const originalDesc = 'Original description';
        const updatedName = `${originalName} Updated`;
        const updatedDesc = 'Updated description';

        // Ensure on Tools page
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Create new tool
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');
        await page.fill(SELECTORS.TOOL_NAME_INPUT, originalName);
        await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, originalDesc);
        await page.click(SELECTORS.CATEGORY_SELECT_TRIGGER);
        await page.click(getCategoryOptionSelector('General'));
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);
        await page.waitForSelector(SELECTORS.TOAST_SUCCESS, { timeout: 5000 });
        await page.waitForURL('**/tools');

        // Open created tool for editing
        await page.click(getToolListCardSelector(originalName));
        await page.waitForURL('**/tools/*');

        // Edit name and description
        await page.fill(SELECTORS.TOOL_NAME_INPUT, updatedName);
        await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, updatedDesc);
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);
        await page.waitForSelector(SELECTORS.TOAST_SUCCESS, { timeout: 5000 });
        await page.waitForURL('**/tools');

        // Verify list shows updated values
        const updatedCard = await page.waitForSelector(getToolListCardSelector(updatedName));
        expect(updatedCard).toBeTruthy();
        await expect(page.locator('p', { hasText: updatedDesc })).toBeVisible();
    });
});