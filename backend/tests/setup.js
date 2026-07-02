// Ensure required env vars exist before any test file requires server.js,
// which calls process.exit(1) at import-time if JWT_SECRET is missing.
// This file is loaded via jest.config.js's setupFilesAfterEnv, which runs
// before test suite files are required, so this must stay synchronous.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-ci-do-not-use-in-prod';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
});
