'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { 
  Users, UserCheck, TrendingUp, Filter, Loader2, Target, BarChart2, Briefcase
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function ReportsPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'30days' | 'quarter' | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesData, jobsData] = await Promise.all([
          api.get('/candidates'),
          api.get('/jobs')
        ]);
        setCandidates(candidatesData);
        setJobs(jobsData);
      } catch (error) {
        console.error('Failed to fetch analytics data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter candidates based on date selection
  const filteredCandidates = candidates.filter(c => {
    if (dateFilter === 'all') return true;
    // Fallback to current date if createdAt is missing so it doesn't break
    const date = new Date(c.createdAt || Date.now());
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (dateFilter === '30days') return diffDays <= 30;
    if (dateFilter === 'quarter') return diffDays <= 90;
    return true;
  });

  // Process data for charts
  const funnelData = [
    { stage: 'Pending', candidates: filteredCandidates.filter(c => c.status === 'Pending').length },
    { stage: 'Screening', candidates: filteredCandidates.filter(c => c.status === 'Screening').length },
    { stage: 'Interviewing', candidates: filteredCandidates.filter(c => c.status === 'Interviewing' || c.status === 'Interview').length },
    { stage: 'Offered', candidates: filteredCandidates.filter(c => c.status === 'Offered').length },
    { stage: 'Hired', candidates: filteredCandidates.filter(c => c.status === 'Hired').length }
  ];

  const processQualityData = () => {
    let exceptional = 0;
    let strong = 0;
    let average = 0;

    filteredCandidates.forEach(c => {
      // Use matchScore (from DB)
      const score = c.matchScore || 0;
      if (score >= 85) exceptional++;
      else if (score >= 70) strong++;
      else average++;
    });

    return [
      { name: 'Exceptional (>85%)', value: exceptional, color: '#10b981' },
      { name: 'Strong (70-84%)', value: strong, color: '#3b82f6' },
      { name: 'Average (<70%)', value: average, color: '#f59e0b' }
    ];
  };
  
  const qualityData = processQualityData();

  // KPIs based on filtered candidates
  const totalCandidates = filteredCandidates.length;
  const activeJobs = jobs.filter(j => j.status === 'Active' || j.status === 'Published').length || jobs.length;
  const avgMatchScore = filteredCandidates.length 
    ? Math.round(filteredCandidates.reduce((acc, c) => acc + (c.matchScore || 0), 0) / filteredCandidates.length)
    : 0;
  const interviewingOrOffer = filteredCandidates.filter(c => ['Interviewing', 'Interview', 'Offered'].includes(c.status)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fafbfc] dark:bg-slate-950 p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Reports & Analytics</h1>
          <p className="text-slate-500 font-medium">Real-time insights across your recruitment pipelines.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => setDateFilter('30days')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${dateFilter === '30days' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Last 30 Days
          </button>
          <button 
            onClick={() => setDateFilter('quarter')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${dateFilter === 'quarter' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            This Quarter
          </button>
          <button 
            onClick={() => setDateFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${dateFilter === 'all' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-sm">Total Candidates</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{totalCandidates}</div>
            <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% from last month
            </p>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-sm">Avg Match Score</h3>
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{avgMatchScore}%</div>
            <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5% from last month
            </p>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-sm">Active Jobs</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{activeJobs}</div>
            <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1">
               Across all departments
            </p>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-sm">Deep Pipeline</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{interviewingOrOffer}</div>
            <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1">
               In Interview or Offer stage
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Recruitment Funnel */}
        <Card className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Recruitment Funnel</h3>
              <p className="text-sm font-medium text-slate-500">Candidate drop-off across hiring stages</p>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="stage" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="candidates" 
                  fill="#4f46e5" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  name="Candidates"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quality Distribution */}
        <Card className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="mb-4">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Candidate Quality</h3>
            <p className="text-sm font-medium text-slate-500">Based on AI Match Scoring</p>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            {totalCandidates === 0 ? (
              <p className="text-sm font-bold text-slate-400">No candidates available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {qualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
}
