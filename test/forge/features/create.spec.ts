// @ts-check
import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

test.use({
    baseURL: 'https://example.com', // Replace with your base URL
});

const SELECTOR = {
    TOOLS_LINK: 'a[href="/tools"]',
    NEW_TOOL_BUTTON: 'a[href="/tools/new"] button',
    TOOL_NAME_INPUT: 'input#tool-name',
    TOOL_DESCRIPTION_INPUT: 'input#tool-description',
    CATEGORY_SELECT_TRIGGER: 'button#category',
    SAVE_TOOL_BUTTON: 'button[data-testid="save-tool-button"]',
    DELETE_BUTTON: 'button[data-testid="delete-tool-button"]',
    CONFIRM_DELETE_BUTTON: 'button[data-testid="confirm-delete"]',
    TOAST_SUCCESS: 'div[data-variant="success"]',
}

const getListItem = (name) => `h3:has-text("${name}")`;
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
        await page.click(SELECTOR.TOOLS_LINK);
        await page.waitForURL('**/tools');
    });

    await test.step('Open New Tool form', async () => {
        await page.click(SELECTOR.NEW_TOOL_BUTTON);
        await page.waitForURL('**/tools/new');
    });

    await test.step('Fill form fields', async () => {
        await page.fill(SELECTOR.TOOL_NAME_INPUT, tool.name);
        await page.fill(SELECTOR.TOOL_DESCRIPTION_INPUT, tool.description);
        await page.click(SELECTOR.CATEGORY_SELECT_TRIGGER);
        await page.click(getCategoryOption(category));
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
        });
    }

    await test.step('Save the tool', async () => {
        await page.click(SELECTOR.SAVE_TOOL_BUTTON);
        await page.waitForURL('**/tools');
    });
}

test.describe('Tool Creation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tools/new');
    });

    test.afterEach(async ({ page }, testInfo) => {
        const createdName = testInfo.annotations.find(a => a.type === 'toolName')?.description;
        if (!createdName) return;

        // Delete the tool after the test
        await page.goto('/tools');
        await page.click(getListItem(createdName));
        await page.click(SELECTOR.DELETE_BUTTON);
        await page.click(SELECTOR.CONFIRM_DELETE_BUTTON);
        await page.waitForURL('**/tools');
        await page.waitForSelector(SELECTOR.TOAST_SUCCESS, { timeout: 5_000 })
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
        await page.waitForSelector(SELECTOR.TOAST_SUCCESS, { timeout: 5_000 });

        test.info().annotations.push({ type: 'toolName', description: noParamsTool.name });
    });
});
