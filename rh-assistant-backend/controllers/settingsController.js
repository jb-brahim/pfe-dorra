const Settings = require('../models/Settings');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public (for MVP)
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Public (for MVP)
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    // Update fields
    if (req.body.profileData) settings.profileData = req.body.profileData;
    if (req.body.aiWeights) settings.aiWeights = req.body.aiWeights;
    if (req.body.aiEngine) settings.aiEngine = req.body.aiEngine;
    if (req.body.smtpData) settings.smtpData = req.body.smtpData;

    const updatedSettings = await settings.save();
    res.status(200).json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
