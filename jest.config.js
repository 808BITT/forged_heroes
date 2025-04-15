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
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.app.json',
      useESM: true,
    }],
    // Handle other file types if needed
    '^.+\\.(js|jsx)$': ['babel-jest', { rootMode: 'upward' }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  // Handle ESM modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    // This allows Jest to transform node_modules that use ESM
    'node_modules/(?!(.*\\.mjs$|uuid|@lit|lit|lit-html|lit-element|@open-wc))'
  ],
  // Enable mocking of modules
  automock: false,
  moduleDirectories: ['node_modules', 'src'],
}
