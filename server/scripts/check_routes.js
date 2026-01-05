const mongoose = require('mongoose');
const Route = require('../models/Route');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/turizm-platformu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');
  const count = await Route.countDocuments();
  console.log('Total Routes:', count);
  if (count > 0) {
    const route = await Route.findOne();
    console.log('Sample Route:', JSON.stringify(route, null, 2));
  }
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
