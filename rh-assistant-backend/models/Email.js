const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  senderName: { type: String },
  senderEmail: { type: String, required: true },
  subject: { type: String },
  body: { type: String },
  category: {
    type: String,
    enum: ['Applications', 'Job Interview', 'Important', 'Others'],
    default: 'Others'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Low'
  },
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  candidateId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Candidate' // Only populated if it's a job application
  },
  cvUrl: { type: String },
  attachments: [{
    filename: String,
    url: String // S3 or local path
  }]
}, { timestamps: true });

module.exports = mongoose.model('Email', emailSchema);
