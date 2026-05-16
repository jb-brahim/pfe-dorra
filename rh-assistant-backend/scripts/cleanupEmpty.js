const mongoose = require('mongoose');
require('dotenv').config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Delete candidates that have no summary or skills
    const result = await mongoose.connection.db.collection('candidates').deleteMany({
      $or: [
        { 'aiAnalysis.summary': "" },
        { 'aiAnalysis.summary': { $exists: false } },
        { 'aiAnalysis.extractedSkills': { $size: 0 } }
      ]
    });
    
    console.log(`Successfully deleted ${result.deletedCount} empty candidates.`);
    process.exit(0);
  } catch (err) {
    console.error('Cleanup error:', err);
    process.exit(1);
  }
};

cleanup();
