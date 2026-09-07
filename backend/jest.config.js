/**
 * Two projects, deliberately.
 *
 * Every suite used to load `tests/setup.js`, which boots a full
 * MongoMemoryServer -- including the suites that touch no database at all
 * (circuit breaker, JSON parsing, streak arithmetic). That meant a ~90 MB
 * mongod download on a cold machine and a hard failure on any network where
 * fastdl.mongodb.org is unreachable, for tests that never needed it.
 *
 *   npm run test:unit          pure logic, no database, no network
 *   npm run test:integration   supertest + mongodb-memory-server
 *   npm test                   both
 */
const shared = {
  testEnvironment: 'node',
};

module.exports = {
  testTimeout: 120000,
  projects: [
    {
      ...shared,
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      setupFiles: ['<rootDir>/tests/unit/env.js'],
    },
    {
      ...shared,
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    },
  ],
  // NOTE: coverage instrumentation is currently disabled. The repo pins
  // minimatch@^10 via package.json "overrides", and istanbul's test-exclude
  // calls minimatch() as a function (removed in v10), which crashes coverage
  // runs. Re-enable collectCoverage + a coverageThreshold once that override
  // is resolved (e.g. drop the override or align test-exclude).
};
