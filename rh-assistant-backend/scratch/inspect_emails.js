const mongoose = require('mongoose');
const Email = require('../models/Email');
const Candidate = require('../models/Candidate');
require('dotenv').config();

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected.');

    const emails = await Email.find().populate('candidateId');
    console.log(`Found ${emails.length} emails:`);
    
    emails.forEach((email, idx) => {
      console.log(`\n[Email ${idx + 1}]`);
      console.log(`Sender: ${email.senderName} (${email.senderEmail})`);
      console.log(`Subject: ${email.subject}`);
      console.log(`Email cvUrl: ${email.cvUrl}`);
      if (email.candidateId) {
        console.log(`Candidate Name: ${email.candidateId.personalInfo?.fullName}`);
        console.log(`Candidate top cvUrl: ${email.candidateId.cvUrl}`);
        console.log(`Candidate personalInfo cvUrl: ${email.candidateId.personalInfo?.cvUrl}`);
      } else {
        console.log('No Candidate linked.');
      }
    });

    process.exit(0);
  } catch (err) {
    console.error('Error during inspection:', err);
    process.exit(1);
  }
}

inspect();
