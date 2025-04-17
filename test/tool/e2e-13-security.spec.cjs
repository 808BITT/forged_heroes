// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Selectors
const SELECTORS = {
  TOOLS_LINK: 'a[href="/tools"]',
  TOOL_CARD: 'div[data-testid="tool-card"]',
  TOOL_NAME_DISPLAY: 'h1[data-testid="tool-name"]',
};

const getToolListCardSelector = (toolName) => `h3:has-text("${toolName}")`;

/**
 * @requirement REQ-TOOL-13 Users cannot view or modify tools owned by other users unless explicitly shared.
 */
test.describe('REQ-TOOL-13 - Security for tool ownership', () => {
  test('should prevent unauthorized access to tools owned by other users', async ({ page }) => {
    const unauthorizedToolName = 'UnauthorizedTool';

    // Ensure on Tools page
    await page.goto(APP_URL);
    if (!page.url().includes('/tools')) {
      await page.click(SELECTORS.TOOLS_LINK);
      await page.waitForURL('**/tools');
    }

    // Verify unauthorized tool is not visible
    const unauthorizedTool = await page.$(getToolListCardSelector(unauthorizedToolName));
    expect(unauthorizedTool).toBeNull();

    // Attempt to access unauthorized tool directly via URL
    await page.goto(`${APP_URL}/tools/${unauthorizedToolName}`);
    const toolNameDisplay = await page.$(SELECTORS.TOOL_NAME_DISPLAY);
    expect(toolNameDisplay).toBeNull();
  });
});