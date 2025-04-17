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
};

/**
 * @requirement REQ-TOOL-15 Tool list and forms meet basic accessibility standards (keyboard nav, ARIA labels).
 */
test.describe('REQ-TOOL-15 - Accessibility standards', () => {
    test('should meet basic accessibility standards for tool list and forms', async ({ page }) => {
        // Ensure on Tools page
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Verify tool list is keyboard navigable
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement ? document.activeElement.tagName : null);
        expect(focusedElement).toBe('DIV'); // Assuming tool list is a div

        // Navigate to New Tool form
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');

        // Verify form fields have ARIA labels
        const nameInputAria = await page.getAttribute(SELECTORS.TOOL_NAME_INPUT, 'aria-label');
        const descInputAria = await page.getAttribute(SELECTORS.TOOL_DESCRIPTION_INPUT, 'aria-label');
        expect(nameInputAria).toBeTruthy();
        expect(descInputAria).toBeTruthy();
    });
});