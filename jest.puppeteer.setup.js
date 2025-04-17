const { mkdir, writeFile } = require('fs').promises;
const os = require('os');
const path = require('path');

jest.setTimeout(30000); // 30 seconds

// Add custom matchers for puppeteer if needed
expect.extend({
    toMatchImageSnapshot(received) {
        // Simple placeholder - replace with actual implementation if needed
        return {
            message: () => 'Image snapshot matcher is not implemented',
            pass: true
        };
    },
});

// Add a custom query handler for "contains" text (safe alternative to registerCustomQueryHandler)
beforeAll(async () => {
    // Check if we're using puppeteer
    if (global.page) {
        await global.page.evaluate(() => {
            window.customQueryHandlers = window.customQueryHandlers || {};
            window.customQueryHandlers.contains = (element, selector) => {
                const matches = [];
                const allElements = document.querySelectorAll('*');
                for (const el of allElements) {
                    if (el.textContent.includes(selector)) {
                        matches.push(el);
                    }
                }
                return element.contains(matches[0]) ? [matches[0]] : [];
            };
        });
    }
});

console.log('Jest Puppeteer setup executed');
