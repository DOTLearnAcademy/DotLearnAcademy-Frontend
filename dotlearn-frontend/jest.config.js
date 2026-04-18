const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: undefined,
  setupFiles: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['**/src/**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|html)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$'
    }]
  },
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.spec.ts'
  ],
  coverageReporters: ['html', 'text-summary'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};
