const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  profileData: {
    fullName: { type: String, default: '' },
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  aiWeights: {
    experience: { type: Number, default: 40 },
    skills: { type: Number, default: 40 },
    education: { type: Number, default: 20 }
  },
  aiEngine: { type: String, default: 'groq-llama-70b' },
  smtpData: {
    user: { type: String, default: '' },
    pass: { type: String, default: '' },
    host: { type: String, default: '' },
    port: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
