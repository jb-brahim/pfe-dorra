const Event = require('../models/Event');
const Candidate = require('../models/Candidate');
const { sendInterviewInvite } = require('../services/emailService');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('candidateId', 'personalInfo.fullName aiAnalysis.summary').sort('date');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create an event (e.g., Schedule Interview)
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
  try {
    req.body.organizer = req.user.id;
    const event = await Event.create(req.body);

    // If it's an interview, trigger email and update candidate status
    if (event.type === 'Interview' && event.candidateId) {
      const candidate = await Candidate.findByIdAndUpdate(event.candidateId, { status: 'Interview' });
      if (candidate) {
        // Send email
        await sendInterviewInvite(
          candidate.personalInfo.email,
          candidate.personalInfo.fullName,
          'the open position', // You'd normally populate job title here
          new Date(event.date).toLocaleString()
        );
      }
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete event by candidate ID
// @route   DELETE /api/events/candidate/:candidateId
// @access  Private
exports.deleteEventByCandidate = async (req, res) => {
  try {
    const result = await Event.deleteMany({ candidateId: req.params.candidateId });
    res.status(200).json({ message: 'Event successfully removed from calendar db', count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete single event by ID
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Reset candidate status back to Pending if it was an interview
    if (event.type === 'Interview' && event.candidateId) {
      await Candidate.findByIdAndUpdate(event.candidateId, { status: 'Pending' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Event successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
