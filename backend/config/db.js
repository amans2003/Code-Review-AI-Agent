const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-code-reviewer');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop the leftover unique index on email if it exists
    try {
      const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
      if (collections.length > 0) {
        await mongoose.connection.db.collection('users').dropIndex('email_1');
        console.log('Database: Leftover unique index "email_1" dropped successfully.');
      }
    } catch (indexError) {
      if (indexError.codeName !== 'IndexNotFound' && indexError.code !== 27) {
        console.warn('Database: Could not drop index "email_1":', indexError.message);
      }
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not crash the application, log instead
  }
};

module.exports = connectDB;
