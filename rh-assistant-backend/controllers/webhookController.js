const Candidate = require('../models/Candidate');
const { extractTextFromPDF, extractWorkExperience } = require('../utils/resumeParser');
const JobPosting = require('../models/JobPosting');
const Email = require('../models/Email');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Receive parsed email data from n8n
// @route   POST /api/webhooks/incoming-email
// @access  Public
exports.receiveEmailData = async (req, res) => {
  try {
    let data = req.body;
    
    // If n8n sends JSON inside a 'data' field in multipart
    if (data.data && typeof data.data === 'string') {
      try {
        data = JSON.parse(data.data);
      } catch (e) {
        console.error('Error parsing JSON from multipart field:', e);
      }
    }

    const { 
      senderName,
      senderEmail,
      subject,
      body,
      category,
      priority,
      jobId,
      fullName, 
      phone, 
      summary, 
      extractedSkills,
      education,
      experienceYears,
      certifications,
      languages,
      portfolioLinks,
      recommendationLevel,
      meetingDate, // New field from Groq
      meetingTime, // New field from Groq
      meetingTitle // New field from Groq
    } = data;

    // File path from multer (robust fallback for both single and multiple files)
    const uploadedFile = req.file || (req.files && req.files[0]);
    const cvUrl = uploadedFile ? `/uploads/${uploadedFile.filename}` : null;

    // Extract candidate actual email: use extracted email from data (if any), or regex search in email body, or fallback to senderEmail
    let finalCandidateEmail = data.email || data.candidateEmail;
    
    if (!finalCandidateEmail && body) {
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+)/gi;
      const matches = body.match(emailRegex);
      if (matches && matches.length > 0) {
        // Find the first email in the body that is not the sender's email
        const found = matches.find(m => m.toLowerCase() !== senderEmail.toLowerCase());
        if (found) {
          finalCandidateEmail = found.toLowerCase();
          console.log(`🎯 Smart Regex: Extracted candidate's actual email "${finalCandidateEmail}" from body!`);
        }
      }
    }
    
    if (!finalCandidateEmail) {
      finalCandidateEmail = senderEmail;
    }

    console.log('--- Incoming Webhook Data ---');
    console.log('Category:', category);
    console.log('Sender:', senderEmail);
    console.log('Candidate Email:', finalCandidateEmail);
    console.log('Full Name:', fullName);

    // Fail-safe: If AI found skills but forgot the category, force it to 'Applications'
    let finalCategory = category;
    const hasSkills = extractedSkills && Array.isArray(extractedSkills) && extractedSkills.length > 0;
    
    if (hasSkills && (!category || category.toLowerCase().includes('others'))) {
      finalCategory = 'Applications';
    }

    console.log('Final Category:', finalCategory);

    let candidateId = null;

    // 1. If it's a job application or interview, process the Candidate
    const isApplication = finalCategory === 'Applications' || finalCategory === 'Job Interview';
    
    if (isApplication) {
      let matchPercentage = 0;
      let missingSkills = [];
      let activeJobId = jobId;

      // Smart Fallback: If no jobId is explicitly provided, find an active/open job matching the email subject or body
      if (!activeJobId) {
        try {
          const activeJobs = await JobPosting.find({ status: { $in: ['Active', 'Open'] } });
          if (activeJobs && activeJobs.length > 0) {
            const matchedJob = activeJobs.find(job => {
              const titleLower = job.title.toLowerCase();
              return (subject && subject.toLowerCase().includes(titleLower)) || 
                     (body && body.toLowerCase().includes(titleLower));
            });
            if (matchedJob) {
              activeJobId = matchedJob._id;
              console.log(`🔍 Smart Match: Auto-linked candidate to active job "${matchedJob.title}" (ID: ${matchedJob._id})`);
            }
          }
        } catch (e) {
          console.error('Error in smart match fallback:', e);
        }
      }

      // Calculate score if a jobId was provided or found via fallback
      if (activeJobId) {
        const job = await JobPosting.findById(activeJobId);
        
        if (job) {
          let totalScore = 0;
          let maxPossibleScore = 0;
          
          job.scoringCriteria.forEach(criterion => {
            maxPossibleScore += criterion.points;
            const hasSkill = extractedSkills && extractedSkills.some(
              skill => skill.toLowerCase() === criterion.skill.toLowerCase()
            );
            if (hasSkill) {
              totalScore += criterion.points;
            } else {
              missingSkills.push(criterion.skill);
            }
          });

          matchPercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
        }
      }

      // Ensure recommendationLevel is a valid enum value
      const validRecommendations = ['Highly Recommended', 'Recommended', 'Not Recommended'];
      let finalRecommendation = validRecommendations.includes(recommendationLevel) 
        ? recommendationLevel 
        : 'Recommended'; // Default fallback

      // Read text from CV PDF if attached
      let pdfText = '';
      if (uploadedFile) {
        pdfText = await extractTextFromPDF(uploadedFile.path);
      }

      // Smart extraction of work experience list from CV PDF text, payload, or email body
      const parsedWorkExperience = data.workExperience || data.experience || extractWorkExperience(pdfText || body);

      // Check if candidate already exists
      let candidate = await Candidate.findOne({ 'personalInfo.email': finalCandidateEmail });

      if (candidate) {
        // Update existing candidate
        candidate.aiAnalysis = {
          summary,
          extractedSkills,
          education,
          experienceYears,
          certifications,
          languages,
          portfolioLinks,
          missingSkills,
          recommendationLevel: finalRecommendation
        };
        candidate.matchScore = matchPercentage;
        candidate.personalInfo.fullName = fullName || senderName;
        candidate.personalInfo.phone = phone || candidate.personalInfo.phone;
        candidate.workExperience = parsedWorkExperience;
        if (cvUrl) candidate.personalInfo.cvUrl = cvUrl;
        if (activeJobId) candidate.jobPostingId = activeJobId; // update link if matched
        await candidate.save();
      } else if (finalCategory === 'Applications') {
        // Create new candidate only for real job applications
        candidate = await Candidate.create({
          jobPostingId: activeJobId || undefined,
          personalInfo: { fullName: fullName || senderName, email: finalCandidateEmail, phone, cvUrl },
          aiAnalysis: {
            summary,
            extractedSkills,
            education,
            experienceYears,
            certifications,
            languages,
            portfolioLinks,
            missingSkills,
            recommendationLevel: finalRecommendation
          },
          matchScore: matchPercentage,
          status: 'Pending',
          workExperience: parsedWorkExperience
        });
      }

      if (candidate) {
        candidateId = candidate._id;
      }
    }

    // 2. Save the Email to the database
    const emailRecord = await Email.create({
      senderName,
      senderEmail,
      subject,
      body,
      category: finalCategory || 'Notifications',
      priority: (priority && ['High', 'Medium', 'Low'].includes(priority)) ? priority : (priority === 'Normal' ? 'Medium' : 'Low'),
      candidateId: candidateId,
      cvUrl: cvUrl // Link CV to email as well
    });

    // 3. Automatically schedule a Meeting/Interview if details were extracted
    if (meetingDate || category === 'Job Interview' || (category === 'Others' && meetingDate)) {
      try {
        // Find an admin user to act as the organizer
        const adminUser = await User.findOne() || { _id: '60d5ecb8b392d7001f8e4e1a' }; 
        
        let eventDate = new Date();
        if (meetingDate) {
           // Basic parsing: if Groq sends 'tomorrow', this will fail, so we hope Groq sends ISO format or YYYY-MM-DD
           // In the n8n prompt, we will explicitly ask for YYYY-MM-DD
           eventDate = new Date(`${meetingDate} ${meetingTime || '09:00'}`);
           if (isNaN(eventDate.getTime())) eventDate = new Date(); // fallback if invalid
        } else {
           // Default to tomorrow 10 AM if no specific date extracted
           eventDate.setDate(eventDate.getDate() + 1);
           eventDate.setHours(10, 0, 0, 0);
        }

        await Event.create({
          title: meetingTitle || subject || 'New Scheduled Meeting',
          description: `Automatically scheduled from email: ${subject}\n\nSender: ${senderName} (${senderEmail})`,
          type: category === 'Job Interview' ? 'Interview' : 'Meeting',
          date: eventDate,
          organizer: adminUser._id,
          candidateId: candidateId,
          attendees: [senderEmail],
          status: 'Scheduled'
        });
        console.log('✅ Auto-scheduled meeting for:', eventDate);
      } catch (err) {
        console.error('Failed to auto-schedule event:', err);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Email processed successfully',
      emailId: emailRecord._id,
      candidateId: candidateId 
    });


  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Server Error processing webhook', error: error.message });
  }
};
