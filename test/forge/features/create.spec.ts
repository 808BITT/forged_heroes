// @ts-check
import { expect, Page, test } from '@playwright/test';

const SELECTOR = {
    LLERO_NAVBAR: 'button:text("llero")',
    TOOLS_LINK: 'a[href="/tools"]',
    NEW_TOOL_BUTTON: 'a[href="/tools/new"] button',
    TOOL_NAME_INPUT: 'input#tool-name',
    TOOL_DESCRIPTION_INPUT: 'input#tool-description',
    CATEGORY_SELECT_TRIGGER: 'button#category',
    SAVE_TOOL_BUTTON: 'button[data-testid="save-tool-button"]',
    DELETE_BUTTON: 'button:text("Delete")',
    DELETE_CONFIRMATION: 'div[role="dialog"]',
    TOAST_SUCCESS: 'strong:text("Success")',
    TOAST_ERROR: 'strong:text("Error")',
}

const getListItem = (name) => `h3:text("${name}")`;
const getCategoryOption = (cat) => `div[role="option"]:has-text("${cat}")`;

interface ToolParams {
    name: string;
    description: string;
}

interface CreateToolOptions {
    tool: ToolParams;
    category: string;
    withParams?: ToolParams | null;
}

async function createTool(page: Page, { tool, category, withParams = null }: CreateToolOptions): Promise<void> {
    await test.step('Navigate to Tools list', async () => {
        await page.click(SELECTOR.LLERO_NAVBAR);
        await page.waitForSelector(SELECTOR.TOOLS_LINK);
        await page.click(SELECTOR.TOOLS_LINK);
        await page.waitForURL('**/tools');
        console.log('Navigated to Tools list');
    });

    await test.step('Open New Tool form', async () => {
        await page.click(SELECTOR.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');
        console.log('Opened New Tool editor');
    });

    await test.step('Fill form fields', async () => {
        await page.fill(SELECTOR.TOOL_NAME_INPUT, tool.name);
        await page.fill(SELECTOR.TOOL_DESCRIPTION_INPUT, tool.description);
        await page.click(SELECTOR.CATEGORY_SELECT_TRIGGER);
        await page.click(getCategoryOption(category));
        console.log('Filled form fields');
    });

    if (withParams) {
        await test.step('Add a parameter', async () => {
            await page.click('button[data-testid="add-parameter-button"]');
            // assume exactly one new row appended at the end
            const nameInputs = await page.$$(`input[id^="param-name-"]`);
            const descInputs = await page.$$(`input[id^="param-description-"]`);
            const last = nameInputs.length - 1;
            await nameInputs[last].fill(withParams.name);
            await descInputs[last].fill(withParams.description);
            console.log('Filled parameter fields');
        });
    }

    await test.step('Save the tool', async () => {
        await page.click(SELECTOR.SAVE_TOOL_BUTTON);
        await page.waitForURL('**/tools');
        console.log('Saved the tool');
    });
}

test.describe('Tool Creation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector(SELECTOR.LLERO_NAVBAR);
        console.log('Navigated to home page');
    });

    test.afterEach(async ({ page }, testInfo) => {
        const createdName = testInfo.annotations.find(a => a.type === 'toolName')?.description;
        if (!createdName) return;

        // Delete the tool after the test
        await page.goto('/tools');
        await page.click(getListItem(createdName));
        await page.click(SELECTOR.DELETE_BUTTON);
        await page.click(SELECTOR.DELETE_CONFIRMATION);
        await page.waitForURL('**/tools');
        await page.waitForSelector(SELECTOR.TOAST_SUCCESS)
            .catch(() => { /* silent */ });
        await expect(page.locator(getListItem(createdName))).toHaveCount(0);
    });

    test("it will allow tools to be created with no parameters", async ({ page }) => {
        const noParamsTool = {
            name: "Test Tool " + Date.now(),
            description: "This tool has no parameters.",
        };
        await createTool(page, {
            tool: noParamsTool,
            category: "General",
            withParams: null,
        });
        await page.waitForSelector(SELECTOR.TOAST_SUCCESS, { timeout: 5000 });
        await expect(page.locator(getListItem(noParamsTool.name))).toHaveCount(1);
        await expect(page.locator(getListItem(noParamsTool.name))).toHaveText(noParamsTool.name);
        await expect(page.locator(getListItem(noParamsTool.name)).locator('p')).toHaveText(noParamsTool.description);
        console.log('Tool created successfully with no parameters');
        test.info().annotations.push({ type: 'toolName', description: noParamsTool.name });
    });
});
