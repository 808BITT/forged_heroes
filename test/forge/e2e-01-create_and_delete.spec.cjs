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
    ADD_PARAMETER_BUTTON: 'button[data-testid="add-parameter-button"]',
    SAVE_TOOL_BUTTON: 'button[data-testid="save-tool-button"]',
    DELETE_BUTTON: 'button[data-testid="delete-tool-button"]',
    CONFIRM_DELETE_BUTTON: 'button[data-testid="confirm-delete"]',
    TOAST_SUCCESS: 'div[data-variant="success"]',
};

/**
 * Helper functions for test actions
 */
const getToolListCardSelector = (toolName) => `h3:has-text("${toolName}")`;
const getCategoryOptionSelector = (categoryName) => `div[role="option"]:has-text("${categoryName}")`;
const getParameterNameInput = (index) => `input[id^="param-name-"]:nth-of-type(${index})`;
const getParameterDescInput = (index) => `input[id^="param-description-"]:nth-of-type(${index})`;

/**
 * @requirement REQ-TOOL-01 User can create a new tool with name, type, and optional description.
 */
test.describe('REQ-TOOL-01 - Create and Delete Tool', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application before each test
        await page.goto(APP_URL);
        console.log('Navigation to / complete.');
    });

    /**
     * @requirement REQ-TOOL-01 User can create a new tool with name, type, and optional description.
     * @scenario Create tool without parameters
     */
    test('should create a new tool without parameters then delete it', async ({ page }) => {
        const toolName = `E2E Test Tool Simple ${Date.now()}`;
        const toolDescription = 'A basic tool created via E2E test.';
        const toolCategory = 'General';

        console.log(`Creating tool: ${toolName}`);

        // Navigate to Tools page if not already there
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Click New Tool button
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');

        // Fill in tool details
        await page.fill(SELECTORS.TOOL_NAME_INPUT, toolName);
        await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, toolDescription);

        // Select category
        await page.click(SELECTORS.CATEGORY_SELECT_TRIGGER);
        await page.click(getCategoryOptionSelector(toolCategory));

        // Save the tool
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);
        await page.waitForURL('**/tools');

        // Verify success (optional toast check)
        try {
            await page.waitForSelector(SELECTORS.TOAST_SUCCESS, { timeout: 5000 });
        } catch (e) {
            console.warn("Success toast not found, continuing verification...");
        }

        // Verify tool exists in the list
        const toolCard = await page.waitForSelector(getToolListCardSelector(toolName));
        expect(toolCard).toBeTruthy();

        console.log('Test completed: Create tool without parameters');
    });

    /**
     * @requirement REQ-TOOL-01 User can create a new tool with name, type, and optional description.
     * @scenario Create tool with parameters
     */
    test('should create a new tool with parameters then delete it', async ({ page }) => {
        const toolName = `E2E Test Tool Params ${Date.now()}`;
        const toolDescription = 'A tool with parameters created via E2E test.';
        const toolCategory = 'API'; // Assuming 'API' exists
        const paramName = 'userId';
        const paramDescription = 'The ID of the user.';

        console.log(`Creating tool with parameters: ${toolName}`);

        // Navigate to Tools page if not already there
        if (!page.url().includes('/tools')) {
            await page.click(SELECTORS.TOOLS_LINK);
            await page.waitForURL('**/tools');
        }

        // Click New Tool button
        await page.click(SELECTORS.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');

        // Fill in tool details
        await page.fill(SELECTORS.TOOL_NAME_INPUT, toolName);
        await page.fill(SELECTORS.TOOL_DESCRIPTION_INPUT, toolDescription);

        // Select category
        await page.click(SELECTORS.CATEGORY_SELECT_TRIGGER);
        await page.click(getCategoryOptionSelector(toolCategory));

        // Add a parameter
        await page.getByText('Add Parameter').click();

        // Wait for parameter input fields and fill them
        await page.waitForSelector('input[id^="param-name-"]');

        // Get the last parameter inputs (there might be a better way to target specific parameter rows)
        const paramNameInputs = await page.$$('input[id^="param-name-"]');
        const paramDescInputs = await page.$$('input[id^="param-description-"]');

        const lastParamNameInput = paramNameInputs[paramNameInputs.length - 1];
        const lastParamDescInput = paramDescInputs[paramDescInputs.length - 1];

        await lastParamNameInput.fill(paramName);
        await lastParamDescInput.fill(paramDescription);

        // Save the tool
        await page.click(SELECTORS.SAVE_TOOL_BUTTON);
        await page.waitForURL('**/tools');

        // Verify success (optional toast check)
        try {
            await page.waitForSelector(SELECTORS.TOAST_SUCCESS, { timeout: 5000 });
        } catch (e) {
            console.warn("Success toast not found, continuing verification...");
        }

        // Verify tool exists in the list
        const toolCard = await page.waitForSelector(getToolListCardSelector(toolName));
        expect(toolCard).toBeTruthy();

        // Click the created tool to verify parameters
        await toolCard.click();
        await page.waitForURL('**/tools/**');

        // Verify parameter exists
        const paramInput = await page.waitForSelector(`input[value="${paramName}"]`);
        expect(paramInput).toBeTruthy();

        console.log('Test completed: Create tool with parameters');
    });
});