module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 120000,
  // NOTE: coverage instrumentation is currently disabled. The repo pins
  // minimatch@^10 via package.json "overrides", and istanbul's test-exclude
  // calls minimatch() as a function (removed in v10), which crashes coverage
  // runs. Re-enable collectCoverage + a coverageThreshold once that override
  // is resolved (e.g. drop the override or align test-exclude).
};
