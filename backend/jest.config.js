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
  // Applies to `npm run test:coverage` (run in CI). A floor just under the
  // current figures, so coverage can only ratchet up; raise it as tests land.
  collectCoverageFrom: ["controllers/**/*.js", "middlewares/**/*.js", "services/**/*.js", "models/**/*.js", "utils/**/*.js"],
  coverageThreshold: {
    global: { statements: 43, branches: 30, functions: 46, lines: 45 },
  },
};
