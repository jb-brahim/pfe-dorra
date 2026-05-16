export interface Email {
  id: string;
  from: string;
  senderName: string;
  subject: string;
  preview: string;
  timestamp: Date;
  priority: 'High' | 'Medium' | 'Low';
  category: 'All Mails' | 'Applications' | 'Important' | 'Others';
  read: boolean;
  starred: boolean;
  tags?: string[];
  body?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  matchScore: number;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
  skills: string[];
  missingSkills?: string[];
  experience: number;
  education?: string;
  university?: string;
  resumeUrl?: string;
  appliedDate: Date;
  profileImage?: string;
  aiSummary?: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  time: Date;
  type: string;
}

export interface DashboardMetrics {
  totalCandidates: number;
  newApplications: number;
  interviewsScheduled: number;
  offersAccepted: number;
  pipelineData: {
    applied: number;
    screening: number;
    interview: number;
    offered: number;
    hired: number;
  };
}
