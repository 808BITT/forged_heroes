import { vi } from 'vitest';

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

// Identity mock for JSON files
vi.mock('*.json', () => ({}), { virtual: true });

// Make sure CI info is properly handled
vi.mock('ci-info', () => ({
  isCI: false,
  name: null,
  ENVS: [],
  vendors: []
}));

// Suppress console errors during tests
console.error = vi.fn();
