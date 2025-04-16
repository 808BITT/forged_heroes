// E2E Test for REQ-TOOL-01
const puppeteer = require('puppeteer');

/**
 * @requirement REQ-TOOL-01 User can create a new tool with name, type, and optional description.
 */
describe('E2E: REQ-TOOL-01 - Create Tool', () => {
  let browser;
  let page;
  const timeout = 30000; // 30 seconds timeout for operations
  const APP_URL = process.env.APP_URL || 'http://localhost:5173';

  // CSS selectors for targeting elements
  const SELECTORS = {
    TOOLS_MENU: 'div:nth-of-type(2) > button',
    TOOLS_OPTION: 'div.hidden a:nth-of-type(1)',
    NEW_TOOL_BUTTON: 'main button',
    TOOL_NAME_INPUT: '#tool-name',
    TOOL_DESCRIPTION_INPUT: '#tool-description',
    CATEGORY_SELECT: '#category',
    CATEGORY_OPTION: 'div[role="option"]',
    ADD_PARAM_BUTTON: 'button:has-text("Add Parameter")',
    SAVE_BUTTON: '[data-testid="save-tool-button"]',
    TOOL_CARD: (name) => `h3:has-text("${name}")`,
    PARAM_NAME_INPUT: 'input[id^="param-name-"]',
    PARAM_DESCRIPTION_INPUT: 'input[id^="param-description-"]'
  };

  beforeAll(async () => {
    console.log('==== Starting REQ-TOOL-01 E2E Test ====');
    try {
      browser = await puppeteer.launch({
        headless: false, // Set to false for debugging
        slowMo: 50,      // Slows down operations by 50ms
        args: ['--window-size=1280,800'],
        defaultViewport: { width: 1280, height: 800 }
      });
      page = await browser.newPage();
      page.setDefaultTimeout(timeout);
      
      // Enable more verbose logging
      page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
      page.on('pageerror', err => console.error('BROWSER PAGE ERROR:', err));
      
      console.log('Browser launched successfully');
    } catch (error) {
      console.error('Failed to launch browser:', error);
      throw error;
    }
  });

  afterAll(async () => {
    console.log('Closing browser...');
    if (browser) {
      await browser.close();
    }
    console.log('Browser closed');
  });

  beforeEach(async () => {
    console.log(`Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  });

  /**
   * @requirement REQ-TOOL-01
   * @scenario Create tool without parameters
   */
  test('should create a new tool without parameters', async () => {
    const toolName = `E2E Basic Tool ${Date.now()}`;
    const toolDescription = 'A tool created via E2E test with no parameters';
    
    try {
      console.log('TEST: Creating tool without parameters');
      
      // Navigate to Tools page
      await navigateToToolsPage();
      
      // Create a new tool
      await createNewTool(toolName, toolDescription);
      
      // Verify the tool was created
      await verifyToolExists(toolName);
      
      console.log('TEST PASSED: Tool created successfully without parameters');
    } catch (error) {
      await takeErrorScreenshot('no-params-error.png');
      throw error;
    }
  });

  /**
   * @requirement REQ-TOOL-01
   * @scenario Create tool with parameters
   */
  test('should create a new tool with parameters', async () => {
    const toolName = `E2E Param Tool ${Date.now()}`;
    const toolDescription = 'A tool created via E2E test with parameters';
    const paramName = 'testParameter';
    const paramDescription = 'A test parameter for REQ-TOOL-01';
    
    try {
      console.log('TEST: Creating tool with parameters');
      
      // Navigate to Tools page
      await navigateToToolsPage();
      
      // Create a new tool with basic info
      await page.click(SELECTORS.NEW_TOOL_BUTTON);
      await page.waitForNavigation();
      
      // Fill the tool details
      await page.waitForSelector(SELECTORS.TOOL_NAME_INPUT);
      await page.type(SELECTORS.TOOL_NAME_INPUT, toolName);
      await page.type(SELECTORS.TOOL_DESCRIPTION_INPUT, toolDescription);
      
      // Select a category
      await selectCategory();
      
      // Add a parameter
      console.log('Adding a parameter...');
      await page.waitForSelector(SELECTORS.ADD_PARAM_BUTTON);
      await page.click(SELECTORS.ADD_PARAM_BUTTON);
      
      // Fill parameter details (wait for newly added parameter fields)
      await page.waitForSelector(SELECTORS.PARAM_NAME_INPUT);
      
      // Get all parameter name inputs and use the last one
      const paramInputs = await page.$$(SELECTORS.PARAM_NAME_INPUT);
      const lastParamInput = paramInputs[paramInputs.length - 1];
      await lastParamInput.type(paramName);
      
      // Get all parameter description inputs and use the last one
      const paramDescInputs = await page.$$(SELECTORS.PARAM_DESCRIPTION_INPUT);
      const lastParamDescInput = paramDescInputs[paramDescInputs.length - 1];
      await lastParamDescInput.type(paramDescription);
      
      // Save the tool
      await page.click(SELECTORS.SAVE_BUTTON);
      await page.waitForNavigation();
      
      // Verify the tool was created
      await verifyToolExists(toolName);
      
      // Click on the tool to verify parameter exists
      console.log('Verifying parameter was saved...');
      const toolCardSelector = SELECTORS.TOOL_CARD(toolName);
      await page.click(toolCardSelector);
      await page.waitForNavigation();
      
      // Check if parameter name input has the correct value
      const parameterValue = await page.$eval(
        SELECTORS.PARAM_NAME_INPUT, 
        el => el.value
      );
      
      expect(parameterValue).toBe(paramName);
      console.log('Parameter verified:', parameterValue);
      console.log('TEST PASSED: Tool created successfully with parameters');
    } catch (error) {
      await takeErrorScreenshot('with-params-error.png');
      throw error;
    }
  });

  // Helper functions to improve readability and reuse

  async function navigateToToolsPage() {
    console.log('Navigating to Tools section...');
    await page.waitForSelector(SELECTORS.TOOLS_MENU);
    await page.click(SELECTORS.TOOLS_MENU);
    
    await page.waitForSelector(SELECTORS.TOOLS_OPTION);
    await page.click(SELECTORS.TOOLS_OPTION);
    await page.waitForNavigation();
    console.log('Now on Tools page');
  }

  async function createNewTool(name, description) {
    console.log('Creating a new tool...');
    await page.click(SELECTORS.NEW_TOOL_BUTTON);
    await page.waitForNavigation();
    
    // Fill the tool details
    await page.waitForSelector(SELECTORS.TOOL_NAME_INPUT);
    await page.type(SELECTORS.TOOL_NAME_INPUT, name);
    await page.type(SELECTORS.TOOL_DESCRIPTION_INPUT, description);
    
    // Select a category
    await selectCategory();
    
    // Save the tool
    await page.click(SELECTORS.SAVE_BUTTON);
    await page.waitForNavigation();
    console.log('Tool saved');
  }

  async function selectCategory() {
    console.log('Selecting category...');
    await page.waitForSelector(SELECTORS.CATEGORY_SELECT);
    await page.click(SELECTORS.CATEGORY_SELECT);
    
    // Wait for dropdown and select first option
    await page.waitForSelector(SELECTORS.CATEGORY_OPTION);
    const options = await page.$$(SELECTORS.CATEGORY_OPTION);
    if (options.length > 0) {
      await options[0].click();
      console.log('Category selected');
    } else {
      console.warn('No category options found');
      // Take screenshot if no options are found
      await page.screenshot({ path: 'no-categories.png' });
      throw new Error('No category options available');
    }
  }

  async function verifyToolExists(name) {
    console.log(`Verifying tool "${name}" exists...`);
    const toolCardSelector = SELECTORS.TOOL_CARD(name);
    await page.waitForSelector(toolCardSelector);
    
    const exists = await page.$(toolCardSelector) !== null;
    expect(exists).toBe(true);
    console.log('Tool verified successfully');
  }

  async function takeErrorScreenshot(filename) {
    console.error('Taking error screenshot...');
    await page.screenshot({ 
      path: filename,
      fullPage: true
    });
    console.error(`Screenshot saved as ${filename}`);
  }
});