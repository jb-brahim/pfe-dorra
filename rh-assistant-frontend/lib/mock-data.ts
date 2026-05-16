import { Email, Candidate, Interview, DashboardMetrics } from '@/types';

export const mockEmails: Email[] = [];

export const mockCandidates: Candidate[] = [];

export const mockInterviews: Interview[] = [];

export const mockDashboardMetrics: DashboardMetrics = {
  totalCandidates: 0,
  newApplications: 0,
  interviewsScheduled: 0,
  offersAccepted: 0,
  pipelineData: {
    applied: 0,
    screening: 0,
    interview: 0,
    offered: 0,
    hired: 0
  }
};

export const mockTopCandidates = [];
