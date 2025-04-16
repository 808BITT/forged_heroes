export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    // Add path aliases that match your vite.config.ts if you have any
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock JSON imports
    '\\.(json)$': 'identity-obj-proxy',
    // Mock problematic modules
    'ci-info': '<rootDir>/__mocks__/ci-info.js',
  },
  // Include .cjs test files and extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'cjs', 'json', 'node'],
  testMatch: [
    '<rootDir>/test/**/*.test.cjs',
    '<rootDir>/test/**/*.spec.cjs',
    '<rootDir>/**/?(*.)+(spec|test).[jt]s?(x)'  // existing patterns
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.app.json',
      useESM: true,
    }],
    // Transform both .js and .cjs files with babel-jest
    '^.+\\.(js|jsx|cjs)$': ['babel-jest', { rootMode: 'upward' }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  // Handle ESM modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(puppeteer|@puppeteer|debug)/)',
  ],
  // Enable mocking of modules
  automock: false,
  moduleDirectories: ['node_modules', 'src', 'test'],
  // Debugging settings
  testTimeout: 30000,  // Longer timeout for E2E tests
  verbose: true,       // More detailed output
  maxWorkers: 1,       // Run tests sequentially for easier debugging
}
