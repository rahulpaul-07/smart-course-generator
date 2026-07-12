module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 120000,
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'routes/**/*.js',
    'services/**/*.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  // Coverage is collected and printed in CI for visibility. A numeric gate is
  // intentionally omitted until a baseline is measured (`npm run test -- --coverage`),
  // then add a coverageThreshold ~5% below the observed numbers to catch regressions.
};
