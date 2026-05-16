const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  jobPostingId: {
    type: mongoose.Schema.ObjectId,
    ref: 'JobPosting'
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    cvUrl: { type: String } // Added to store file path
  },
  aiAnalysis: {
    summary: { type: String },
    extractedSkills: [{ type: String }],
    education: { type: mongoose.Schema.Types.Mixed },
    experienceYears: { type: Number },
    certifications: { type: mongoose.Schema.Types.Mixed },
    languages: { type: mongoose.Schema.Types.Mixed },
    portfolioLinks: { type: mongoose.Schema.Types.Mixed },
    missingSkills: [{ type: String }],
    recommendationLevel: { 
      type: String, 
      enum: ['Highly Recommended', 'Recommended', 'Not Recommended'] 
    }
  },
  matchScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Screening', 'Interviewing', 'Interview', 'Offered', 'Hired', 'Rejected'],
    default: 'Pending'
  },
  cvUrl: {
    type: String // Link to the stored CV if uploaded
  },
  notes: {
    type: String
  },
  workExperience: {
    type: mongoose.Schema.Types.Mixed // Stores array of parsed job positions
  }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
