// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Common selectors
const SELECTORS = {
    TOOLS_LINK: 'a[href="/tools"]',
    NEW_TOOL_BUTTON: 'a[href="/tools/new"] button',
    TOOL_NAME_INPUT: 'input#tool-name',
    TOOL_DESCRIPTION_INPUT: 'input#tool-description',
    CATEGORY_SELECT_TRIGGER: 'button#category',
    SAVE_TOOL_BUTTON: 'button[data-testid="save-tool-button"]',
    TOAST_SUCCESS: 'div[data-variant="success"]',
    TOAST_ERROR: 'div[data-variant="error"]',
};

const getCategoryOptionSelector = (category) => `div[role="option"]:has-text("${category}")`;

/**
 * @requirement REQ-TOOL-03 Tool creation is blocked if a duplicate name already exists.
 */
test.describe('REQ-TOOL-03 - Block creation with duplicate names', () => {
    test('should block duplicate name when a tool already exists in list', async ({ page }) => {
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }
        // capture first existing tool name
        const rawName = await page.locator('h3').first().textContent();
        const existingName = (rawName || '').trim();
        // attempt to create with same name
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');
        await page.fill(SELECTORS.TOOL_NAME_INPUT, existingName);
        await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, 'Duplicate attempt');
        await page.click(SELECTORS.CATEGORY_SELECT_TRIGGER);
        await page.click(getCategoryOptionSelector('General'));
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);
        // expect error toast and remain on form
        await page.waitForSelector(SELECTORS.TOAST_ERROR);
        expect(page.url()).toContain('/tools/new');
    });

    test('should block duplicate name after creating a new tool', async ({ page }) => {
        const name = `DupTestTool ${Date.now()}`;
        const desc = 'First creation';
        // create new tool
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');
        await page.fill(SELECTORS.TOOL_NAME_INPUT, name);
        await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, desc);
        await page.click(SELECTORS.CATEGORY_SELECT_TRIGGER);
        await page.click(getCategoryOptionSelector('General'));
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);
        await page.waitForSelector(SELECTORS.TOAST_SUCCESS, { timeout: 5000 });
        // attempt duplicate
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');
        await page.fill(SELECTORS.TOOL_NAME_INPUT, name);
        await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, 'Duplicate second');
        await page.click(SELECTORS.CATEGORY_SELECT_TRIGGER);
        await page.click(getCategoryOptionSelector('General'));
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);
        // expect error toast and still on form
        await page.waitForSelector(SELECTORS.TOAST_ERROR);
        expect(page.url()).toContain('/tools/new');
    });
});