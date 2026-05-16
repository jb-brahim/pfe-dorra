'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, User, Mail, Phone, Briefcase, 
  CheckCircle, XCircle, Clock, Loader2, ArrowUpRight, 
  MapPin, ExternalLink, Sparkles, MoreHorizontal,
  LayoutGrid, List, X, UploadCloud, FileText, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to high-end list table
  
  // Add Candidate Modal & State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSubTab, setModalSubTab] = useState<'ai' | 'manual'>('ai'); // 'ai' = drag and drop CV parser, 'manual' = manual entry
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobsList, setJobsList] = useState<any[]>([]);
  
  // Forms
  const [aiUploadForm, setAiUploadForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobId: ''
  });

  const [newCandidateForm, setNewCandidateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobId: '',
    status: 'Pending',
    matchScore: 80,
    summary: '',
    extractedSkills: ''
  });

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await api.get('/candidates');
      setCandidates(data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await api.get('/jobs');
      setJobsList(data);
      if (data && data.length > 0) {
        setAiUploadForm(prev => ({ ...prev, jobId: data[0]._id })); // Default to first job posting
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
    
    // Check if coming from dashboard quick action "Upload CV"
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('openUpload') === 'true') {
        setIsAddModalOpen(true);
        setModalSubTab('ai');
      }
    }
  }, []);

  const filteredCandidates = candidates.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch = (c.personalInfo?.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (c.personalInfo?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Hired': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30';
      case 'Interviewing': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700/30';
    }
  };

  // Click handler for exporting Candidate profiles to CSV spreadsheets
  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates to export!");
      return;
    }
    
    // Construct CSV headers and rows
    const headers = ["Full Name", "Email", "Phone", "Job Title", "Match Score", "Date Applied", "Status"];
    const rows = filteredCandidates.map(c => [
      c.personalInfo?.fullName || "",
      c.personalInfo?.email || "",
      c.personalInfo?.phone || "",
      c.jobPostingId?.title || "General Application",
      `${c.matchScore || 0}%`,
      new Date(c.createdAt).toLocaleDateString(),
      c.status || "Pending"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    // Create immediate download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit handler for uploading CV & triggering n8n matching
  const handleAiCvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiUploadForm.email) {
      alert("Candidate email address is required so AI can match and index their resume!");
      return;
    }
    if (!selectedFile) {
      alert("Please upload a candidate PDF CV file to analyze!");
      return;
    }
    if (!aiUploadForm.jobId) {
      alert("Please select a target Job Posting to evaluate this candidate against!");
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('fullName', aiUploadForm.fullName);
      formData.append('email', aiUploadForm.email);
      formData.append('phone', aiUploadForm.phone);
      formData.append('jobId', aiUploadForm.jobId);
      formData.append('cv', selectedFile);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/candidates/upload-cv`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to upload CV file");
      }

      alert("🎉 CV uploaded successfully! Your n8n recruitment pipeline is processing it. This candidate is now evaluating in the background!");
      setIsAddModalOpen(false);
      setSelectedFile(null);
      setAiUploadForm({
        fullName: '',
        email: '',
        phone: '',
        jobId: jobsList[0]?._id || ''
      });
      fetchCandidates(); // Load background processing item immediately
    } catch (err) {
      console.error(err);
      alert("Failed to initiate AI CV evaluation.");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit handler for manually entering candidate files (Fallback)
  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateForm.fullName || !newCandidateForm.email) {
      alert("Name and email are required!");
      return;
    }
    
    try {
      await api.post('/candidates', newCandidateForm);
      alert("Candidate profile added successfully!");
      setIsAddModalOpen(false);
      setNewCandidateForm({
        fullName: '',
        email: '',
        phone: '',
        jobId: '',
        status: 'Pending',
        matchScore: 80,
        summary: '',
        extractedSkills: ''
      });
      fetchCandidates(); // Instant screen refresh
    } catch (err) {
      console.error('Error creating candidate:', err);
      alert("Failed to create candidate profile.");
    }
  };

  // Drag and Drop files handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
      } else {
        alert("Please upload a valid PDF resume file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
    <div className="flex flex-col h-full bg-[#fafbfc] dark:bg-slate-950 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1400px] w-full mx-auto p-8 flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Candidates Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Manage, filter, and track all applicants in your pipeline.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              className="rounded-2xl h-11 px-6 font-bold border-slate-200 dark:border-slate-800 dark:text-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
            >
              Export CSV
            </Button>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-11 px-6 font-bold text-white shadow-lg shadow-indigo-100 dark:shadow-none text-sm transition-all"
            >
              Add Candidate
            </Button>
          </div>
        </div>

        {/* Filters and View Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {['All', 'Pending', 'Interviewing', 'Rejected', 'Hired'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                  statusFilter === status 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-lg md:justify-end">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 h-11 rounded-2xl border-none bg-white dark:bg-slate-900 dark:text-white shadow-sm font-semibold text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Toggle */}
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <Filter className="w-4 h-4 text-slate-500" />
            </Button>

            {/* Premium Layout Switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                title="List table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Candidates Rendering */}
        {filteredCandidates.length > 0 ? (
          viewMode === 'list' ? (
            /* Premium Dense List Table View */
            <Card className="rounded-[28px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10.5px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-4.5 px-6">Candidate</th>
                      <th className="py-4.5 px-6">Job Role</th>
                      <th className="py-4.5 px-6">Match Score</th>
                      <th className="py-4.5 px-6">Date Applied</th>
                      <th className="py-4.5 px-6">Status</th>
                      <th className="py-4.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {filteredCandidates.map(c => (
                      <tr key={c._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-all group">
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center justify-center font-black text-indigo-500 text-sm border border-indigo-50/10 shrink-0">
                              {c.personalInfo?.fullName?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{c.personalInfo?.fullName}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5 truncate">{c.personalInfo?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {c.jobPostingId?.title || 'General Application'}
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-2">
                            {c.matchScore === 0 && c.aiAnalysis?.summary?.includes('Analyzing') ? (
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                                <span>Evaluating (AI)...</span>
                              </div>
                            ) : (
                              <>
                                <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
                                  <div 
                                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${c.matchScore || 0}%` }}
                                  />
                                </div>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{c.matchScore || 0}%</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <Badge variant="outline" className={`rounded-lg px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider ${getStatusStyle(c.status)}`}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/candidates/${c._id}`}>
                              <Button variant="outline" size="sm" className="rounded-xl h-9 font-bold px-3 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 text-xs flex items-center gap-1 transition-all shadow-sm">
                                View Details <ArrowUpRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            /* Premium Grid View (Now constrained cleanly so it never stretches on large screens) */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCandidates.map(c => (
                <Card key={c._id} className="p-6 rounded-[32px] border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative flex flex-col justify-between">
                  <div>
                    {/* Match Score Badge */}
                    <div className="absolute top-6 right-6">
                      {c.matchScore === 0 && c.aiAnalysis?.summary?.includes('Analyzing') ? (
                        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-xl text-xs font-black">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>AI Processing</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{c.matchScore}%</div>
                          <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1">Match Score</div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-5 mb-6">
                      <div className="w-16 h-16 rounded-[20px] bg-indigo-55/10 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-indigo-500 dark:text-slate-400 border border-indigo-50/10 shadow-inner">
                        {c.personalInfo?.fullName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-black text-lg text-slate-900 dark:text-white truncate pr-16">{c.personalInfo?.fullName}</h3>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          {c.jobPostingId?.title || 'General Application'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium truncate">{c.personalInfo?.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{c.personalInfo?.phone || 'No phone provided'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">Applied {new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                    <Badge variant="outline" className={`rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider ${getStatusStyle(c.status)}`}>
                      {c.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Link href={`/candidates/${c._id}`}>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100 dark:border-slate-850 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm bg-white dark:bg-slate-900 dark:text-white">
                          <ArrowUpRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* AI Summary insight indicator on hover */}
                  <div className="mt-4 p-4 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-2xl border border-indigo-50/30 dark:border-indigo-900/10 hidden group-hover:block animate-in slide-in-from-top-2 duration-300">
                     <div className="flex items-center gap-2 mb-1.5">
                       <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                       <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">AI Insight Summary</span>
                     </div>
                     <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold line-clamp-2">
                       {c.aiAnalysis?.summary || 'Candidate matches most core requirements for this position.'}
                     </p>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] shadow-sm">
            <User className="w-16 h-16 opacity-10 mb-4" />
            <p className="text-lg font-bold">No candidates found matching your criteria.</p>
          </div>
        )}

        {/* Add Candidate Pop-up Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-xl p-8 rounded-[32px] border-none shadow-2xl bg-white dark:bg-slate-900 relative animate-in zoom-in-95 duration-200 flex flex-col gap-6 mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              
              {/* Processing Overlay inside Modal during AI CV analysis upload */}
              {isUploading && (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 z-50 rounded-[32px] flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-950 border-t-indigo-600 animate-spin flex items-center justify-center" />
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 animate-pulse mt-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-black tracking-tight text-lg">AI Recruiting Engine Ingesting CV...</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-sm">
                    We are creating the profile on MongoDB and emailing the attachment directly to your **n8n pipeline** inbox to execute automatic Groq AI skill evaluation!
                  </p>
                </div>
              )}

              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Add New Candidate</h3>
                <p className="text-xs font-semibold text-slate-400">Ingest a candidate directly into your automated matching system.</p>
              </div>

              {/* Sub-Tab Navigation Switcher */}
              <div className="flex border-b border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalSubTab('ai')}
                  className={`flex items-center gap-2 pb-3 px-4 text-xs font-black border-b-2 transition-all ${
                    modalSubTab === 'ai' 
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  AI Resume PDF Upload
                </button>
                <button
                  type="button"
                  onClick={() => setModalSubTab('manual')}
                  className={`flex items-center gap-2 pb-3 px-4 text-xs font-black border-b-2 transition-all ${
                    modalSubTab === 'manual' 
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Manual Entry (Fallback)
                </button>
              </div>

              {modalSubTab === 'ai' ? (
                /* 📁 Tab 1: AI PDF CV Upload Mode */
                <form onSubmit={handleAiCvUpload} className="flex flex-col gap-5">
                  {/* Drag and Drop Box */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      selectedFile 
                        ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30' 
                        : 'border-slate-200 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/5 dark:border-slate-800'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="cv-file-picker" 
                      accept=".pdf"
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                    <label htmlFor="cv-file-picker" className="w-full h-full flex flex-col items-center cursor-pointer gap-2.5">
                      {selectedFile ? (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-500">
                            <Check className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[280px]">
                              {selectedFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-500 border border-indigo-50/10">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-850 dark:text-white">
                              Drag and drop candidate's CV, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                              Supports PDF documents (Max 10MB)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Candidate Name (Optional)</label>
                      <Input 
                        placeholder="Jane Doe (Leave blank to auto-extract)"
                        className="h-10.5 rounded-xl border border-slate-150 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 font-semibold text-xs text-slate-800 dark:text-white"
                        value={aiUploadForm.fullName}
                        onChange={(e) => setAiUploadForm({ ...aiUploadForm, fullName: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Candidate Email (Required)</label>
                      <Input 
                        required
                        type="email"
                        placeholder="jane.doe@gmail.com"
                        className="h-10.5 rounded-xl border border-slate-150 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 font-semibold text-xs text-slate-800 dark:text-white"
                        value={aiUploadForm.email}
                        onChange={(e) => setAiUploadForm({ ...aiUploadForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone Number (Optional)</label>
                      <Input 
                        placeholder="+216 22 222 222"
                        className="h-10.5 rounded-xl border border-slate-150 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 font-semibold text-xs text-slate-800 dark:text-white"
                        value={aiUploadForm.phone}
                        onChange={(e) => setAiUploadForm({ ...aiUploadForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Target Job Posting (Required to Score)</label>
                      <select 
                        required
                        className="w-full h-10.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-3 font-semibold text-xs focus:outline-none focus:border-indigo-600 dark:text-white text-slate-800"
                        value={aiUploadForm.jobId}
                        onChange={(e) => setAiUploadForm({ ...aiUploadForm, jobId: e.target.value })}
                      >
                        <option value="" disabled>Select Job Position</option>
                        {jobsList.map(j => (
                          <option key={j._id} value={j._id}>{j.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-11 text-white font-bold text-xs mt-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> Upload & Evaluate via AI Recruiter
                  </Button>
                </form>
              ) : (
                /* ✍️ Tab 2: Manual Entry Mode (Fallback) */
                <form onSubmit={handleCreateCandidate} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                      <Input 
                        required
                        placeholder="Jane Doe"
                        className="h-10.5 rounded-xl border border-slate-150 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 font-semibold text-xs text-slate-800 dark:text-white"
                        value={newCandidateForm.fullName}
                        onChange={(e) => setNewCandidateForm({ ...newCandidateForm, fullName: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
                      <Input 
                        required
                        type="email"
                        placeholder="jane@example.com"
                        className="h-10.5 rounded-xl border border-slate-150 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 font-semibold text-xs text-slate-800 dark:text-white"
                        value={newCandidateForm.email}
                        onChange={(e) => setNewCandidateForm({ ...newCandidateForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone Number</label>
                      <Input 
                        placeholder="+216 22 222 222"
                        className="h-10.5 rounded-xl border border-slate-150 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 font-semibold text-xs text-slate-800 dark:text-white"
                        value={newCandidateForm.phone}
                        onChange={(e) => setNewCandidateForm({ ...newCandidateForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Linked Job Posting</label>
                      <select 
                        className="w-full h-10.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-3 font-semibold text-xs focus:outline-none focus:border-indigo-600 dark:text-white text-slate-800"
                        value={newCandidateForm.jobId}
                        onChange={(e) => setNewCandidateForm({ ...newCandidateForm, jobId: e.target.value })}
                      >
                        <option value="">General Application (No Job Link)</option>
                        {jobsList.map(j => (
                          <option key={j._id} value={j._id}>{j.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pipeline Stage</label>
                      <select 
                        className="w-full h-10.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-3 font-semibold text-xs focus:outline-none focus:border-indigo-600 dark:text-white text-slate-800"
                        value={newCandidateForm.status}
                        onChange={(e) => setNewCandidateForm({ ...newCandidateForm, status: e.target.value })}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Screening">Screening</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offered</option>
                        <option value="Hired">Hired</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Initial Match Score (%)</label>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        className="h-10.5 rounded-xl border border-slate-150 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 font-semibold text-xs text-slate-800 dark:text-white"
                        value={newCandidateForm.matchScore}
                        onChange={(e) => setNewCandidateForm({ ...newCandidateForm, matchScore: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Extracted Skills (comma separated)</label>
                    <Input 
                      placeholder="React, Node.js, Spring Boot, Java"
                      className="h-10.5 rounded-xl border border-slate-150 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 font-semibold text-xs text-slate-800 dark:text-white"
                      value={newCandidateForm.extractedSkills}
                      onChange={(e) => setNewCandidateForm({ ...newCandidateForm, extractedSkills: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">AI Evaluation Summary</label>
                    <textarea 
                      rows={3}
                      placeholder="Brief evaluation summary of the candidate's core strengths..."
                      className="w-full p-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl font-semibold text-xs focus:outline-none focus:border-indigo-600 dark:text-white text-slate-800 resize-none"
                      value={newCandidateForm.summary}
                      onChange={(e) => setNewCandidateForm({ ...newCandidateForm, summary: e.target.value })}
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-11 text-white font-bold text-xs mt-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all"
                  >
                    Create Candidate Profile
                  </Button>
                </form>
              )}
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
