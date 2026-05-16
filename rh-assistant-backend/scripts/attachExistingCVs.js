const mongoose = require('mongoose');
const Email = require('../models/Email');
const Candidate = require('../models/Candidate');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database');

    // Update emails
    const resultEmails = await Email.updateMany(
      { $or: [{ cvUrl: null }, { cvUrl: { $exists: false } }] },
      { $set: { cvUrl: '/uploads/resume-1778490694223-768065000.pdf' } }
    );
    console.log(`Updated ${resultEmails.modifiedCount} emails with default CV.`);

    // Update candidates top-level cvUrl
    const resultCandidates = await Candidate.updateMany(
      { $or: [{ cvUrl: null }, { cvUrl: { $exists: false } }] },
      { $set: { cvUrl: '/uploads/resume-1778490694223-768065000.pdf' } }
    );
    console.log(`Updated ${resultCandidates.modifiedCount} candidates top-level with default CV.`);

    // Update candidates personalInfo cvUrl
    const resultPersonalInfo = await Candidate.updateMany(
      { $or: [{ 'personalInfo.cvUrl': null }, { 'personalInfo.cvUrl': { $exists: false } }] },
      { $set: { 'personalInfo.cvUrl': '/uploads/resume-1778490694223-768065000.pdf' } }
    );
    console.log(`Updated ${resultPersonalInfo.modifiedCount} candidates personalInfo with default CV.`);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
run();
