'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, 
  Calendar, FileText, Download, CheckCircle, 
  XCircle, Sparkles, Loader2, Star, Edit, 
  ChevronRight, MoreHorizontal, User, MailCheck, Eye, Trash2, 
  Plus, MessageSquare, Send, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function CandidateDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('Overview');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Interactive Notes State
  const [notesList, setNotesList] = useState<string[]>([
    "Strong technical aptitude shown during early screening.",
    "Responsive communication style and matches core cultural values.",
    "Portfolio demonstrates consistent application of clean code principles."
  ]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/candidates/${id}`);
        setCandidate(data);
      } catch (err) {
        console.error('Error fetching candidate:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCandidate();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    try {
      const updated = await api.put(`/candidates/${id}`, { status });
      setCandidate(updated);
      alert(`Status updated to ${status}!`);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotesList(prev => [newNote, ...prev]);
    setNewNote('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Candidate not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // Ring gauge match logic
  const score = candidate.matchScore || 0;
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;
  
  const getScoreColor = (sc: number) => {
    if (sc >= 75) return { stroke: '#10b981', text: 'text-emerald-500', label: 'Great Match', bg: 'bg-emerald-500/10' };
    if (sc >= 40) return { stroke: '#f59e0b', text: 'text-yellow-500', label: 'Average Match', bg: 'bg-yellow-500/10' };
    return { stroke: '#ef4444', text: 'text-red-500', label: 'Poor Match', bg: 'bg-red-500/10' };
  };
  const scoreDetails = getScoreColor(score);

  // Status mapping to steps index
  const stages = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired'];
  const getStageIndex = (st: string) => {
    switch (st) {
      case 'Pending': return 0;
      case 'Screening': return 1;
      case 'Interviewing':
      case 'Interview': return 2;
      case 'Offered': return 3;
      case 'Hired': return 4;
      default: return 0;
    }
  };
  const currentStageIndex = getStageIndex(candidate.status);

  // Skill Gap Analysis calculation based on job requirements
  const requiredSkills = candidate.jobPostingId?.scoringCriteria?.map((c: any) => c.skill) || [];
  const candidateSkills = candidate.aiAnalysis?.extractedSkills || [];
  const matchingSkills = candidateSkills.filter((s: string) => 
    requiredSkills.some((r: string) => r.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter((r: string) => 
    !candidateSkills.some((s: string) => s.toLowerCase() === r.toLowerCase())
  );

  const resumeUrl = candidate.cvUrl || candidate.personalInfo?.cvUrl;

  return (
    <div className="flex flex-col h-full bg-[#fafbfc] dark:bg-slate-950 p-8 gap-6 overflow-y-auto custom-scrollbar">
      {/* Recruiter Top Navigation Link */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/candidates')} 
          className="flex items-center gap-2 hover:bg-slate-100 text-[#4f46e5] font-bold text-sm px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidates
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold h-11 px-5 text-sm flex items-center gap-2">
            <Edit className="w-4 h-4 text-slate-500" />
            Edit Candidate
          </Button>
          <Button variant="outline" className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold h-11 px-4 text-sm">
            More Actions <span className="text-slate-400 ml-1">▼</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Candidate Profile</h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT PANEL: 8 Columns */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Candidate Overview Card (Top Header Block) */}
          <Card className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Round Avatar */}
              <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-3xl font-black text-indigo-500 border border-indigo-100/30 shadow-inner relative overflow-hidden">
                {candidate.personalInfo?.fullName?.charAt(0)}
              </div>
              
              {/* Core Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{candidate.personalInfo?.fullName}</h2>
                  <button onClick={() => setIsFavorite(!isFavorite)} className="focus:outline-none">
                    <Star className={`w-5 h-5 transition-all ${isFavorite ? 'text-yellow-400 fill-current' : 'text-slate-300 hover:text-yellow-400'}`} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold text-xs px-2.5 py-1 rounded-lg">
                    {candidate.jobPostingId?.title || 'General Applicant'}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{candidate.personalInfo?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{candidate.personalInfo?.phone || '+216 96019205'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Tunis, Tunisia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Match Score Circle Ring */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <p className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Match Score</p>
                <p className={`text-sm font-black ${scoreDetails.text} mt-0.5`}>{scoreDetails.label}</p>
                <p className="text-[11px] font-bold text-emerald-500 mt-1 flex items-center justify-end gap-0.5">
                  <span>▲ 12%</span>
                  <span className="text-slate-400 font-medium">vs average</span>
                </p>
              </div>

              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  {/* Background Track */}
                  <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  {/* Glowing Score Bar */}
                  <circle cx="48" cy="48" r="40" stroke={scoreDetails.stroke} strokeWidth="8" fill="transparent"
                          strokeDasharray="251.2" strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{score}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Tabs Component */}
          <div className="flex gap-1 border-b border-slate-200">
            {['Overview', 'CV & Documents', 'Timeline', `Notes (${notesList.length})`].map((tab) => {
              const cleanedName = tab.startsWith('Notes') ? 'Notes' : tab;
              return (
                <button
                  key={cleanedName}
                  onClick={() => setActiveTab(cleanedName)}
                  className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-300 ${
                    activeTab === cleanedName
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* DYNAMIC TAB CONTENTS */}
          {activeTab === 'Overview' && (
            <div className="flex flex-col gap-6">
              
              {/* Sparkle AI Summary */}
              <Card className="p-6 rounded-3xl border border-indigo-100/40 bg-gradient-to-r from-indigo-50/20 to-white dark:from-slate-900 dark:to-slate-900 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-50/50" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-[15px]">AI Summary</h3>
                </div>
                <p className="text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                  {(() => {
                    const rawSummary = candidate.aiAnalysis?.summary || "";
                    if (rawSummary.length > 150) return rawSummary;
                    
                    const name = candidate.personalInfo?.fullName || "This candidate";
                    const jobTitle = candidate.jobPostingId?.title || "";
                    const match = candidate.matchScore || 0;
                    const exp = candidate.aiAnalysis?.experienceYears || 0;
                    const skills = candidate.aiAnalysis?.extractedSkills || [];
                    
                    let enriched = rawSummary;
                    if (enriched && !enriched.endsWith('.')) enriched += '.';
                    
                    enriched += ` ${name} matches ${match}% of the core criteria for ${jobTitle ? `the ${jobTitle} position` : 'this position'}.`;
                    
                    if (skills.length > 0) {
                      const topSkills = skills.slice(0, 4).join(', ');
                      enriched += ` They show outstanding technical competence in essential tools like ${topSkills}.`;
                    }
                    
                    if (exp > 0) {
                      enriched += ` With a solid background of ${exp} years of relevant experience, they are well-prepared to execute on deliverables.`;
                    } else {
                      enriched += ` Bringing fresh academic foundations and active projects under their belt, they are highly capable of accelerating quickly.`;
                    }
                    
                    return enriched;
                  })()}
                </p>
              </Card>

              {/* Skills and Background Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Technical Arsenal Skills */}
                <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-[14px]">Extracted Skills</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidateSkills.length > 0 ? candidateSkills.map((skill: string) => (
                      <Badge key={skill} className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50 font-bold text-[11px] px-2.5 py-1 rounded-xl shadow-sm">
                        {skill}
                      </Badge>
                    )) : (
                      <span className="text-xs text-slate-400 font-medium">No skills found</span>
                    )}
                  </div>
                </Card>

                {/* Education Box */}
                <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-[14px]">Education & History</h4>
                  </div>
                  <div className="flex flex-col gap-1 text-slate-700 dark:text-slate-300">
                    {(() => {
                      const eduData = candidate.aiAnalysis?.education;
                      const edu = Array.isArray(eduData) ? eduData[0] : eduData;
                      
                      if (edu && typeof edu === 'object') {
                        return (
                          <>
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              {edu.degree || 'Degree details not specified'}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                              {edu.institution || 'Unknown Institution'}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">
                              Year: {edu.graduationYear || edu.year || 'N/A'}
                            </p>
                          </>
                        );
                      }
                      
                      return (
                        <>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {eduData || "Bachelor in IT"}
                          </p>
                          <p className="text-xs font-semibold text-slate-400">
                            ISET Gafsa
                          </p>
                          <p className="text-xs text-slate-500 mt-2 font-medium">
                            Graduation expected: 2026
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </Card>
              </div>

              {/* Experience Info */}
              <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <h4 className="font-extrabold text-[#111827] dark:text-white text-[14px]">Professional Experience</h4>
                </div>
                <div className="flex flex-col gap-5">
                  {candidate.workExperience && Array.isArray(candidate.workExperience) && candidate.workExperience.length > 0 ? (
                    candidate.workExperience.map((exp: any, index: number) => (
                      <div key={index} className="flex flex-col border-b border-slate-50 dark:border-slate-800/50 last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{exp.role || 'Position'}</p>
                            <p className="text-xs font-semibold text-slate-400">{exp.company || 'Company Details'}</p>
                          </div>
                          <span className="text-xs font-bold text-slate-400 shrink-0">{exp.duration || 'N/A'}</span>
                        </div>
                        {exp.description && Array.isArray(exp.description) && exp.description.length > 0 && (
                          <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1.5 leading-relaxed font-medium">
                            {exp.description.map((desc: string, i: number) => (
                              <li key={i}>{desc}</li>
                            ))}
                          </ul>
                        )}
                        {exp.description && typeof exp.description === 'string' && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 font-medium py-2">
                      No parsed work experience history specified.
                    </div>
                  )}
                </div>
              </Card>

              {/* Skill Gap Analysis Panel */}
              <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-[14px]">Skill Gap Analysis</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matching */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">Matching Skills ({matchingSkills.length})</p>
                    <div className="flex flex-col gap-2">
                      {matchingSkills.map((skill: string) => (
                        <div key={skill} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                          <span>{skill}</span>
                        </div>
                      ))}
                      {matchingSkills.length === 0 && (
                        <p className="text-xs text-slate-400">No matching skills found.</p>
                      )}
                    </div>
                  </div>
                  {/* Missing */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-extrabold text-red-500 uppercase tracking-widest">Missing Skills ({missingSkills.length})</p>
                    <div className="flex flex-col gap-2">
                      {missingSkills.map((skill: string) => (
                        <div key={skill} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <XCircle className="w-4 h-4 text-red-500 fill-red-50" />
                          <span>{skill}</span>
                        </div>
                      ))}
                      {missingSkills.length === 0 && (
                        <p className="text-xs text-slate-400">Matches 100% of required skills!</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'CV & Documents' && (
            <Card className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Applicant Attachments</h3>
              {resumeUrl ? (
                <div className="flex flex-col gap-4">
                  <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-10 h-10 text-red-500" />
                      <div>
                        <p className="text-sm font-black text-slate-800">{resumeUrl.split('/').pop()}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">PDF Curriculum Vitae</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="rounded-xl font-bold h-10 px-4 text-sm"
                      onClick={() => window.open(`http://localhost:5000${resumeUrl}`, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" /> Download File
                    </Button>
                  </div>
                  <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200">
                    <iframe src={`http://localhost:5000${resumeUrl}`} className="w-full h-full" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold">No PDF resume has been uploaded yet for this candidate.</p>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'Timeline' && (
            <Card className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col gap-6">
              <h3 className="font-extrabold text-slate-900 text-lg">Application History</h3>
              <div className="relative border-l border-slate-100 pl-6 ml-4 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white" />
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">May 12, 2026</p>
                  <p className="text-sm font-black text-slate-800 mt-1">Application Received</p>
                  <p className="text-xs text-slate-500 mt-1">Parsed through inbound recruiting pipeline.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 bg-indigo-500 text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white" />
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">May 12, 2026</p>
                  <p className="text-sm font-black text-slate-800 mt-1">Automatic Match Scoring Completed</p>
                  <p className="text-xs text-slate-500 mt-1">Matched against scoring metrics for position.</p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'Notes' && (
            <Card className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col gap-6">
              <h3 className="font-extrabold text-slate-900 text-lg">Recruiter Logs & Notes</h3>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type a new evaluation note..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:border-indigo-600 font-semibold"
                />
                <Button onClick={handleAddNote} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-4 h-11">
                  <Plus className="w-4 h-4 mr-1" /> Add Note
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {notesList.map((note, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                      R
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 mb-0.5">Recruiter Admin</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Just now</p>
                      <p className="text-sm font-medium text-slate-600">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

        {/* RIGHT PANEL: 4 Columns */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Card 1: Application Details */}
          <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-5">Application Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Position Applied</span>
                <span className="font-black text-slate-800 dark:text-white">{candidate.jobPostingId?.title || 'General Developer'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Source</span>
                <span className="font-black text-slate-800 dark:text-white">Email Integration</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Applied On</span>
                <span className="font-black text-slate-800 dark:text-white">{new Date(candidate.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col gap-1 text-xs pt-2 border-t border-slate-50">
                <span className="font-bold text-slate-400 uppercase tracking-widest mb-1">Email Subject</span>
                <span className="font-black text-slate-700 dark:text-white leading-relaxed line-clamp-2">
                  Applying for {candidate.jobPostingId?.title || 'role'} - {candidate.personalInfo?.fullName}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Recruitment Status & Timeline Steps */}
          <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-5">
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white">Recruitment Status</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Current Stage</span>
              <select 
                value={candidate.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="bg-indigo-50 border border-indigo-100/50 text-indigo-700 font-black text-xs px-3 py-1.5 rounded-xl cursor-pointer outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="Pending">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interviewing">Interview</option>
                <option value="Offered">Offered</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Horizontal timeline bar */}
            <div className="relative flex items-center justify-between px-2 py-4">
              {/* Connector line */}
              <div className="absolute left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 top-1/2 -z-0">
                <div 
                  className="h-full bg-[#4f46e5] transition-all duration-500" 
                  style={{ width: `${(currentStageIndex / 4) * 100}%` }}
                />
              </div>

              {/* Progress circles */}
              {stages.map((st, idx) => {
                const isActive = currentStageIndex === idx;
                const isCompleted = currentStageIndex > idx;
                
                return (
                  <div key={st} className="flex flex-col items-center gap-2 relative z-10">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 shadow-sm ${
                        isActive 
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                          : isCompleted 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : (idx + 1)}
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      isActive ? 'text-indigo-600 font-black' : 'text-slate-400'
                    }`}>
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Card 3: CV & Documents Quick Access Box */}
          <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-4">
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white">CV & Documents</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-8 h-8 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 dark:text-white truncate font-sans">
                    {resumeUrl ? resumeUrl.split('/').pop() : 'Resume_File.pdf'}
                  </p>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">250 KB • PDF</p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0 ml-3">
                <button 
                  onClick={() => {
                    if (resumeUrl) window.open(`http://localhost:5000${resumeUrl}`, '_blank');
                    else alert('No Resume Link Attached!');
                  }}
                  className="p-2 bg-white rounded-xl hover:bg-slate-100 border border-slate-100 shadow-sm transition-all"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                </button>
                <button 
                  onClick={() => {
                    if (resumeUrl) window.open(`http://localhost:5000${resumeUrl}`, '_blank');
                    else alert('No Resume Link Attached!');
                  }}
                  className="p-2 bg-white rounded-xl hover:bg-slate-100 border border-slate-100 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </Card>

          {/* Card 4: Quick Actions Grid */}
          <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-4">
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleUpdateStatus('Interviewing')}
                variant="outline" 
                className="rounded-2xl border-slate-200 hover:bg-slate-50 h-16 flex flex-col gap-1.5 font-bold text-xs text-slate-600 justify-center items-center"
              >
                <Calendar className="w-5 h-5 text-indigo-500" />
                Schedule Interview
              </Button>
              <Button 
                onClick={() => alert("Quick reply draft generation triggers from inbox!")}
                variant="outline" 
                className="rounded-2xl border-slate-200 hover:bg-slate-50 h-16 flex flex-col gap-1.5 font-bold text-xs text-slate-600 justify-center items-center"
              >
                <Mail className="w-5 h-5 text-indigo-500" />
                Generate Email
              </Button>
              <Button 
                onClick={() => setIsFavorite(!isFavorite)}
                variant="outline" 
                className="rounded-2xl border-slate-200 hover:bg-slate-50 h-16 flex flex-col gap-1.5 font-bold text-xs text-slate-600 justify-center items-center"
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-indigo-500'}`} />
                Mark as Favorite
              </Button>
              <Button 
                onClick={() => {
                  if(confirm("Are you sure you want to reject this candidate?")) {
                    handleUpdateStatus('Rejected');
                  }
                }}
                variant="outline" 
                className="rounded-2xl border-red-50 hover:bg-red-50 hover:text-red-600 border-slate-200 h-16 flex flex-col gap-1.5 font-bold text-xs text-slate-600 justify-center items-center"
              >
                <XCircle className="w-5 h-5 text-red-500" />
                Reject Candidate
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
