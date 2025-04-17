// @ts-check
const { test, expect } = require('@playwright/test');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Selectors
const SELECTORS = {
    TOOLS_LINK: 'a[href="/tools"]',
    TOOL_CARD: 'div[data-testid="tool-card"]',
    SHARED_ICON: 'svg[data-testid="shared-icon"]',
    TOOL_NAME_INPUT: 'input#tool-name',
};

const getToolListCardSelector = (toolName) => `h3:has-text("${toolName}")`;

/**
 * @requirement REQ-TOOL-14 Shared tools display a shared icon and are read-only unless the user has edit permissions.
 */
test.describe('REQ-TOOL-14 - Shared tools behavior', () => {
    test('should display shared icon and enforce read-only mode for shared tools without edit permissions', async ({ page }) => {
        const sharedToolName = 'SharedTool';

        // Ensure on Tools page
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Verify shared tool displays shared icon
        const sharedToolCard = await page.waitForSelector(getToolListCardSelector(sharedToolName));
        expect(sharedToolCard).toBeTruthy();
        const sharedIcon = await sharedToolCard.$(SELECTORS.SHARED_ICON);
        expect(sharedIcon).toBeTruthy();

        // Attempt to edit shared tool
        await sharedToolCard.click();
        await page.waitForURL('**/tools/*');
        const toolNameInput = await page.$(SELECTORS.TOOL_NAME_INPUT);
        expect(toolNameInput).toBeNull(); // Read-only mode enforced
    });
});