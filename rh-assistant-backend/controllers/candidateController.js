const Candidate = require('../models/Candidate');
const JobPosting = require('../models/JobPosting');
const { extractTextFromPDF, extractWorkExperience } = require('../utils/resumeParser');

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private
exports.getCandidates = async (req, res) => {
  try {
    let query;

    // Filter by Job ID if provided
    if (req.query.jobId) {
      query = Candidate.find({ jobPostingId: req.query.jobId });
    } else {
      query = Candidate.find();
    }

    const candidates = await query.populate('jobPostingId', 'title');
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
// @access  Private
exports.getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('jobPostingId', 'title');
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const sendEmail = require('../utils/emailService');

// @desc    Update candidate status or info
// @route   PUT /api/candidates/:id
// @access  Private
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { status, notes, interviewDate, personalInfo } = req.body;
    
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Update fields
    if (status) candidate.status = status;
    if (notes) candidate.notes = notes;
    if (personalInfo) {
      candidate.personalInfo.fullName = personalInfo.fullName || candidate.personalInfo.fullName;
      candidate.personalInfo.email = personalInfo.email || candidate.personalInfo.email;
      candidate.personalInfo.phone = personalInfo.phone || candidate.personalInfo.phone;
    }
    
    await candidate.save();

    // Trigger Email based on status
    if (status === 'Rejected') {
      try {
        await sendEmail({
          email: candidate.personalInfo.email,
          subject: 'Update on your application',
          message: `Dear ${candidate.personalInfo.fullName},\n\nThank you for your interest in the position. After careful review, we have decided to move forward with other candidates at this time.\n\nWe wish you the best in your job search.\n\nBest regards,\nHR Team`,
          html: `<p>Dear <b>${candidate.personalInfo.fullName}</b>,</p><p>Thank you for your interest in the position. After careful review, we have decided to move forward with other candidates at this time.</p><p>We wish you the best in your job search.</p><p>Best regards,<br><b>HR Team</b></p>`
        });
      } catch (err) {
        console.error('Email sending failed (Rejected):', err);
      }
    } else if (status === 'Interviewing') {
      const dateStr = interviewDate ? new Date(interviewDate).toLocaleString() : 'to be determined';
      try {
        await sendEmail({
          email: candidate.personalInfo.email,
          subject: 'Interview Invitation',
          message: `Dear ${candidate.personalInfo.fullName},\n\nWe were impressed by your profile and would like to invite you for an interview.\n\nProposed Date: ${dateStr}\n\nPlease let us know if this works for you.\n\nBest regards,\nHR Team`,
          html: `<p>Dear <b>${candidate.personalInfo.fullName}</b>,</p><p>We were impressed by your profile and would like to invite you for an interview.</p><p><b>Proposed Date:</b> ${dateStr}</p><p>Please let us know if this works for you.</p><p>Best regards,<br><b>HR Team</b></p>`
        });
      } catch (err) {
        console.error('Email sending failed (Interviewing):', err);
      }
    }

    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create manual candidate
// @route   POST /api/candidates
// @access  Private
exports.createCandidate = async (req, res) => {
  try {
    const { fullName, email, phone, jobId, status, matchScore, summary, extractedSkills } = req.body;
    
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Full name and email are required' });
    }
    
    const candidate = await Candidate.create({
      jobPostingId: jobId || undefined,
      personalInfo: {
        fullName,
        email,
        phone,
        cvUrl: ''
      },
      aiAnalysis: {
        summary: summary || 'Manually entered candidate.',
        extractedSkills: extractedSkills ? extractedSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        education: [],
        experienceYears: 0,
        certifications: [],
        languages: [],
        portfolioLinks: [],
        missingSkills: [],
        recommendationLevel: 'Recommended'
      },
      matchScore: matchScore || 0,
      status: status || 'Pending'
    });
    
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload CV and trigger AI matching via n8n email pipeline
// @route   POST /api/candidates/upload-cv
// @access  Private
exports.uploadCvAndEvaluate = async (req, res) => {
  try {
    const { fullName, email, phone, jobId } = req.body;
    const file = req.file;
    
    if (!email) {
      return res.status(400).json({ message: 'Candidate email is required to initiate evaluation.' });
    }
    
    const cvUrl = file ? `/uploads/${file.filename}` : '';
    
    // Parse experience locally from the uploaded resume file
    let pdfText = '';
    let parsedWorkExperience = [];
    if (file) {
      pdfText = await extractTextFromPDF(file.path);
      parsedWorkExperience = extractWorkExperience(pdfText);
    }

    // 1. Fetch job title if linked
    let jobTitle = "Full-Stack Developer";
    let job = null;
    if (jobId) {
      job = await JobPosting.findById(jobId);
      if (job) {
        jobTitle = job.title;
      }
    }
    
    // 2. Create or update preliminary candidate record
    let candidate = await Candidate.findOne({ 'personalInfo.email': email.toLowerCase() });
    
    if (candidate) {
      candidate.status = 'Pending';
      candidate.personalInfo.fullName = fullName || candidate.personalInfo.fullName;
      candidate.personalInfo.phone = phone || candidate.personalInfo.phone;
      if (cvUrl) candidate.personalInfo.cvUrl = cvUrl;
      if (jobId) candidate.jobPostingId = jobId;
      if (parsedWorkExperience.length > 0) {
        candidate.workExperience = parsedWorkExperience;
      }
      await candidate.save();
    } else {
      candidate = await Candidate.create({
        jobPostingId: jobId || undefined,
        personalInfo: {
          fullName: fullName || 'Evaluating Candidate',
          email: email.toLowerCase(),
          phone: phone || '',
          cvUrl
        },
        status: 'Pending',
        matchScore: 0,
        workExperience: parsedWorkExperience,
        aiAnalysis: {
          summary: 'Analyzing candidate resume via AI Recruiter assistant...',
          extractedSkills: [],
          education: [],
          experienceYears: 0,
          certifications: [],
          languages: [],
          portfolioLinks: [],
          missingSkills: [],
          recommendationLevel: 'Recommended'
        }
      });
    }
    
    // 3. Forward CV to the configured inbox to trigger n8n parsing pipeline
    try {
      await sendEmail({
        email: process.env.FROM_EMAIL,
        subject: `Application for ${jobTitle} - ${fullName || 'Manual Upload'}`,
        message: `A candidate resume was uploaded manually from the HR Assistant panel.\n\nFull Name: ${fullName || 'N/A'}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nJob Link: ${jobTitle}\n\nPlease trigger the parsing pipeline on the attached CV file.`,
        html: `<h3>Manual CV Ingestion Trigger</h3>
               <p><b>Candidate:</b> ${fullName || 'N/A'}</p>
               <p><b>Email:</b> ${email}</p>
               <p><b>Phone:</b> ${phone || 'N/A'}</p>
               <p><b>Target Job:</b> ${jobTitle}</p>
               <br/>
               <p><i>The attached PDF CV has been forwarded to trigger your automatic n8n + Groq AI parsing pipeline.</i></p>`,
        attachments: file ? [
          {
            filename: file.originalname,
            path: file.path
          }
        ] : []
      });
      console.log(`✉️ Automated CV evaluation email sent to ${process.env.FROM_EMAIL} for ${email}`);
    } catch (err) {
      console.error('Error forwarding CV attachment to n8n inbox:', err);
    }
    
    res.status(201).json({
      success: true,
      message: 'CV uploaded and sent to n8n AI matching pipeline.',
      candidate
    });
    
  } catch (error) {
    console.error('Upload CV controller error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
