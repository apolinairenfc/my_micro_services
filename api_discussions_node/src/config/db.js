const mongoose = require('mongoose');

const connectDb = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log('[db] MongoDB connected');
  } catch (error) {
    console.error('[db] MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
