// Debug-friendly Puppeteer test for REQ-TOOL-01
const puppeteer = require('puppeteer');
const { test, expect, beforeAll, afterAll, describe } = require('@jest/globals');

/**
 * @requirement REQ-TOOL-01 User can create a new tool with name, type, and optional description.
 */
describe('E2E: REQ-TOOL-01 - Create and Delete Tool', () => {
    let browser;
    let page;
    const timeout = 10000; // Increased timeout for debugging
    const baseUrl = 'http://localhost:5173/'; // Base URL for the application

    beforeAll(async () => {
        console.log('Starting browser for E2E test...');
        browser = await puppeteer.launch({ 
            headless: false, // Set to false for visual debugging
            slowMo: 50,      // Slow down operations for better visibility
            args: ['--window-size=1280,800'],
            defaultViewport: { width: 1280, height: 800 }
        });
        page = await browser.newPage();
        page.setDefaultTimeout(timeout);
        console.log('Browser started');
    });

    afterAll(async () => {
        console.log('Closing browser...');
        await browser.close();
        console.log('Browser closed');
    });

    test('should create a new tool with name and description', async () => {
        console.log(`Navigating to ${baseUrl}...`);
        
        try {
            // Step 1: Navigate to the application
            await page.goto(baseUrl, { waitUntil: 'networkidle0' });
            console.log('Loaded application homepage');
            
            // Step 2: Navigate to Tools section
            console.log('Clicking on Tools menu...');
            await page.waitForSelector('div:nth-of-type(2) > button'); // Tools menu button
            await page.click('div:nth-of-type(2) > button');
            
            console.log('Selecting Tools option...');
            await page.waitForSelector('div.hidden a:nth-of-type(1)');
            await page.click('div.hidden a:nth-of-type(1)');
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            console.log('Navigated to Tools page');
            
            // Step 3: Click on New Tool button
            console.log('Creating new tool...');
            await page.waitForSelector('main button');
            await page.click('main button');
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            console.log('Opened tool editor');
            
            // Step 4: Fill in tool details
            console.log('Filling tool details...');
            await page.waitForSelector('#tool-name');
            await page.type('#tool-name', 'Puppeteer E2E Test Tool');
            
            await page.waitForSelector('#tool-description');
            await page.type('#tool-description', 'Testing with Puppeteer for E2E coverage of REQ-TOOL-01');
            console.log('Tool details entered');
            
            // Step 5: Select category
            console.log('Selecting category...');
            await page.waitForSelector('#category');
            await page.click('#category');
            
            // Wait for dropdown and select first option
            await page.waitForSelector('div[role="option"]');
            const options = await page.$$('div[role="option"]');
            if (options.length > 0) {
                await options[0].click();
                console.log('Category selected');
            } else {
                console.warn('No category options found');
            }
            
            // Step 6: Save the tool
            console.log('Saving tool...');
            await page.waitForSelector('[data-testid="save-tool-button"]');
            await page.click('[data-testid="save-tool-button"]');
            
            // Step 7: Verify redirect back to tools list
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            console.log('Tool saved, verifying creation...');
            
            // Verify tool was created
            await page.waitForSelector('h3');
            const toolCards = await page.$$eval('h3', elements => 
                elements.map(el => el.textContent)
            );
            
            console.log('Found tools:', toolCards);
            expect(toolCards).toContain('Puppeteer E2E Test Tool');
            console.log('Tool creation verified successfully');
            
        } catch (error) {
            // Take a screenshot when the test fails
            console.error('Test failed with error:', error);
            await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
            throw error;
        }
    });
});