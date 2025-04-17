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
    TOOL_LIST: 'div[data-testid="tool-list"]',
    TOOL_CARD: 'div[data-testid="tool-card"]',
};

const getCategoryOptionSelector = (category) => `div[role="option"]:has-text("${category}")`;

/**
 * @requirement REQ-TOOL-06 Tools are listed in a scrollable UI with their name, type, and parameters displayed on hover.
 */
test.describe('REQ-TOOL-06 - Scrollable tool list with hover details', () => {
    test('should ensure at least 16 tools exist and verify scrollable list with hover details', async ({ page }) => {
        // Ensure on Tools page
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Ensure at least 16 tools exist
        const existingToolCount = await page.locator(SELECTORS.TOOL_CARD).count();
        const toolsToCreate = Math.max(0, 16 - existingToolCount);

        for (let i = 0; i < toolsToCreate; i++) {
            const toolName = `ScrollableTestTool ${Date.now()}-${i}`;
            const toolDesc = `Description for tool ${i}`;

            await page.click(SELECTORS.NEW_TOOL_BUTTON);
            await page.waitForURL('**/tools/new');
            await page.fill(SELECTORS.TOOL_NAME_INPUT, toolName);
            await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, toolDesc);
            await page.click(SELECTORS.CATEGORY_SELECT_TRIGGER);
            await page.click(getCategoryOptionSelector('General'));
            await page.click(SELECTORS.SAVE_TOOL_BUTTON);
            await page.waitForSelector('div[data-variant="success"]', { timeout: 5000 });
            await page.waitForURL('**/tools');
        }

        // Verify the list is scrollable
        const toolList = await page.locator(SELECTORS.TOOL_LIST);
        const isScrollable = await toolList.evaluate((list) => list.scrollHeight > list.clientHeight);
        expect(isScrollable).toBeTruthy();

        // Verify hover details for a tool
        const firstToolCard = await page.locator(SELECTORS.TOOL_CARD).first();
        await firstToolCard.hover();
        const hoverDetails = await firstToolCard.locator('div[data-testid="tool-hover-details"]');
        expect(await hoverDetails.isVisible()).toBeTruthy();
    });
});