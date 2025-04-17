export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(json)$': 'identity-obj-proxy',
    'ci-info': '<rootDir>/__mocks__/ci-info.js',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'cjs', 'json', 'node'],
  testMatch: [
    '<rootDir>/test/**/*.test.cjs',
    '<rootDir>/test/**/*.spec.cjs',
    '<rootDir>/**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.app.json',
      useESM: true,
    }],
    '^.+\\.(js|jsx|cjs)$': ['babel-jest', { rootMode: 'upward' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(puppeteer|@puppeteer)/)',
  ],
  testTimeout: 30000,
  verbose: true,
  maxWorkers: 1,
}
