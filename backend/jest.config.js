module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 120000,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'routes/**/*.js',
    'services/**/*.js'
  ]
};
