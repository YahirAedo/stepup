module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.ts'],
  globalSetup: '<rootDir>/jest.globalSetup.js',
  setupFiles: ['<rootDir>/jest.env.setup.js'],
  testTimeout: 20000,
  maxWorkers: 1,
};
