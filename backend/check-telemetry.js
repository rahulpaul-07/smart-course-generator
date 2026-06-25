const mongoose = require('mongoose');
const AiTelemetry = require('./models/AiTelemetry');
require('dotenv').config({ path: './.env' });

async function checkTelemetry() {
  await mongoose.connect(process.env.MONGO_URI);
  const logs = await AiTelemetry.find({ status: 'failure' }).sort({ timestamp: -1 }).limit(10).lean();
  console.log(JSON.stringify(logs, null, 2));
  mongoose.disconnect();
}

checkTelemetry();
