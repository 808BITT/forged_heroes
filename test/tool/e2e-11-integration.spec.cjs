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
    FORGE_MODULE: 'a[href="/forge"]',
    FORGE_TOOL_LIST: 'div[data-testid="forge-tool-list"]',
};

const getCategoryOptionSelector = (category) => `div[role="option"]:has-text("${category}")`;
const getForgeToolSelector = (toolName) => `div[data-testid="forge-tool-list"]:has-text("${toolName}")`;

/**
 * @requirement REQ-TOOL-11 New tools are immediately available for use within the Forge module after creation.
 */
test.describe('REQ-TOOL-11 - Integration with Forge module', () => {
    test('should make new tools immediately available in the Forge module', async ({ page }) => {
        const toolName = `IntegrationTestTool ${Date.now()}`;
        const toolDesc = 'Tool to verify integration with Forge module';

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

        // Navigate to Forge module
        await page.click(SELECTORS.FORGE_MODULE);
        await page.waitForURL('**/forge');

        // Verify tool is available in Forge tool list
        const forgeTool = await page.waitForSelector(getForgeToolSelector(toolName));
        expect(forgeTool).toBeTruthy();
    });
});