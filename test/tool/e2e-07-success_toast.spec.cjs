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

/**
 * @requirement REQ-TOOL-07 On successful creation or update of a tool, a success toast is displayed.
 */
test.describe('REQ-TOOL-07 - Success toast on tool creation', () => {
    test('should display success toast on tool creation', async ({ page }) => {
        const toolName = `ToastTestTool ${Date.now()}`;
        const toolDesc = 'Tool to verify success toast';

        // Ensure on Tools page
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Create new tool
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');
        await page.fill(SELECTORS.TOOL_NAME_INPUT, toolName);
        await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, toolDesc);
        await page.click(SELECTORS.CATEGORY_SELECT_TRIGGER);
        await page.click(getCategoryOptionSelector('General'));
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);

        // Verify success toast
        const toast = await page.waitForSelector(SELECTORS.TOAST_SUCCESS, { timeout: 5000 });
        expect(toast).toBeTruthy();
        expect(await toast.textContent()).toContain('Tool saved successfully');
    });
});