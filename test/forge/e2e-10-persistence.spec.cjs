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
    TOOL_CARD: 'div[data-testid="tool-card"]',
};

const getCategoryOptionSelector = (category) => `div[role="option"]:has-text("${category}")`;
const getToolListCardSelector = (toolName) => `h3:has-text("${toolName}")`;

/**
 * @requirement REQ-TOOL-10 Tools are saved to the backend and fetched on reload.
 */
test.describe('REQ-TOOL-10 - Persistence of tools', () => {
    test('should save tools to the backend and fetch them on reload', async ({ page }) => {
        const toolName = `PersistenceTestTool ${Date.now()}`;
        const toolDesc = 'Tool to verify persistence';

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
        await page.waitForSelector('div[data-variant="success"]', { timeout: 5000 });
        await page.waitForURL('**/tools');

        // Verify tool exists in the list
        const toolCard = await page.waitForSelector(getToolListCardSelector(toolName));
        expect(toolCard).toBeTruthy();

        // Reload the page and verify tool still exists
        await page.reload();
        const reloadedToolCard = await page.waitForSelector(getToolListCardSelector(toolName));
        expect(reloadedToolCard).toBeTruthy();
    });
});