const mongoose = require('mongoose');

const criteriaSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  points: { type: Number, required: true }
}, { _id: false });

const jobPostingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    type: String,
    default: 'Remote'
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  department: {
    type: String,
    default: 'Engineering'
  },
  experience: {
    type: String,
    default: '1-3 years'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  scoringCriteria: [criteriaSchema],
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Open'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('JobPosting', jobPostingSchema);
