'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Star, Archive, Trash2, Mail, Eye, Loader2, 
  Bell, CheckCircle, UserPlus, FileText, XCircle, ChevronRight, 
  ChevronLeft, ArrowLeft, Download, Maximize2, MoreHorizontal, 
  Sparkles, Clock, Phone, Briefcase, User, MailCheck, Code, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function MailsPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All Mails');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Toggle skills expansion
  const [showAllSkills, setShowAllSkills] = useState(false);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const data = await api.get('/emails');
      setEmails(data);
      if (data.length > 0 && !selectedEmail) setSelectedEmail(data[0]);
    } catch (err) {
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleEmailUpdate = async (id: string, updates: any) => {
    try {
      await api.put(`/emails/${id}`, updates);
      // Update local state
      setEmails(prev => prev.map(e => e._id === id ? { ...e, ...updates } : e));
      if (selectedEmail?._id === id) {
        setSelectedEmail({ ...selectedEmail, ...updates });
      }
    } catch (err) {
      console.error('Error updating email:', err);
    }
  };

  const [isScheduling, setIsScheduling] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');

  const handleCandidateStatus = async (candidateId: string, status: string) => {
    try {
      if (status === 'Interviewing' && !isScheduling) {
        setIsScheduling(true);
        return;
      }

      await api.put(`/candidates/${candidateId}`, { 
        status,
        interviewDate: status === 'Interviewing' ? interviewDate : null
      });
      
      alert(status === 'Rejected' ? 'Rejection email sent successfully.' : 'Interview invitation sent!');
      setIsScheduling(false);
      fetchEmails(); // Refresh all data
    } catch (err) {
      console.error('Error updating candidate status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const tabs = [
    { id: 'All Mails', label: 'All Mails', count: emails.length },
    { id: 'Applications', label: 'Applications', count: emails.filter(e => e.category === 'Applications').length },
    { id: 'Important', label: 'Important', count: emails.filter(e => e.category === 'Important').length },
    { id: 'Others', label: 'Others', count: emails.filter(e => e.category === 'Others').length },
  ];

  const filteredEmails = emails.filter(email => {
    const matchesTab = email.category === activeTab || activeTab === 'All Mails';
    const matchesSearch = (email.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (email.senderName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmails = filteredEmails.slice(startIndex, startIndex + itemsPerPage);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-orange-500';
      case 'Low': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Interview Scheduling Modal */}
      {isScheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-black mb-2">Schedule Interview</h3>
            <p className="text-slate-500 mb-6 font-medium text-sm">Pick a date and time for {selectedEmail?.candidateId?.personalInfo?.fullName}. We will automatically send them an invitation email.</p>
            
            <input 
              type="datetime-local" 
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 mb-6 font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
            />
            
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setIsScheduling(false)}>Cancel</Button>
              <Button className="flex-1 rounded-2xl h-12 font-bold bg-primary hover:bg-primary/90 text-white" onClick={() => handleCandidateStatus(selectedEmail.candidateId?._id, 'Interviewing')}>Send Invitation</Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Reply Modal */}
      {isReplying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Review AI Draft</h3>
                <p className="text-slate-400 font-medium text-sm">Personalize the message before sending it to {selectedEmail?.senderName}.</p>
              </div>
            </div>
            
            <textarea 
              className="w-full h-64 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 mb-6 font-medium focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-slate-700"
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
            />
            
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setIsReplying(false)}>Cancel</Button>
              <Button className="flex-1 rounded-2xl h-12 font-bold bg-primary hover:bg-primary/90 text-white" onClick={async () => {
                try {
                  await api.post('/emails/reply', {
                    to: selectedEmail.senderEmail,
                    subject: selectedEmail.subject,
                    message: replyDraft
                  });
                  alert('Reply sent successfully!');
                  setIsReplying(false);
                } catch (err) {
                  console.error('Failed to send reply:', err);
                  alert('Failed to send email. Check your .env credentials.');
                }
              }}>Send Reply Now</Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Mails (Smart HR Inbox)</h1>
          <p className="text-xs text-slate-500">AI-powered email management that helps you focus on what matters.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search mails..."
              className="bg-slate-50 border-none rounded-xl pl-10 focus-visible:ring-1 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 gap-2 font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <div className="relative">
            <Button variant="outline" size="icon" className="rounded-full border-slate-200">
              <Bell className="w-4 h-4 text-slate-600" />
            </Button>
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {emails.filter(e => !e.isRead).length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Email List Sidebar */}
        <div className="w-[450px] flex flex-col gap-4 bg-slate-50/30 rounded-3xl border border-slate-100 p-5 overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-100 overflow-x-auto no-scrollbar pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label} 
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-slate-100 shadow-sm">
              <span className="text-xs text-slate-500">Sort by:</span>
              <select className="text-xs font-bold bg-transparent border-none outline-none cursor-pointer">
                <option>Newest</option>
                <option>Priority</option>
                <option>Score</option>
              </select>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400">
              <MoreHorizontal className="w-5 h-5 rotate-90" />
            </Button>
          </div>

          {/* Email List Container */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {paginatedEmails.length > 0 ? paginatedEmails.map((email) => (
              <div
                key={email._id}
                onClick={() => {
                  setSelectedEmail(email);
                  setShowAllSkills(false); // Reset to collapsed view when changing selected email
                  if (!email.isRead) handleEmailUpdate(email._id, { isRead: true });
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  selectedEmail?._id === email._id
                    ? 'bg-white border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/5'
                    : 'bg-white hover:bg-slate-50 border-slate-100'
                } ${!email.isRead ? 'border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${
                    selectedEmail?._id === email._id ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {email.senderName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-[15px] truncate ${!email.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>{email.senderName}</p>
                      <span className="text-[11px] font-medium text-slate-400">
                        {new Date(email.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm truncate mb-1 ${!email.isRead ? 'font-bold text-slate-800' : 'font-semibold text-slate-500'}`}>{email.subject}</p>
                    <p className="text-xs text-slate-400 truncate leading-relaxed">
                      {email.body}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border flex items-center gap-1.5 ${getPriorityColor(email.priority)}`}>
                        {email.priority}
                        <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(email.priority)}`} />
                      </Badge>
                      <div className="flex items-center gap-2">
                        {email.isStarred && <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />}
                        {email.candidateId?.matchScore && (
                          <span className="text-[11px] font-bold text-primary">{email.candidateId.matchScore}% Score</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
                <Mail className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No emails found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEmails.length)} of {filteredEmails.length}
            </span>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-lg"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button 
                  key={i}
                  variant={currentPage === i + 1 ? "secondary" : "ghost"}
                  size="icon" 
                  className={`h-7 w-7 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-lg"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Email Detail Main View */}
        <div className="flex-1 flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Action Bar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedEmail(null)}><ArrowLeft className="w-5 h-5" /></Button>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    className={`text-xs font-semibold gap-2 ${selectedEmail.isRead ? '' : 'text-primary'}`}
                    onClick={() => handleEmailUpdate(selectedEmail._id, { isRead: !selectedEmail.isRead })}
                  >
                    <MailCheck className="w-4 h-4" /> {selectedEmail.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`text-xs font-semibold gap-2 ${selectedEmail.isStarred ? 'text-yellow-600' : ''}`}
                    onClick={() => handleEmailUpdate(selectedEmail._id, { isStarred: !selectedEmail.isStarred })}
                  >
                    <Star className={`w-4 h-4 ${selectedEmail.isStarred ? 'fill-current' : ''}`} /> Star
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-xs font-semibold gap-2"
                    onClick={() => {
                      handleEmailUpdate(selectedEmail._id, { isArchived: true });
                      setSelectedEmail(null);
                    }}
                  >
                    <Archive className="w-4 h-4" /> Archive
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-xs font-semibold gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Delete this email?')) {
                        handleEmailUpdate(selectedEmail._id, { isDeleted: true });
                        setSelectedEmail(null);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {/* Email Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                      {selectedEmail.senderName?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedEmail.senderName}</h2>
                      <p className="text-sm text-slate-500 font-medium">{selectedEmail.senderEmail}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">To: recruitment@yourcompany.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium mb-2">
                      {new Date(selectedEmail.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(selectedEmail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <Badge variant="outline" className={`text-[11px] px-3 py-1 border-2 font-bold ${getPriorityColor(selectedEmail.priority)}`}>
                      {selectedEmail.priority} Priority <XCircle className="w-3 h-3 ml-1 fill-current opacity-20" />
                    </Badge>
                  </div>
                </div>

                {/* Subject & Tags */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{selectedEmail.subject}</h3>
                  <div className="flex gap-2">
                    {selectedEmail.category === 'Applications' && (
                      <Badge className="bg-primary/10 text-primary border-none font-bold text-[11px] px-3 py-1.5 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Job Application
                      </Badge>
                    )}
                    {selectedEmail.category === 'Job Interview' && (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[11px] px-3 py-1.5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> Job Interview
                      </Badge>
                    )}
                    {selectedEmail.category === 'Important' && (
                      <Badge className="bg-purple-50 text-purple-600 border-none font-bold text-[11px] px-3 py-1.5 flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5" /> Important
                      </Badge>
                    )}
                    {selectedEmail.category === 'Others' && (
                      <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[11px] px-3 py-1.5 flex items-center gap-2">
                        <Archive className="w-3.5 h-3.5" /> General
                      </Badge>
                    )}
                    {selectedEmail.candidateId && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[11px] px-3 py-1.5 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> Auto-categorized by AI
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="mb-10 text-slate-600 leading-relaxed space-y-4">
                  {selectedEmail.body.split('\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Attachments Section */}
                {selectedEmail.cvUrl && (
                  <div className="mb-10 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-red-500">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {selectedEmail.cvUrl.split('/').pop()}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">PDF Document</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl" 
                        onClick={() => {
                          if (selectedEmail.cvUrl) {
                            window.open(`http://localhost:5000${selectedEmail.cvUrl}`, '_blank');
                          }
                        }}
                      >
                        <Download className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl" 
                        onClick={() => {
                          if (selectedEmail.cvUrl) {
                            window.open(`http://localhost:5000${selectedEmail.cvUrl}`, '_blank');
                          }
                        }}
                      >
                        <Maximize2 className="w-4 h-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI Extracted Information Section */}
                {selectedEmail.candidateId && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary fill-primary/20" />
                        AI Extracted Information
                      </h4>
                      <Button variant="link" className="text-xs font-bold text-primary" onClick={() => console.log(selectedEmail.candidateId.aiAnalysis)}>Show Raw Data</Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-50">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</p>
                          <p className="text-sm font-bold text-slate-800">{selectedEmail.candidateId.personalInfo?.fullName || selectedEmail.senderName}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-50">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                          <p className="text-sm font-bold text-slate-800">{selectedEmail.senderEmail}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-50">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                          <p className="text-sm font-bold text-slate-800">{selectedEmail.candidateId.personalInfo?.phone || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-50">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Experience</p>
                          <p className="text-sm font-bold text-slate-800">{selectedEmail.candidateId.aiAnalysis?.experienceYears || '0'} Years</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                            <Code className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Skills</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedEmail.candidateId.aiAnalysis?.extractedSkills || []).length > 0 ? (
                            (showAllSkills
                              ? selectedEmail.candidateId.aiAnalysis.extractedSkills
                              : selectedEmail.candidateId.aiAnalysis.extractedSkills.slice(0, 4)
                            ).map((skill: string) => (
                              <Badge key={skill} className="bg-white text-slate-600 border border-slate-200 text-[10px] px-2 py-0.5 shadow-sm">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">No skills extracted</span>
                          )}
                          {!showAllSkills && selectedEmail.candidateId.aiAnalysis?.extractedSkills?.length > 4 && (
                            <Badge 
                              onClick={() => setShowAllSkills(true)}
                              className="bg-primary/10 hover:bg-primary/20 text-primary border-none text-[10px] px-2.5 py-0.5 cursor-pointer font-black transition-all"
                            >
                              +{selectedEmail.candidateId.aiAnalysis.extractedSkills.length - 4} more
                            </Badge>
                          )}
                          {showAllSkills && selectedEmail.candidateId.aiAnalysis?.extractedSkills?.length > 4 && (
                            <Badge 
                              onClick={() => setShowAllSkills(false)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-500 border-none text-[10px] px-2.5 py-0.5 cursor-pointer font-black transition-all"
                            >
                              Show Less
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Match Score</p>
                              <p className="text-sm font-bold text-slate-800">
                                {selectedEmail.candidateId.matchScore}% 
                                {selectedEmail.candidateId.matchScore > 75 ? (
                                  <span className="text-emerald-500 font-medium ml-1">Great Match</span>
                                ) : selectedEmail.candidateId.matchScore > 40 ? (
                                  <span className="text-yellow-500 font-medium ml-1">Average Match</span>
                                ) : (
                                  <span className="text-red-500 font-medium ml-1">Poor Match</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions Footer Section */}
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-4">Quick Actions</h4>
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-primary/5 text-primary border-none hover:bg-primary hover:text-white rounded-2xl h-12 font-bold gap-2"
                          onClick={() => handleCandidateStatus(selectedEmail.candidateId?._id, 'Interviewing')}
                          disabled={!selectedEmail.candidateId || selectedEmail.candidateId.status === 'Interviewing'}
                        >
                          <UserPlus className="w-4 h-4" /> {selectedEmail.candidateId?.status === 'Interviewing' ? 'Added to Interviews' : 'Add to Candidates'}
                        </Button>
                        <Link href="/candidates" className="flex-1">
                          <Button variant="outline" className="w-full border-slate-200 rounded-2xl h-12 font-bold gap-2 text-slate-600">
                            <User className="w-4 h-4" /> View Candidate Profile
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-slate-200 rounded-2xl h-12 font-bold gap-2 text-slate-600" 
                          onClick={() => {
                            const draft = `Hello ${selectedEmail.senderName},\n\nThank you for your application for the ${selectedEmail.candidateId?.jobPostingId?.title || 'position'}. We've reviewed your profile and were impressed by your ${selectedEmail.candidateId?.aiAnalysis?.extractedSkills?.slice(0, 2).join(', ') || 'skills'}.\n\nOur team is currently evaluating your application against our requirements. We will be in touch shortly regarding the next steps.\n\nBest regards,\nRH Recruitment Team`;
                            setReplyDraft(draft);
                            setIsReplying(true);
                          }}
                        >
                          <Mail className="w-4 h-4" /> Generate Reply
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-red-100 text-red-500 hover:bg-red-50 rounded-2xl h-12 px-6 font-bold gap-2"
                          onClick={() => handleCandidateStatus(selectedEmail.candidateId?._id, 'Rejected')}
                          disabled={!selectedEmail.candidateId || selectedEmail.candidateId.status === 'Rejected'}
                        >
                          <XCircle className="w-4 h-4" /> Mark as Rejected
                        </Button>
                      </div>
                    </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Email Selected</h3>
              <p className="max-w-xs text-sm text-slate-500">Select an email from the list on the left to see full details and AI extracted insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
