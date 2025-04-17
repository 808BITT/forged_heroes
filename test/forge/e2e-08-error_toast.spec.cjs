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
    TOAST_ERROR: 'div[data-variant="error"]',
};

/**
 * @requirement REQ-TOOL-08 On failed creation due to validation errors, an error toast is displayed.
 */
test.describe('REQ-TOOL-08 - Error toast on validation failure', () => {
    test('should display error toast with specific messages for validation errors', async ({ page }) => {
        // Ensure on Tools page
        await page.goto(APP_URL);
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Open New Tool form
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');

        // Leave all fields empty and attempt to save
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);

        // Verify error toast is displayed with specific messages
        const toast = await page.waitForSelector(SELECTORS.TOAST_ERROR, { timeout: 5000 });
        expect(toast).toBeTruthy();

        const toastText = await toast.textContent();
        expect(toastText).toContain('Tool name is required');
        expect(toastText).toContain('Tool description is required');
    });
});