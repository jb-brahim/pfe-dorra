const mongoose = require('mongoose');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');
require('dotenv').config();

async function testCreate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB.');

    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: 'password123',
        role: 'HR'
      });
    }

    console.log('Testing creation of JobPosting with User ID:', user._id);

    const testJob = {
      title: 'Test Software Engineer',
      description: 'We are testing database saving.',
      location: 'Tunis, Tunisia',
      type: 'Full-time',
      department: 'Engineering',
      experience: '2 years',
      priority: 'Medium',
      status: 'Open',
      scoringCriteria: [
        { skill: 'JavaScript', points: 15 }
      ],
      createdBy: user._id
    };

    const created = await JobPosting.create(testJob);
    console.log('SUCCESS! Job posting saved:', created._id);

    // Clean up test entry
    await JobPosting.findByIdAndDelete(created._id);
    console.log('Cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error('ERROR ENCOUNTERED:', err);
    process.exit(1);
  }
}

testCreate();
