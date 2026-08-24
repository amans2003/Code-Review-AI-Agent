const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-code-reviewer');
    // Startup confirmation — use process.stderr for structured environments
    process.stdout.write(`[DB] Connected: ${conn.connection.host}\n`);

    // Drop legacy indexes that may conflict with the updated schema
    try {
      const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
      if (collections.length > 0) {
        const indexesToDrop = ['email_1', 'githubId_1'];
        for (const idxName of indexesToDrop) {
          try {
            await mongoose.connection.db.collection('users').dropIndex(idxName);
          } catch (idxErr) {
            // IndexNotFound is expected if the index never existed — safe to ignore
            if (idxErr.codeName !== 'IndexNotFound' && idxErr.code !== 27) {
              console.warn(`Database: Could not drop index "${idxName}":`, idxErr.message);
            }
          }
        }
      }
    } catch (indexError) {
      console.warn('Database: Index cleanup error:', indexError.message);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not crash the application, log instead
  }
};

module.exports = connectDB;
