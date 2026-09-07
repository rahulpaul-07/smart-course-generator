// Unit suites import modules that read env at load time (server.js exits if
// JWT_SECRET is missing). No database, no network.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-ci-do-not-use-in-prod';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
