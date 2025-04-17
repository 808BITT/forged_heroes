// Mock import.meta.env for Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:3001/api',
        // Add any other environment variables your app uses
        MODE: 'test',
        DEV: true,
        // Common Vite environment variables
        BASE_URL: '/',
        PROD: false,
        SSR: false
      }
    }
  },
  writable: true
});

// Instead of mocking debug, set it up properly for Puppeteer
if (!globalThis.process) {
  globalThis.process = {};
}
if (!globalThis.process.env) {
  globalThis.process.env = {};
}

// Fix for Puppeteer's debug module
// This is a more robust approach than mocking
globalThis.process.env.DEBUG = '';
globalThis.process.type = 'browser';

// Identity mock for JSON files
jest.mock('*.json', () => ({}), { virtual: true });

// Make sure CI info is properly handled
jest.mock('ci-info', () => ({
  isCI: false,
  name: null,
  ENVS: [],
  vendors: []
}));

// Suppress console errors during tests
console.error = jest.fn();
