require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Email = require('./models/Email');

const checkResults = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Database');

    console.log('\n=========================================');
    console.log('📧 LATEST PROCESSED EMAIL:');
    console.log('=========================================');
    const latestEmail = await Email.find().sort({ createdAt: -1 }).limit(1).lean();
    if (latestEmail.length > 0) {
      console.log(`From: ${latestEmail[0].senderName} <${latestEmail[0].senderEmail}>`);
      console.log(`Subject: ${latestEmail[0].subject}`);
      console.log(`Category: ${latestEmail[0].category} | Priority: ${latestEmail[0].priority}`);
    } else {
      console.log('No emails found.');
    }

    console.log('\n=========================================');
    console.log('👤 LATEST EXTRACTED CANDIDATE:');
    console.log('=========================================');
    const latestCandidate = await Candidate.find().sort({ createdAt: -1 }).limit(1).lean();
    if (latestCandidate.length > 0) {
      const candidate = latestCandidate[0];
      console.log(`Name:  ${candidate.personalInfo.fullName}`);
      console.log(`Email: ${candidate.personalInfo.email}`);
      console.log(`Phone: ${candidate.personalInfo.phone || 'N/A'}`);
      console.log('\n--- AI Summary ---');
      console.log(candidate.aiAnalysis.summary || 'No summary generated');
      console.log('\n--- Extracted Skills ---');
      console.log(candidate.aiAnalysis.extractedSkills.length > 0 
        ? candidate.aiAnalysis.extractedSkills.join(', ') 
        : 'None extracted');
      console.log(`\nRecommendation: ${candidate.aiAnalysis.recommendationLevel}`);
      console.log('=========================================\n');
    } else {
      console.log('No candidates found.');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkResults();
