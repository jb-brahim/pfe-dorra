const mongoose = require('mongoose');
require('dotenv').config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      if (collection.collectionName === 'users') {
        console.log(`Skipping collection: ${collection.collectionName} to keep your admin account active!`);
        continue;
      }
      await collection.deleteMany({});
      console.log(`Cleared collection: ${collection.collectionName}`);
    }

    console.log('Database cleared successfully (retained users)!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
