const JobPosting = require('../models/JobPosting');

// @desc    Get all job postings
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
  try {
    const jobs = await JobPosting.find().populate('createdBy', 'name email').lean();
    
    // Dynamically calculate candidate counts for each job posting
    const Candidate = require('../models/Candidate');
    
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const totalCandidates = await Candidate.countDocuments({ jobPostingId: job._id });
      const newCandidates = await Candidate.countDocuments({ jobPostingId: job._id, status: 'Pending' });
      return {
        ...job,
        candidateCount: totalCandidates,
        newCandidateCount: newCandidates
      };
    }));

    res.status(200).json(jobsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    if (!req.user) {
      console.error('DEBUG: req.user is undefined in jobController!');
    }
    req.body.createdBy = req.user ? (req.user._id || req.user.id) : null;
    
    if (!req.body.createdBy) {
      return res.status(401).json({ message: 'User context not found, unable to assign creator' });
    }

    const job = await JobPosting.create(req.body);
    res.status(201).json(job);
  } catch (error) {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../error.log');
    fs.writeFileSync(logPath, `ERROR: ${error.message}\nSTACK: ${error.stack}\nBODY: ${JSON.stringify(req.body)}\nUSER: ${JSON.stringify(req.user)}\n`);
    console.error('Job Creation Failed. Logged to error.log:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res) => {
  try {
    const job = await JobPosting.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res) => {
  try {
    const job = await JobPosting.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
