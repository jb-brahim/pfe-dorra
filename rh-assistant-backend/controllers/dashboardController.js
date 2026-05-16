const Candidate = require('../models/Candidate');
const Email = require('../models/Email');
const Event = require('../models/Event');

// @desc    Get Dashboard Statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const newApplications = await Candidate.countDocuments({ status: 'Pending' });
    const interviewsScheduled = await Candidate.countDocuments({ status: { $in: ['Interviewing', 'Interview'] } });
    const offersAccepted = await Candidate.countDocuments({ status: { $in: ['Offered', 'Hired'] } });
    const hired = await Candidate.countDocuments({ status: 'Hired' });
    const rejected = await Candidate.countDocuments({ status: 'Rejected' });

    // Fetch pipeline detailed counts
    const appliedCount = await Candidate.countDocuments({ status: 'Pending' });
    const screeningCount = await Candidate.countDocuments({ status: 'Screening' });
    const interviewingCount = interviewsScheduled;
    const offeredCount = await Candidate.countDocuments({ status: 'Offered' });
    const hiredCount = hired;

    // Fetch upcoming reminders (Interviews, Meetings, Tasks, etc.) from Events
    const reminders = await Event.find({ status: 'Scheduled' })
      .sort('date')
      .limit(3)
      .populate({
        path: 'candidateId',
        select: 'personalInfo jobPostingId',
        populate: {
          path: 'jobPostingId',
          select: 'title'
        }
      });

    // Top candidates
    const topCandidates = await Candidate.find()
      .sort('-matchScore')
      .limit(5)
      .populate('jobPostingId', 'title');

    // Recent emails
    const recentEmails = await Email.find({ isDeleted: false })
      .sort('-createdAt')
      .limit(4);

    res.status(200).json({
      stats: { totalCandidates, newApplications, interviewsScheduled, offersAccepted, hired, rejected },
      pipeline: { 
        applied: appliedCount, 
        screening: screeningCount,
        interviewing: interviewingCount, 
        offered: offeredCount,
        hired: hiredCount,
        total: totalCandidates
      },
      reminders,
      topCandidates,
      recentEmails
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
