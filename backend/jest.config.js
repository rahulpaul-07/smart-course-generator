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
  // Ratchet these UP as tests are added — never down.
  // Conservative starting gate so CI does not fail on first push. Run
  // `npm run test -- --coverage` locally, then ratchet these UP to ~5% below
  // the observed numbers. The gate exists to catch REGRESSIONS — never lower it.
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 35,
      lines: 40,
      statements: 40,
    },
  },
};
