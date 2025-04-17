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
    DELETE_BUTTON: 'button[data-testid="delete-tool-button"]',
    CONFIRM_DELETE_BUTTON: 'button[data-testid="confirm-delete"]',
    TOAST_SUCCESS: 'div[data-variant="success"]',
};

const getCategoryOptionSelector = (category) => `div[role="option"]:has-text("${category}")`;
const getToolListCardSelector = (toolName) => `h3:has-text("${toolName}")`;

/**
 * @requirement REQ-TOOL-05 Users can delete an existing tool with a confirmation prompt.
 */
test.describe('REQ-TOOL-05 - Delete tool with confirmation', () => {
    test('should create a tool, delete it, and verify it no longer exists', async ({ page }) => {
        const toolName = `DeleteTestTool ${Date.now()}`;
        const toolDesc = 'Tool to be deleted';

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
        await page.waitForSelector(SELECTORS.TOAST_SUCCESS, { timeout: 5000 });
        await page.waitForURL('**/tools');

        // Verify tool exists in the list
        const toolCard = await page.waitForSelector(getToolListCardSelector(toolName));
        expect(toolCard).toBeTruthy();

        // Open tool and delete it
        await toolCard.click();
        await page.waitForURL('**/tools/*');
        await page.click(SELECTORS.DELETE_BUTTON);
        await page.click(SELECTORS.CONFIRM_DELETE_BUTTON);
        await page.waitForSelector(SELECTORS.TOAST_SUCCESS, { timeout: 5000 });
        await page.waitForURL('**/tools');

        // Verify tool no longer exists in the list
        const deletedTool = await page.$(getToolListCardSelector(toolName));
        expect(deletedTool).toBeNull();
    });
});