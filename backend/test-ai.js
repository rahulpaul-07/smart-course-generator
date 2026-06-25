require('dotenv').config({ path: './.env' });
const { generateJson } = require('./services/aiRouter');

async function test() {
  try {
    const result = await generateJson("Return { \"hello\": \"world\" }", "Hello", 1000);
    console.log(result);
  } catch (err) {
    console.error("FAILED!");
    console.error(err);
  }
}

test();
