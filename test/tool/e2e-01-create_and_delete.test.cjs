const puppeteer = require('puppeteer');
const path = require('path');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173'; // Adjust if your dev server runs elsewhere
const TIMEOUT = 30000; // 30 seconds timeout for operations

// Selectors (adjust if your component structure changes)
const TOOLS_LINK_SELECTOR = 'a[href="/tools"]';
const NEW_TOOL_BUTTON_SELECTOR = 'a[href="/tools/new"] button'; // More specific selector
const TOOL_NAME_INPUT_SELECTOR = 'input#tool-name';
const TOOL_DESCRIPTION_INPUT_SELECTOR = 'input#tool-description';
const CATEGORY_SELECT_TRIGGER_SELECTOR = 'button#category'; // Assuming the trigger has id="category"
const CATEGORY_OPTION_SELECTOR = (categoryName) => `//div[@role="option"][normalize-space()="${categoryName}"]`; // Updated to use XPath for better accuracy
const ADD_PARAMETER_BUTTON_SELECTOR = 'button:contains("Add Parameter")'; // Adjust if needed
const PARAM_NAME_INPUT_SELECTOR = (paramId) => `input#param-name-${paramId}`; // Example, adjust based on actual implementation
const PARAM_DESCRIPTION_INPUT_SELECTOR = (paramId) => `input#param-description-${paramId}`; // Example, adjust based on actual implementation
const SAVE_TOOL_BUTTON_SELECTOR = 'button[data-testid="save-tool-button"]';
const TOOL_LIST_CARD_SELECTOR = (toolName) => `h3:contains("${toolName}")`; // Selector for the created tool card in the list
const TOAST_SUCCESS_SELECTOR = 'div[data-variant="success"]'; // Selector for success toast

// Viewports
const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 667, isMobile: true },
};

console.log('Starting E2E test suite for REQ-TOOL-01');

describe('E2E: REQ-TOOL-01 - Create Tool', () => {
  let browser;
  let page;

  beforeAll(async () => {
    console.log('Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: process.env.CI ? true : false, // Run headless in CI, headed locally for debugging
      slowMo: process.env.CI ? 0 : 50, // Slow down locally for observation
    });
    console.log('Browser launched.');
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    page.setDefaultTimeout(TIMEOUT);
    console.log('Navigating to Tools page...');
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    console.log('Navigation complete.');
  });

  afterEach(async () => {
    await page.close();
  });

  // Loop through defined viewports
  Object.entries(viewports).forEach(([viewportName, viewportConfig]) => {
    describe(`on ${viewportName} viewport`, () => {
      beforeEach(async () => {
        await page.setViewport(viewportConfig);
      });

      /**
       * @requirement REQ-TOOL-01 User can create a new tool with name, type, and optional description.
       * @scenario Create tool without parameters
       */
      /**
       * @requirement REQ-TOOL-01
       */
      it('should create a new tool without parameters', async () => {
        console.log('Starting test: Create tool without parameters');
        const toolName = `E2E Test Tool Simple ${viewportName} ${Date.now()}`;
        const toolDescription = 'A basic tool created via E2E test.';
        const toolCategory = 'General'; // Assuming 'General' exists

        console.log(`Tool name: ${toolName}`);

        // 1. Navigate to Tools page (if not already there)
        // Check if we are on the tools page, if not navigate
        if (!page.url().includes('/tools')) {
            await page.waitForSelector(TOOLS_LINK_SELECTOR);
            await page.click(TOOLS_LINK_SELECTOR);
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }

        // 2. Click "New Tool"
        await page.waitForSelector(NEW_TOOL_BUTTON_SELECTOR);
        await page.click(NEW_TOOL_BUTTON_SELECTOR);
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForSelector(TOOL_NAME_INPUT_SELECTOR); // Wait for editor to load

        // 3. Fill in details
        console.log('Filling in tool details...');
        await page.type(TOOL_NAME_INPUT_SELECTOR, toolName);
        console.log('Tool name entered.');
        await page.type(TOOL_DESCRIPTION_INPUT_SELECTOR, toolDescription);

        // 4. Select Category (adjust selectors based on your Select component)
        await page.click(CATEGORY_SELECT_TRIGGER_SELECTOR);
        // This part is highly dependent on the Select component implementation
        // Using a simple text-based selector here, might need adjustment
        const categoryOptionSelector = CATEGORY_OPTION_SELECTOR(toolCategory); // Use the defined selector function
        await page.waitForXPath(categoryOptionSelector);
        const [categoryOption] = await page.$x(categoryOptionSelector);
        await categoryOption.click();


        // 5. Click Save
        await page.click(SAVE_TOOL_BUTTON_SELECTOR);

        // 6. Verify navigation back to /tools and success toast/tool presence
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        expect(page.url()).toContain('/tools');

        // Optionally wait for and check success toast
        try {
            await page.waitForSelector(TOAST_SUCCESS_SELECTOR, { timeout: 5000 }); // Wait briefly for toast
        } catch (e) {
            console.warn("Success toast not found, continuing verification...");
        }

        // Verify the tool card exists in the list
        await page.waitForSelector(TOOL_LIST_CARD_SELECTOR(toolName));
        const toolCard = await page.$(TOOL_LIST_CARD_SELECTOR(toolName));
        expect(toolCard).toBeTruthy();

        console.log('Test completed: Create tool without parameters');
      });

      /**
       * @requirement REQ-TOOL-01 User can create a new tool with name, type, and optional description.
       * @scenario Create tool with parameters
       */
      /**
       * @requirement REQ-TOOL-01
       */
      it('should create a new tool with parameters', async () => {
        console.log('Starting test: Create tool with parameters');
        const toolName = `E2E Test Tool Params ${viewportName} ${Date.now()}`;
        const toolDescription = 'A tool with parameters created via E2E test.';
        const toolCategory = 'API'; // Assuming 'API' exists
        const paramName = 'userId';
        const paramDescription = 'The ID of the user.';

        console.log(`Tool name: ${toolName}`);

        // 1. Navigate to Tools page
         if (!page.url().includes('/tools')) {
            await page.waitForSelector(TOOLS_LINK_SELECTOR);
            await page.click(TOOLS_LINK_SELECTOR);
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }

        // 2. Click "New Tool"
        await page.waitForSelector(NEW_TOOL_BUTTON_SELECTOR);
        await page.click(NEW_TOOL_BUTTON_SELECTOR);
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForSelector(TOOL_NAME_INPUT_SELECTOR);

        // 3. Fill in basic details
        await page.type(TOOL_NAME_INPUT_SELECTOR, toolName);
        await page.type(TOOL_DESCRIPTION_INPUT_SELECTOR, toolDescription);

        // 4. Select Category
        await page.click(CATEGORY_SELECT_TRIGGER_SELECTOR);
        const categoryOptionSelector = `//div[@role="option"][normalize-space()="${toolCategory}"]`; // XPath example
        await page.waitForXPath(categoryOptionSelector);
        const [categoryOption] = await page.$x(categoryOptionSelector);
        await categoryOption.click();

        // 5. Add a Parameter
        console.log('Adding parameters...');
        await page.waitForSelector(ADD_PARAMETER_BUTTON_SELECTOR);
        await page.click(ADD_PARAMETER_BUTTON_SELECTOR);
        console.log('Parameter added.');

        // Wait for the parameter editor section to appear/update
        // Need a reliable selector for the newly added parameter section
        // Let's assume the first parameter gets an ID like 'p<timestamp>' or similar
        // We might need to find the *last* parameter input added.
        // This part is fragile and depends heavily on ToolEditor implementation.
        // A more robust way would be to add data-testid attributes to parameter rows/inputs.
        await page.waitForSelector(`input[id^="param-name-"]`, { timeout: 5000 }); // Wait for parameter input to appear

        // Find the input fields for the *last* added parameter
        const paramNameInputs = await page.$$('input[id^="param-name-"]');
        const paramDescInputs = await page.$$('input[id^="param-description-"]');

        if (paramNameInputs.length > 0 && paramDescInputs.length > 0) {
            const lastParamNameInput = paramNameInputs[paramNameInputs.length - 1];
            const lastParamDescInput = paramDescInputs[paramDescInputs.length - 1];
            await lastParamNameInput.type(paramName);
            await lastParamDescInput.type(paramDescription);
            // Add more parameter configuration if needed (type, required, etc.)
        } else {
            throw new Error("Could not find parameter input fields after clicking 'Add Parameter'");
        }


        // 6. Click Save
        await page.click(SAVE_TOOL_BUTTON_SELECTOR);

        // 7. Verify navigation, toast, and tool presence
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        expect(page.url()).toContain('/tools');

        try {
            await page.waitForSelector(TOAST_SUCCESS_SELECTOR, { timeout: 5000 });
        } catch (e) {
            console.warn("Success toast not found, continuing verification...");
        }

        await page.waitForSelector(TOOL_LIST_CARD_SELECTOR(toolName));
        const toolCard = await page.$(TOOL_LIST_CARD_SELECTOR(toolName));
        expect(toolCard).toBeTruthy();

        // Click the created tool card and verify the parameter exists in the editor view
        await page.click(TOOL_LIST_CARD_SELECTOR(toolName));
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForSelector(`input[value="${paramName}"]`); // Check if param name input has the value

        console.log('Test completed: Create tool with parameters');
      });
    });
  });
});

// Helper function for contains text selector (if needed, though XPath is often better)
puppeteer.registerCustomQueryHandler('contains', {
  queryOne: (element, selector) => {
    return element.querySelector(`*:contains("${selector}")`);
  },
  queryAll: (element, selector) => {
    return element.querySelectorAll(`*:contains("${selector}")`);
  }
});
// Usage: await page.click(`button:contains("Add Parameter")`);