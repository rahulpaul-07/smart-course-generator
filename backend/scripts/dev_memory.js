/**
 * Zero-setup local backend: an in-memory MongoDB, a generated JWT secret, and
 * the AI router's mock mode when no provider key is set.
 *
 *   npm run dev:memory
 *
 * Nothing persists between runs. For real data, set MONGO_URI in .env and use
 * `npm run dev` instead.
 */
const crypto = require("crypto");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { MongoMemoryServer } = require("mongodb-memory-server");

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri("courseai");
  process.env.JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
  process.env.DEMO_MODE = process.env.DEMO_MODE || "true";

  const { startServer } = require("../server");
  await startServer();

  const { seedShowcase } = require("./seed_showcase");
  await seedShowcase();

  console.log(`In-memory MongoDB at ${process.env.MONGO_URI}`);
  const stop = async () => { await mongod.stop(); };
  process.on("exit", stop);
})().catch((err) => {
  console.error("dev:memory failed to start:", err);
  process.exit(1);
});
