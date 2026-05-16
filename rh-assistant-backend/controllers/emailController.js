const Email = require('../models/Email');

// @desc    Get all emails
// @route   GET /api/emails
// @access  Private
exports.getEmails = async (req, res) => {
  try {
    const emails = await Email.find().sort('-createdAt').populate('candidateId', 'personalInfo aiAnalysis matchScore status');
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update email status (read, star, archive, delete)
// @route   PUT /api/emails/:id
// @access  Private
exports.updateEmail = async (req, res) => {
  try {
    const { isRead, isStarred, isArchived, isDeleted } = req.body;
    const email = await Email.findByIdAndUpdate(
      req.params.id, 
      { isRead, isStarred, isArchived, isDeleted },
      { new: true }
    );
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.status(200).json(email);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
const sendEmail = require('../utils/emailService');

// @desc    Send manual reply email
// @route   POST /api/emails/reply
// @access  Private
exports.sendReply = async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    await sendEmail({
      email: to,
      subject: `Re: ${subject}`,
      message: message,
      html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</div>`
    });

    res.status(200).json({ success: true, message: 'Reply sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send reply', error: error.message });
  }
};
