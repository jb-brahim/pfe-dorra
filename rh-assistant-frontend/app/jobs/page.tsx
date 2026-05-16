'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Search, Filter, Trash2, Edit3, 
  Users, CheckCircle, Clock, Loader2, Sparkles, X,
  Monitor, BarChart3, DollarSign, Building, MoreVertical,
  Eye, Calendar, ChevronLeft, ChevronRight, Upload, UserPlus,
  ArrowUpRight, AlertCircle, Check, HelpCircle, MapPin, Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [activeDropdownDept, setActiveDropdownDept] = useState<string | null>(null);
  const [isEditingDept, setIsEditingDept] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState('');

  // Department state so users can dynamically add more departments
  const [departments, setDepartments] = useState([
    { label: 'IT Department', icon: Monitor, baseColor: 'indigo' },
    { label: 'HR Department', icon: Building, baseColor: 'emerald' },
    { label: 'Marketing Department', icon: BarChart3, baseColor: 'amber' },
    { label: 'Finance Department', icon: DollarSign, baseColor: 'blue' }
  ]);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('IT Department');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Tunis, Tunisia (Hybrid)',
    type: 'Full-time',
    description: '',
    requirements: '',
    experience: '3 - 5 years',
    priority: 'High',
    status: 'Open',
    diploma: "Bachelor's Degree in Computer Science or related field",
    notes: '',
    skills: [] as { skill: string; points: number }[],
    keywords: [] as string[]
  });

  const [skillInput, setSkillInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const handleCreateDept = () => {
    if (newDeptName.trim()) {
      let label = newDeptName.trim();
      if (!label.toLowerCase().includes('dept')) {
        label = label + ' Department';
      }
      setDepartments([
        ...departments,
        { label, icon: Building, baseColor: 'blue' }
      ]);
      setSelectedDepartment(label); // Auto-select newly created department
      setNewDeptName('');
      setIsAddingDept(false);
    }
  };

  const handleDeleteDept = (label: string) => {
    if (window.confirm(`Are you sure you want to delete the "${label}"? This will hide postings inside this department.`)) {
      const updated = departments.filter(d => d.label !== label);
      setDepartments(updated);
      if (selectedDepartment === label) {
        setSelectedDepartment(updated.length > 0 ? updated[0].label : '');
      }
    }
  };

  const handleSaveEditDept = () => {
    if (editingDeptName.trim() && isEditingDept) {
      let label = editingDeptName.trim();
      if (!label.toLowerCase().includes('dept')) {
        label = label + ' Department';
      }
      setDepartments(departments.map(d => d.label === isEditingDept ? { ...d, label } : d));
      if (selectedDepartment === isEditingDept) {
        setSelectedDepartment(label);
      }
      setIsEditingDept(null);
      setEditingDeptName('');
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await api.get('/jobs');
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const name = skillInput.trim();
    if (name) {
      const isDuplicate = formData.skills.some(s => s.skill.toLowerCase() === name.toLowerCase());
      if (!isDuplicate) {
        setFormData({
          ...formData,
          skills: [...formData.skills, { skill: name, points: 15 }]
        });
      }
      setSkillInput(''); // Always clear the input field even if it is a duplicate!
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s.skill !== skillName)
    });
  };

  const handleUpdateSkillPoints = (skillName: string, points: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.map(s => s.skill === skillName ? { ...s, points } : s)
    });
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== kw)
    });
  };

  const handleSubmitJob = async () => {
    try {
      const scoringCriteria = formData.skills;

      const payload = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        requirements: formData.skills.map(s => s.skill).join(', '),
        experience: formData.experience,
        priority: formData.priority,
        status: formData.status,
        scoringCriteria
      };

      if (isEditingId) {
        await api.put(`/jobs/${isEditingId}`, payload);
      } else {
        await api.post('/jobs', payload);
      }

      setIsCreating(false);
      setIsEditingId(null);
      fetchJobs();
      
      // Reset Form Data
      setFormData({
        title: '',
        department: 'Engineering',
        location: 'Tunis, Tunisia (Hybrid)',
        type: 'Full-time',
        description: '',
        requirements: '',
        experience: '3 - 5 years',
        priority: 'High',
        status: 'Open',
        diploma: "Bachelor's Degree in Computer Science or related field",
        notes: '',
        skills: [],
        keywords: []
      });
    } catch (err) {
      console.error('Failed to submit job:', err);
      alert('Failed to save job post.');
    }
  };

  const handleEditClick = (job: any) => {
    const skills = job.scoringCriteria && job.scoringCriteria.length > 0
      ? job.scoringCriteria.map((c: any) => ({ skill: c.skill, points: c.points || 15 }))
      : (job.requirements
          ? job.requirements.split(', ').map((req: string) => ({ skill: req, points: 15 }))
          : []);
    
    setFormData({
      title: job.title || '',
      department: job.department || 'Engineering',
      location: job.location || 'Tunis, Tunisia (Hybrid)',
      type: job.type || 'Full-time',
      description: job.description || '',
      requirements: job.requirements || '',
      experience: job.experience || '3 - 5 years',
      priority: job.priority || 'Medium',
      status: job.status === 'Active' ? 'Open' : (job.status || 'Open'),
      diploma: "Bachelor's Degree in Computer Science or related field",
      notes: '',
      skills: skills,
      keywords: ['problem solving', 'teamwork', 'communication']
    });
    
    setIsEditingId(job._id);
    setIsCreating(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err) {
        console.error('Failed to delete job:', err);
        alert('Failed to delete job post.');
      }
    }
  };

  // Static list helper to match screenshot icons and colors dynamically
  const getJobStyle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('front') || t.includes('react') || t.includes('web')) {
      return { icon: Monitor, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-100' };
    } else if (t.includes('mobile') || t.includes('flutter') || t.includes('app')) {
      return { icon: Monitor, color: 'bg-sky-500/10 text-sky-500 border-sky-100' };
    } else if (t.includes('devops') || t.includes('cloud') || t.includes('infra')) {
      return { icon: ServerIcon, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-100' };
    } else if (t.includes('security') || t.includes('cyber') || t.includes('shield')) {
      return { icon: Shield, color: 'bg-amber-500/10 text-amber-500 border-amber-100' };
    } else {
      return { icon: Briefcase, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-100' };
    }
  };

  // Custom icon fallback for server
  const ServerIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
  );

  const Shield = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
  );

  // Group real jobs into dynamic counts for departments matching the UI cards
  const getDeptCount = (deptLabel: string) => {
    let count = 0;
    let openCount = 0;
    
    // Simple classification logic
    const keyword = deptLabel.split(' ')[0].toLowerCase(); // 'it', 'hr', 'marketing', 'finance'
    
    jobs.forEach(job => {
      const jobDept = (job.department || 'Engineering').toLowerCase();
      const isMatch = (keyword === 'it' && (jobDept.includes('eng') || jobDept.includes('it') || jobDept.includes('tech'))) ||
                      (keyword === 'hr' && (jobDept.includes('hr') || jobDept.includes('hum'))) ||
                      (keyword === 'marketing' && jobDept.includes('mark')) ||
                      (keyword === 'finance' && (jobDept.includes('fin') || jobDept.includes('acc')));
                      
      if (isMatch) {
        count++;
        if (job.status !== 'Closed') openCount++;
      }
    });

    return { count: count || 0, openCount: openCount || 0 };
  };

  // Filtering Job List according to clicked department card & query
  const filteredJobs = jobs.filter(job => {
    // 1. Search Query
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Clicked Department Card
    const deptKeyword = selectedDepartment.split(' ')[0].toLowerCase(); // 'it', 'hr', etc.
    const jobDept = (job.department || 'Engineering').toLowerCase();
    const matchesDept = (deptKeyword === 'it' && (jobDept.includes('eng') || jobDept.includes('it') || jobDept.includes('tech'))) ||
                        (deptKeyword === 'hr' && (jobDept.includes('hr') || jobDept.includes('hum'))) ||
                        (deptKeyword === 'marketing' && jobDept.includes('mark')) ||
                        (deptKeyword === 'finance' && (jobDept.includes('fin') || jobDept.includes('acc')));

    // 3. Status filter
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Open' && job.status !== 'Closed') ||
                          (statusFilter === 'Closed' && job.status === 'Closed');

    return matchesSearch && matchesDept && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-50/30 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 overflow-y-auto">
      
      {/* ----------------- RENDER STUNNING CREATE/EDIT JOB POSTING FORM ----------------- */}
      {isCreating ? (
        <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-8">
          
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Job Postings</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-600 dark:text-slate-300">{isEditingId ? 'Edit Job Posting' : 'Create Job Posting'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {isEditingId ? 'Edit Job Posting' : 'Create New Job Posting'}
            </h1>
            <p className="text-slate-500 font-medium text-sm">Fill in the details of the job position you want to hire for.</p>
          </div>

          {/* Form Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Form Column */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              
              <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-5">
                
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    placeholder="Senior Frontend Developer" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary h-12 font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Description Editor container */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    {/* Toolbar */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center text-xs text-slate-500 dark:text-slate-400 font-semibold select-none">
                      <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-850 text-slate-700 cursor-pointer flex items-center gap-1">Normal <ChevronRight className="w-3 h-3 rotate-90" /></span>
                      <div className="w-[1px] bg-slate-200 h-5 self-center mx-1" />
                      <span className="p-1 px-2.5 rounded hover:bg-slate-200/50 cursor-pointer font-bold text-slate-900 dark:text-white">B</span>
                      <span className="p-1 px-2.5 rounded hover:bg-slate-200/50 cursor-pointer italic text-slate-900 dark:text-white">I</span>
                      <span className="p-1 px-2.5 rounded hover:bg-slate-200/50 cursor-pointer underline text-slate-900 dark:text-white">U</span>
                      <div className="w-[1px] bg-slate-200 h-5 self-center mx-1" />
                      <span className="p-1.5 rounded hover:bg-slate-200/50 cursor-pointer">☰</span>
                      <span className="p-1.5 rounded hover:bg-slate-200/50 cursor-pointer">•☰</span>
                      <span className="p-1.5 rounded hover:bg-slate-200/50 cursor-pointer">🔗</span>
                    </div>
                    {/* Input Text Area */}
                    <textarea 
                      placeholder="We are looking for a Senior Frontend Developer..." 
                      rows={6}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="p-4 w-full border-0 focus:outline-none focus:ring-0 resize-none font-medium text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 min-h-[140px]"
                    />
                    {/* Footer word count */}
                    <div className="p-2 px-4 bg-white dark:bg-slate-900 border-t border-dashed border-slate-100 dark:border-slate-850 flex justify-end">
                      <span className="text-[10px] font-bold text-slate-400">160/2000</span>
                    </div>
                  </div>
                </div>

                {/* Required Skills Tag System (Clean Standard Badges) */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                    Required Skills <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 min-h-[50px] items-center">
                    {formData.skills.map(item => (
                      <Badge key={item.skill} className="bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10 rounded-xl px-3 py-1 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all select-none">
                        {item.skill}
                        <X className="w-3.5 h-3.5 cursor-pointer opacity-80 hover:opacity-100 text-slate-400 hover:text-red-500 transition-colors" onClick={() => handleRemoveSkill(item.skill)} />
                      </Badge>
                    ))}
                    <form onSubmit={handleAddSkill} className="flex-1 min-w-[130px]">
                      <input 
                        type="text" 
                        placeholder="+ Add skill" 
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        className="bg-transparent border-none outline-none focus:ring-0 w-full text-xs font-bold text-slate-600 dark:text-slate-300"
                      />
                    </form>
                  </div>
                </div>

                {/* Dynamic Scoring Weights Allocator Panel */}
                {formData.skills.length > 0 && (
                  <div className="mt-2 p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 flex flex-col gap-4 animate-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200/80 dark:border-slate-800 pb-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                          Configure Scoring Weights
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 leading-none">
                          Set the point value for each required skill.
                        </span>
                      </div>
                      <Badge className="bg-primary hover:bg-primary text-white border-none px-3 py-1 font-black text-xs rounded-xl shadow-md shadow-primary/10">
                        Total: {formData.skills.reduce((sum, s) => sum + s.points, 0)} pts
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {formData.skills.map((item) => (
                        <div 
                          key={item.skill} 
                          className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 px-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm hover:border-primary/25 transition-all group/row"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-primary/40 group-hover/row:bg-primary transition-colors" />
                            <span className="text-xs font-black text-slate-700 dark:text-slate-200">{item.skill}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center">
                              <input 
                                type="number" 
                                min="1" 
                                max="100" 
                                value={item.points} 
                                onChange={(e) => handleUpdateSkillPoints(item.skill, parseInt(e.target.value) || 0)}
                                className="w-18 h-9 text-center text-xs font-extrabold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <span className="text-[11px] font-extrabold text-slate-400 select-none">pts</span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveSkill(item.skill)}
                              className="text-slate-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Diploma */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                    Required Diploma / Education <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.diploma}
                    onChange={e => setFormData({ ...formData, diploma: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-sm h-12 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>Bachelor's Degree in Computer Science or related field</option>
                    <option>Master's Degree in Computer Science / IT / Engineering</option>
                    <option>Self-taught Professional Developer with equivalent portfolio</option>
                    <option>Business administration, HR degree, or Marketing diploma</option>
                  </select>
                </div>

              </Card>

              {/* Additional Notes optional field */}
              <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-4">
                <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">Additional Notes (Optional)</label>
                <textarea 
                  placeholder="Add any additional information about the job..." 
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary p-4 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                />
              </Card>

            </div>

            {/* Right Meta Settings Form Column */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              <Card className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-5">
                
                {/* Department Dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">Department</label>
                  <select 
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-sm h-12 px-3 text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Engineering">Engineering (IT)</option>
                    <option value="HR">HR Department</option>
                    <option value="Marketing">Marketing Department</option>
                    <option value="Finance">Finance Department</option>
                  </select>
                </div>

                {/* Location Input/Select */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">Location</label>
                  <select 
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-sm h-12 px-3 text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option>Tunis, Tunisia (Hybrid)</option>
                    <option>Tunis, Tunisia (On-site)</option>
                    <option>Sousse, Tunisia (Hybrid)</option>
                    <option>Tunis, Tunisia (Remote)</option>
                    <option>Fully Remote (Global)</option>
                  </select>
                </div>

                {/* Employment Type Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">Employment Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-sm h-12 px-3 text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                {/* Priority Selection Pills */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">Priority Level</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-sm h-12 px-3 text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟠 Medium Priority</option>
                    <option value="Low">🔵 Low Priority</option>
                  </select>
                </div>

                {/* Job Status Choice */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">Job Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-sm h-12 px-3 text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Open">🟢 Open</option>
                    <option value="Closed">🔴 Closed</option>
                  </select>
                </div>

                {/* Minimum Experience Years Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">Minimum Experience (Years)</label>
                  <div className="relative flex items-center">
                    <Input 
                      placeholder="3" 
                      value={formData.experience.replace(/[^0-9]/g, '')}
                      onChange={e => setFormData({ ...formData, experience: `${e.target.value} years` })}
                      className="rounded-xl border-slate-200 dark:border-slate-800 h-12 font-bold pr-14 text-slate-800 dark:text-slate-100"
                    />
                    <span className="absolute right-4 text-xs font-black text-slate-400 select-none">years</span>
                  </div>
                </div>

                {/* Keywords Optional tag fields */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider">Keywords (Optional)</label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 min-h-[45px] items-center">
                    {formData.keywords.map(kw => (
                      <Badge key={kw} className="bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-none rounded-lg px-2.5 py-0.5 font-bold text-xs flex items-center gap-1">
                        {kw}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveKeyword(kw)} />
                      </Badge>
                    ))}
                    <form onSubmit={handleAddKeyword} className="flex-1 min-w-[100px]">
                      <input 
                        type="text" 
                        placeholder="+ Add keyword" 
                        value={keywordInput}
                        onChange={e => setKeywordInput(e.target.value)}
                        className="bg-transparent border-none outline-none focus:ring-0 w-full text-xs font-bold text-slate-500 dark:text-slate-400"
                      />
                    </form>
                  </div>
                </div>

              </Card>

              {/* Drag and Drop Uploader Mock container */}
              <Card className="p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center p-8 cursor-pointer group hover:border-primary/50 transition-all duration-300">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300 mb-3" />
                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mb-1 leading-tight">Drag & drop files here or <span className="text-primary hover:underline">click to upload</span></p>
                <p className="text-[10px] font-bold text-slate-400">PDF, DOCX, JPG or PNG (Max. 5MB)</p>
              </Card>

            </div>

          </div>

          {/* Action Footer Button Group */}
          <div className="flex items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800 pt-6 mb-8">
            <Button 
              variant="outline" 
              onClick={() => { setIsCreating(false); setIsEditingId(null); }}
              className="rounded-2xl h-12 px-6 font-black text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitJob}
              className="rounded-2xl h-12 px-8 bg-primary hover:bg-primary/95 text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/10"
            >
              {isEditingId ? 'Save Changes' : 'Create Job Posting'}
            </Button>
          </div>

        </div>
      ) : (
        /* ----------------- RENDER STUNNING JOB BOARD & DEPARTMENTS VIEW ----------------- */
        <div className="p-8 flex flex-col gap-8">
          
          {/* Top Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span>Job Postings</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-600 dark:text-slate-300">Departments</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">Departments</h1>
              <p className="text-slate-500 font-medium">Organize job postings by departments</p>
            </div>
            
            <Button 
              onClick={() => setIsAddingDept(true)}
              className="rounded-2xl bg-primary hover:bg-primary/95 text-white h-12 px-6 font-black gap-2 hover:scale-105 transition-all shadow-md shadow-primary/15"
            >
              <Plus className="w-5 h-5 font-black" /> Add Department
            </Button>
          </div>

          {/* Departments Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => {
              const Icon = dept.icon || Building;
              const isSelected = selectedDepartment === dept.label;
              const stats = getDeptCount(dept.label);
              
              // Dynamic colors matching screenshot 2 style
              const activeClasses = isSelected 
                ? 'border-primary ring-2 ring-primary/10 shadow-lg bg-white dark:bg-slate-900' 
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900';

              return (
                <Card 
                  key={dept.label}
                  onClick={() => setSelectedDepartment(dept.label)}
                  className={`p-6 rounded-[28px] border-2 cursor-pointer flex flex-col justify-between hover:scale-[1.03] hover:shadow-lg transition-all duration-300 relative overflow-hidden ${activeClasses}`}
                >
                  {/* Card Icon & Actions header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                      dept.baseColor === 'indigo' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-100' :
                      dept.baseColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-100' :
                      dept.baseColor === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-100' :
                      'bg-blue-500/10 text-blue-500 border-blue-100'
                    }`}>
                      <Icon className="w-5 h-5 font-black" />
                    </div>
                    
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-50 relative"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent changing card selection
                          setActiveDropdownDept(activeDropdownDept === dept.label ? null : dept.label);
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>

                      {activeDropdownDept === dept.label && (
                        <div 
                          className="absolute right-0 top-9 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-50 text-left font-bold text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div 
                            className="px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-200"
                            onClick={() => {
                              setIsEditingDept(dept.label);
                              setEditingDeptName(dept.label);
                              setActiveDropdownDept(null);
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-primary" /> Edit
                          </div>
                          <div 
                            className="px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2 text-red-500"
                            onClick={() => {
                              handleDeleteDept(dept.label);
                              setActiveDropdownDept(null);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Labels */}
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 leading-tight mb-4">{dept.label}</h3>
                    
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500">
                      <div className="flex flex-col">
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold">{stats.count}</span>
                        <span>Job Postings</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold">{stats.openCount}</span>
                        <span>Open Positions</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected indicator bottom ribbon folder color */}
                  {isSelected && (
                    <div className="absolute right-4 bottom-14 opacity-40">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary w-6 h-6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Table Container Segment */}
          <div className="flex flex-col gap-5 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            
            {/* Filter and Table Action Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Title & Badge */}
              <div className="flex items-center gap-2.5 self-start md:self-auto">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Job Postings in {selectedDepartment}</h2>
                <Badge className="bg-primary/10 text-primary border-none rounded-full px-2.5 py-0.5 font-bold text-xs">
                  {filteredJobs.length}
                </Badge>
              </div>

              {/* Action Elements Right */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                
                {/* Search */}
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <Input 
                    type="text" 
                    placeholder="Search job posts..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl h-11 border-slate-100 focus:ring-primary focus:border-primary font-semibold text-xs"
                  />
                </div>

                {/* Filter Selector */}
                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 font-bold text-xs h-11 px-4 text-slate-600 dark:text-slate-300 focus:outline-none border select-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open Only</option>
                  <option value="Closed">Closed Only</option>
                </select>

                <Button 
                  onClick={() => setIsCreating(true)}
                  className="rounded-xl bg-primary hover:bg-primary/95 text-white h-11 px-4 font-extrabold text-xs gap-1.5 shrink-0"
                >
                  <Plus className="w-4.5 h-4.5" /> Add Job Posting
                </Button>

              </div>

            </div>

            {/* Main Job Postings Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-850">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Job Title</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Posted On</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Candidates</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                  {filteredJobs.map((job) => {
                    const jobStyle = getJobStyle(job.title);
                    const CustomIcon = jobStyle.icon;
                    const dateString = new Date(job.createdAt || Date.now()).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr key={job._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-all duration-200 group">
                        
                        {/* Title and Badge */}
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${jobStyle.color}`}>
                              <CustomIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{job.title}</span>
                              <span className="text-xs font-bold text-slate-400 mt-0.5">{job.type || 'Full-time'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400">
                          {job.location || 'Tunis, Tunisia'}
                        </td>

                        {/* Experience */}
                        <td className="py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400">
                          {job.experience || '2 - 3 years'}
                        </td>

                        {/* Date */}
                        <td className="py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400">
                          {dateString}
                        </td>

                        {/* Dynamic Candidates Count */}
                        <td className="py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-extrabold text-slate-850 dark:text-slate-100">
                              {job.candidateCount || 0}
                            </span>
                            {job.newCandidateCount > 0 && (
                              <span className="text-[10px] font-bold text-emerald-500 animate-pulse">
                                {job.newCandidateCount} New
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4">
                          <Badge className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border-none ${
                            job.status !== 'Closed' 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                              : 'bg-red-50 text-red-600 dark:bg-red-950/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                              job.status !== 'Closed' ? 'bg-emerald-500' : 'bg-red-500'
                            }`} />
                            {job.status === 'Active' ? 'Open' : (job.status || 'Open')}
                          </Badge>
                        </td>

                        {/* Actions group */}
                        <td className="py-4 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              onClick={() => handleEditClick(job)}
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDeleteJob(job._id)}
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {filteredJobs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Briefcase className="w-10 h-10 mb-2 opacity-20 mx-auto" />
                        <p className="text-xs font-black">No job postings found in this department</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matches screenshot 2 */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4 text-xs font-bold text-slate-400 dark:text-slate-500">
              <span>Showing 1 to {filteredJobs.length} of {filteredJobs.length} job postings</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-slate-100 dark:border-slate-800"><ChevronLeft className="w-4 h-4" /></Button>
                <Button className="h-8 px-3 bg-primary text-white font-black text-xs rounded-lg shadow-sm">1</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-slate-100 dark:border-slate-800"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ----------------- RENDER ADD DEPARTMENT MODAL ----------------- */}
      {isAddingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Add New Department</h3>
              <button onClick={() => setIsAddingDept(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Department Name</label>
              <Input 
                placeholder="e.g. Sales Department, Security" 
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                className="rounded-xl h-12 border-slate-200 font-bold"
              />
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsAddingDept(false)} className="rounded-xl h-11 font-bold">Cancel</Button>
              <Button onClick={handleCreateDept} className="rounded-xl h-11 bg-primary text-white font-black px-5">Add Department</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ----------------- RENDER EDIT DEPARTMENT MODAL ----------------- */}
      {isEditingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Edit Department Name</h3>
              <button onClick={() => setIsEditingDept(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Department Name</label>
              <Input 
                placeholder="e.g. Sales Department" 
                value={editingDeptName}
                onChange={e => setEditingDeptName(e.target.value)}
                className="rounded-xl h-12 border-slate-200 font-bold"
              />
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsEditingDept(null)} className="rounded-xl h-11 font-bold">Cancel</Button>
              <Button onClick={handleSaveEditDept} className="rounded-xl h-11 bg-primary text-white font-black px-5">Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
