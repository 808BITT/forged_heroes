// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    testDir: './test',
    testMatch: ['**/*.spec.ts'],
    timeout: 30 * 1000,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: 'list',
    expect: {
        timeout: 5000,
    },
    quiet: process.env.CI ? true : false,
    use: {
        baseURL: process.env.APP_URL ? process.env.APP_URL : 'http://localhost:5173',
        actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '5000') ? parseInt(process.env.ACTION_TIMEOUT || '5000') : 5000,
        colorScheme: process.env.COLOR_SCHEME === 'light' || process.env.COLOR_SCHEME === 'dark' ? process.env.COLOR_SCHEME : 'dark',
        ignoreHTTPSErrors: true,
        video: 'on-first-retry',
        headless: process.env.CI ? true : false,
        isMobile: process.env.IS_MOBILE === 'true' ? true : false,
        geolocation: process.env.GEOLOCATION ? JSON.parse(process.env.GEOLOCATION) : { longitude: 0, latitude: 0 },
        userAgent: process.env.USER_AGENT ? process.env.USER_AGENT : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        viewport: { width: 1920, height: 1080 },
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile',
            use: { ...devices['iPhone 13'] },
        }
    ],
});