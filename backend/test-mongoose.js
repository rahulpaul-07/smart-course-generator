const mongoose = require('mongoose');
const Course = require('./models/Course');
const dotenv = require('dotenv');

dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // 1. Create original course with an old date
  const original = new Course({
    title: 'Test Original Course',
    description: 'abc',
    creator: new mongoose.Types.ObjectId(),
  });
  
  // Force old creation date
  original.createdAt = new Date('2020-01-01');
  await original.save();
  
  // 2. Simulate clone
  const originalPlain = original.toObject();
  
  const cloned = new Course({
    ...originalPlain,
    _id: undefined,
    creator: new mongoose.Types.ObjectId(),
  });
  
  await cloned.save();
  
  console.log('Original createdAt:', original.createdAt);
  console.log('Cloned createdAt:', cloned.createdAt);
  
  await mongoose.disconnect();
})();
