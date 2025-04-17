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
    TOOL_NAME_DISPLAY: 'h1[data-testid="tool-name"]',
    TOOL_DESCRIPTION_DISPLAY: 'p[data-testid="tool-description"]',
    PARAMETER_LIST: 'ul[data-testid="parameter-list"]',
};

const getCategoryOptionSelector = (category) => `div[role="option"]:has-text("${category}")`;
const getToolListCardSelector = (toolName) => `h3:has-text("${toolName}")`;

/**
 * @requirement REQ-TOOL-09 Clicking on a tool in the list opens the detailed tool editor view.
 */
test.describe('REQ-TOOL-09 - Tool navigation to editor view', () => {
    test('should navigate to tools with and without parameters and verify details', async ({ page }) => {
        // Ensure on Tools page
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Ensure 3 tools exist: 2 without params, 1 with params
        const tools = [
            { name: `ToolNoParams1 ${Date.now()}`, desc: 'No parameters tool 1', category: 'General', params: [] },
            {
                name: `ToolWithParams ${Date.now()}`, desc: 'Tool with parameters', category: 'API', params: [
                    { name: 'param1', type: 'string', desc: 'First parameter' },
                ]
            },
            { name: `ToolNoParams2 ${Date.now()}`, desc: 'No parameters tool 2', category: 'CLI', params: [] },
        ];

        // Create tools
        for (const tool of tools) {
            await page.click(SELECTORS.NEW_TOOL_BUTTON);
            await page.waitForURL('**/tools/new');
            await page.fill(SELECTORS.TOOL_NAME_INPUT, tool.name);
            await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, tool.desc);
            await page.click(SELECTORS.CATEGORY_SELECT_TRIGGER);
            await page.click(getCategoryOptionSelector(tool.category));

            for (const param of tool.params) {
                await page.click('button[data-testid="add-parameter-button"]');
                const paramNameInput = await page.locator('input[id^="param-name-"]').last();
                const paramDescInput = await page.locator('input[id^="param-description-"]').last();
                await paramNameInput.fill(param.name);
                await paramDescInput.fill(param.desc);
            }

            await page.click(SELECTORS.SAVE_TOOL_BUTTON);
            await page.waitForSelector('div[data-variant="success"]', { timeout: 5000 });
            await page.waitForURL('**/tools');
        }

        // Navigate to each tool and verify details
        for (const tool of tools) {
            await page.click(getToolListCardSelector(tool.name));
            await page.waitForURL('**/tools/*');

            const toolName = await page.locator(SELECTORS.TOOL_NAME_DISPLAY).textContent();
            const toolDesc = await page.locator(SELECTORS.TOOL_DESCRIPTION_DISPLAY).textContent();
            expect(toolName).toContain(tool.name);
            expect(toolDesc).toContain(tool.desc);

            if (tool.params.length > 0) {
                const paramList = await page.locator(SELECTORS.PARAMETER_LIST);
                expect(await paramList.isVisible()).toBeTruthy();
                for (const param of tool.params) {
                    expect(await paramList.textContent()).toContain(param.name);
                    expect(await paramList.textContent()).toContain(param.desc);
                }
            } else {
                expect(await page.locator(SELECTORS.PARAMETER_LIST).count()).toBe(0);
            }

            // Go back to tools list
            await page.goBack();
            await page.waitForURL('**/tools');
        }
    });
});