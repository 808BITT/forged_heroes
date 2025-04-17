/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-puppeteer',
    testEnvironment: 'node',
    testMatch: [
        '<rootDir>/test/tool/*.test.cjs'
    ],
    testTimeout: 60000,
    setupFilesAfterEnv: ['<rootDir>/jest.puppeteer.setup.js'],
    // Disable transforms for test files
    transform: {},
    // Exclude these from the transform process
    transformIgnorePatterns: [
        'node_modules/(?!(puppeteer|@puppeteer)/)',
    ],
    // Enable this for debugging
    verbose: true,
    maxWorkers: 1,
}
