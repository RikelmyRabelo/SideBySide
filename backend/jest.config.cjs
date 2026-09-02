/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      require.resolve('ts-jest'),
      {
        useESM: true,
      },
    ],
  },
  testMatch: ['**/src/__tests__/**/*.test.ts'],
};