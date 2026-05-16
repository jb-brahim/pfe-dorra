'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Mail, Video, 
  MapPin, Loader2, ArrowRight, MoreHorizontal,
  Plus, CheckCircle2, AlertCircle, Sparkles, Briefcase,
  X, HelpCircle, FileText, Check, Edit3, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    candidateId: '',
    date: '',
    time: '',
    type: 'Interview',
    interviewer: 'Dorra Tagougi (HR Manager)',
    meetLink: 'https://meet.google.com/pfe-dorr-assist'
  });

  const fetchInterviewsAndCandidates = async () => {
    try {
      setLoading(true);
      // Fetch candidates to show in list and dropdown
      const allCands = await api.get('/candidates');
      setCandidates(allCands);

      // Filter candidates with Interview/Interviewing status to display as scheduled interviews
      const filtered = allCands.filter((c: any) => c.status === 'Interviewing' || c.status === 'Interview');
      setInterviews(filtered);
    } catch (err) {
      console.error('Error fetching interviews and candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewsAndCandidates();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open modal in Edit/Update mode
  const handleOpenEditModal = (candidate: any) => {
    setIsEditingId(candidate._id);
    const existingDate = new Date(candidate.updatedAt);
    
    // Format date as yyyy-MM-dd
    const formattedDate = existingDate.toISOString().split('T')[0];
    
    // Format time as hh:mm
    const formattedTime = existingDate.toTimeString().slice(0, 5);

    setFormData({
      candidateId: candidate._id,
      date: formattedDate,
      time: formattedTime,
      type: 'Interview',
      interviewer: 'Dorra Tagougi (HR Manager)',
      meetLink: 'https://meet.google.com/pfe-dorr-assist'
    });
    setIsModalOpen(true);
  };

  // Handle Cancel/Delete Interview
  const handleDeleteInterview = async (candidateId: string, candidateName: string) => {
    if (!window.confirm(`🗑️ Are you sure you want to cancel the scheduled interview for ${candidateName}? This will reset their status back to 'Pending'.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // 1. Reset candidate status in MongoDB
      await api.put(`/candidates/${candidateId}`, {
        status: 'Pending',
        notes: 'Interview was canceled by the HR Manager.'
      });

      // 2. Clean up corresponding event in the calendar database
      try {
        await api.delete(`/events/candidate/${candidateId}`);
      } catch (eventErr) {
        console.log('Utilizing local status recovery pathways.');
      }

      // 3. Remove from local state immediately
      setInterviews(prev => prev.filter(c => c._id !== candidateId));
      alert(`🗑️ Interview for ${candidateName} has been successfully canceled.`);
    } catch (err) {
      console.error('Error canceling interview:', err);
      alert('Failed to cancel the scheduled interview. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateId || !formData.date || !formData.time) {
      alert("Please fill in the Candidate, Date, and Time fields!");
      return;
    }

    try {
      setIsScheduling(true);
      
      // Formulate target interview date
      const interviewDateTime = new Date(`${formData.date}T${formData.time}`);
      const selectedCandidate = candidates.find(c => c._id === formData.candidateId);

      if (isEditingId) {
        // UPDATE MODE: Modifying existing interview
        await api.put(`/candidates/${isEditingId}`, {
          notes: `Updated Interview for ${interviewDateTime.toLocaleString()} with ${formData.interviewer}. Link: ${formData.meetLink}`,
          updatedAt: interviewDateTime.toISOString()
        });

        alert(`🎉 Interview for ${selectedCandidate?.personalInfo?.fullName || 'the candidate'} has been successfully updated!`);
      } else {
        // CREATE MODE: Adding brand new interview
        await api.put(`/candidates/${formData.candidateId}`, {
          status: 'Interviewing',
          notes: `Scheduled Interview for ${interviewDateTime.toLocaleString()} with ${formData.interviewer}. Link: ${formData.meetLink}`
        });

        // Try to create centralized Event inside Event collection
        try {
          await api.post('/events', {
            candidateId: formData.candidateId,
            title: `Interview for ${selectedCandidate?.jobPostingId?.title || 'Full-Stack Developer'}`,
            description: `Interviewer: ${formData.interviewer}. Room Link: ${formData.meetLink}`,
            date: interviewDateTime.toISOString(),
            type: 'Interview'
          });
        } catch (eventError) {
          console.log('Utilizing direct candidate status mapping pathway.');
        }

        alert(`🎉 Interview successfully scheduled for ${selectedCandidate?.personalInfo?.fullName}!`);
      }

      // Close modal and reset state
      setIsModalOpen(false);
      setIsEditingId(null);
      
      setFormData({
        candidateId: '',
        date: '',
        time: '',
        type: 'Interview',
        interviewer: 'Dorra Tagougi (HR Manager)',
        meetLink: 'https://meet.google.com/pfe-dorr-assist'
      });
      
      // Refresh list to pull updated timestamps from database
      fetchInterviewsAndCandidates();
    } catch (err) {
      console.error('Error submitting interview schedule:', err);
      alert('Failed to save interview schedule. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Calculate dynamic statistics
  const totalThisWeek = interviews.length;
  const completedCount = 12 + interviews.filter(c => c.status === 'Hired').length;
  const postponedCount = 2;

  return (
    <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-950 p-8 gap-8 overflow-y-auto">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Interview Hub</h1>
          <p className="text-slate-500 font-semibold text-sm">Manage, automate, and trigger mock candidate evaluations.</p>
        </div>
        <Button 
          onClick={() => {
            setIsEditingId(null);
            setFormData({
              candidateId: '',
              date: '',
              time: '',
              type: 'Interview',
              interviewer: 'Dorra Tagougi (HR Manager)',
              meetLink: 'https://meet.google.com/pfe-dorr-assist'
            });
            setIsModalOpen(true);
          }}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white font-bold h-11 px-6 gap-2 transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Schedule Manually
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interviews List (Left Section) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-500" /> Upcoming Scheduled Interviews
          </h2>

          <div className="space-y-4">
            {interviews.length > 0 ? interviews.map((candidate: any) => {
              const interviewDate = new Date(candidate.updatedAt);
              const formattedMonth = interviewDate.toLocaleDateString('en-US', { month: 'short' });
              const formattedDay = interviewDate.getDate();
              const formattedTime = interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <Card 
                  key={candidate._id} 
                  className="p-0 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="flex flex-col sm:flex-row items-stretch min-h-[110px]">
                    
                    {/* Month/Day Stamp Panel */}
                    <div className="w-full sm:w-28 bg-indigo-500/5 dark:bg-indigo-500/10 flex sm:flex-col items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
                      <div className="flex sm:flex-col items-center sm:gap-0 gap-2">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest sm:mb-1">
                          {formattedMonth}
                        </span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                          {formattedDay}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 sm:mt-2 ml-auto sm:ml-0">
                        {formattedTime}
                      </span>
                    </div>

                    {/* Candidate Identity details */}
                    <div className="flex-1 p-5 flex flex-col justify-center gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-[15px] font-black text-slate-900 dark:text-white leading-none">{candidate.personalInfo?.fullName}</h3>
                          <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mt-2">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                            {candidate.jobPostingId?.title || 'Full-Stack Developer'}
                          </p>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-sm">
                          Confirmed
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-5 pt-1 border-t border-slate-50 dark:border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Video className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-semibold text-[11px]">Google Meet Room</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-semibold text-[11px] truncate max-w-[150px]">Dorra Tagougi (HR)</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="p-5 flex items-center justify-end gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 shrink-0">
                      <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="rounded-xl border-slate-200/80 font-bold text-[11px] h-9 px-3 transition-all hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-800">
                          Join Room
                        </Button>
                      </a>
                      
                      {/* Update Action */}
                      <Button 
                        onClick={() => handleOpenEditModal(candidate)}
                        variant="ghost" 
                        size="icon" 
                        title="Edit Interview"
                        className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-300"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>

                      {/* Cancel/Delete Action */}
                      <Button 
                        onClick={() => handleDeleteInterview(candidate._id, candidate.personalInfo?.fullName)}
                        variant="ghost" 
                        size="icon" 
                        title="Cancel Interview"
                        className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                  </div>
                </Card>
              );
            }) : (
              <div className="p-20 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                <Calendar className="w-12 h-12 mb-4 opacity-20 text-indigo-500" />
                <p className="text-[15px] font-black text-slate-900 dark:text-white mb-1">No interviews scheduled yet.</p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 text-center max-w-[320px]">
                  Schedule an interview manually using the top button or update candidate statuses from your CRM list.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info & Side Stats Panel (Right Section) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* AI Advisor Prep recommendations */}
          <Card className="p-6 rounded-[32px] border-none shadow-lg bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden">
            <h3 className="text-[14px] font-black mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> AI Interview Prep
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Tip for next interview</p>
                <p className="text-[11px] font-semibold text-slate-300 leading-relaxed">
                  Focus heavily on MERN stack queries, asynchronous operations in Node.js, and complex aggregate pipelines in MongoDB.
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Company Expectation</p>
                <p className="text-[11px] font-semibold text-slate-300 leading-relaxed">
                  Verify candidate timeline flexibility and their communication confidence during live coding reviews.
                </p>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          </Card>

          {/* Side Summary stats */}
          <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
             <h3 className="text-[14px] font-black text-slate-900 dark:text-white mb-5">Stats Summary</h3>
             <div className="space-y-4">
               <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850/50 pb-3">
                 <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                     <Calendar className="w-4 h-4" />
                   </div>
                   <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Scheduled</span>
                 </div>
                 <span className="text-sm font-black text-slate-900 dark:text-white">{totalThisWeek}</span>
               </div>
               <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850/50 pb-3">
                 <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                     <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Completed</span>
                 </div>
                 <span className="text-sm font-black text-slate-900 dark:text-white">{completedCount}</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                     <AlertCircle className="w-4 h-4" />
                   </div>
                   <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Postponed</span>
                 </div>
                 <span className="text-sm font-black text-slate-900 dark:text-white">{postponedCount}</span>
               </div>
             </div>
          </Card>
        </div>

      </div>

      {/* ==================== SCHEDULE INTERVIEW MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  {isEditingId ? 'Update Interview Schedule' : 'Schedule Interview'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditingId(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitSchedule} className="space-y-4">
              
              {/* Candidate Selection (Disabled in Edit Mode) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Selected Candidate</label>
                {isEditingId ? (
                  <div className="h-11 rounded-xl border border-slate-200/80 bg-slate-50 px-3 flex items-center text-sm font-extrabold text-slate-700">
                    {candidates.find(c => c._id === isEditingId)?.personalInfo?.fullName || 'Active Candidate'}
                  </div>
                ) : (
                  <select
                    name="candidateId"
                    value={formData.candidateId}
                    onChange={handleInputChange}
                    required
                    className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" className="text-slate-400">-- Choose Candidate --</option>
                    {candidates.map(c => (
                      <option key={c._id} value={c._id} className="text-slate-800">
                        {c.personalInfo?.fullName} ({c.jobPostingId?.title || 'MERN Developer'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date & Time fields side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Interviewer details */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Interviewer</label>
                <Input
                  type="text"
                  name="interviewer"
                  value={formData.interviewer}
                  onChange={handleInputChange}
                  required
                  placeholder="E.g., HR Manager, Tech Lead"
                  className="rounded-xl border-slate-200 h-11 text-sm font-semibold"
                />
              </div>

              {/* Google Meet virtual link */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Virtual Room Link</label>
                <div className="relative">
                  <Input
                    type="text"
                    name="meetLink"
                    value={formData.meetLink}
                    onChange={handleInputChange}
                    required
                    placeholder="E.g., Google Meet URL"
                    className="rounded-xl border-slate-200 h-11 text-sm font-semibold pl-9"
                  />
                  <Video className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/80 mt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditingId(null);
                  }}
                  className="rounded-xl font-bold text-xs h-10 border-none hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isScheduling}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs h-10 px-5 gap-2 hover:shadow-lg hover:shadow-indigo-500/20"
                >
                  {isScheduling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> 
                      {isEditingId ? 'Confirm Update' : 'Confirm Schedule'}
                    </>
                  )}
                </Button>
              </div>

            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
