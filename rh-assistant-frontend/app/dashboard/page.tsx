'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, FileText, Calendar, Users, TrendingUp, Mail, 
  ArrowUpRight, ArrowDownRight, Loader2, Sparkles, 
  CheckCircle, XCircle, Bell, Search, Filter, MoreHorizontal, User,
  ChevronRight, Upload, UserPlus, Briefcase
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const result = await api.get('/dashboard');
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || { totalCandidates: 0, newApplications: 0, interviewsScheduled: 0, offersAccepted: 0, hired: 0, rejected: 0 };
  const pipeline = data?.pipeline || { applied: 0, screening: 0, interviewing: 0, offered: 0, hired: 0, total: 0 };
  const reminders = data?.reminders || [];
  const topCandidates = data?.topCandidates || [];
  const recentEmails = data?.recentEmails || [];

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-950 p-8 gap-8 overflow-y-auto">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">HR Command Center</h1>
          <p className="text-slate-500 font-medium">Welcome back! Here is your recruitment overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/jobs">
            <Button className="rounded-2xl bg-primary hover:bg-primary/90 text-white px-6 font-bold gap-2 h-11 transition-all duration-300 shadow-md shadow-primary/20 hover:scale-105">
              <Sparkles className="w-4 h-4" /> New Job Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Reminders & My Mails (Smart HR Inbox) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Reminders Column */}
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Reminders
            </h2>
            <Link href="/calendar" className="text-xs font-bold text-primary hover:underline">View Calendar</Link>
          </div>
          <div className="flex flex-col gap-4">
            {reminders.length > 0 ? reminders.map((reminder: any, idx: number) => {
              const colors = [
                'border-l-blue-500 text-blue-600 bg-blue-50/10 hover:border-blue-500/80',
                'border-l-emerald-500 text-emerald-600 bg-emerald-50/10 hover:border-emerald-500/80',
                'border-l-amber-500 text-amber-600 bg-amber-50/10 hover:border-amber-500/80'
              ];
              const borderTheme = colors[idx % colors.length];
              const eventDate = new Date(reminder.date);
              
              const timeString = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              let dateLabel = '';
              const today = new Date();
              const tomorrow = new Date();
              tomorrow.setDate(today.getDate() + 1);
              
              if (eventDate.toDateString() === today.toDateString()) {
                dateLabel = 'Today';
              } else if (eventDate.toDateString() === tomorrow.toDateString()) {
                dateLabel = 'Tomorrow';
              } else {
                dateLabel = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }

              return (
                <div key={reminder._id} className={`p-4 rounded-2xl border-l-4 border border-slate-100/80 dark:border-slate-800/80 flex items-center justify-between group cursor-pointer transition-all duration-300 ${borderTheme}`}>
                  <div className="flex items-start gap-5">
                    <div className="flex flex-col min-w-[75px]">
                      <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{timeString}</p>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{dateLabel}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-tight mb-0.5 group-hover:text-primary transition-colors">{reminder.title}</p>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{reminder.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              );
            }) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Calendar className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-xs font-bold">No upcoming reminders</p>
              </div>
            )}
          </div>
        </div>

        {/* Smart HR Inbox Column */}
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> My Mails (Smart HR Inbox)
            </h2>
            <Link href="/mails" className="text-xs font-bold text-primary hover:underline">View All Mails</Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentEmails.length > 0 ? recentEmails.slice(0, 3).map((email: any) => {
              const priorityColors: any = {
                High: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400',
                Medium: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-400',
                Low: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400'
              };
              
              const priorityDots: any = {
                High: 'bg-red-500',
                Medium: 'bg-orange-500',
                Low: 'bg-blue-500'
              };

              const emailDate = new Date(email.createdAt);
              let dateStr = '';
              const today = new Date();
              if (emailDate.toDateString() === today.toDateString()) {
                dateStr = emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else {
                dateStr = 'Yesterday';
              }

              return (
                <div key={email._id} className="p-4 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-950/80 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 flex items-start justify-between gap-4 cursor-pointer group transition-all duration-300">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-sm shrink-0 border border-primary/10">
                      {email.senderName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{email.senderName}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mb-0.5">{email.subject}</p>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate">{email.body}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-2 min-w-[70px]">
                    <span className="text-[10px] font-bold text-slate-400">{dateStr}</span>
                    <Badge variant="outline" className={`text-[9px] font-bold px-2 py-0.5 border flex items-center gap-1 ${priorityColors[email.priority] || priorityColors.Low}`}>
                      {email.priority || 'Low'}
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityDots[email.priority] || priorityDots.Low}`} />
                    </Badge>
                  </div>
                </div>
              );
            }) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Mail className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-xs font-bold">No recent emails</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Row 2: Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Candidates */}
        <Card className="p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex items-center gap-5 hover:scale-[1.03] hover:shadow-lg transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-inner shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Total Candidates</p>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white leading-none mb-1.5">{stats.totalCandidates}</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>12% from last week</span>
            </div>
          </div>
        </Card>

        {/* Card 2: New Applications */}
        <Card className="p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex items-center gap-5 hover:scale-[1.03] hover:shadow-lg transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">New Applications</p>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white leading-none mb-1.5">{stats.newApplications}</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>8% from last week</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Interviews Scheduled */}
        <Card className="p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex items-center gap-5 hover:scale-[1.03] hover:shadow-lg transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Interviews Scheduled</p>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white leading-none mb-1.5">{stats.interviewsScheduled}</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>16% from last week</span>
            </div>
          </div>
        </Card>

        {/* Card 4: Offers Accepted */}
        <Card className="p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex items-center gap-5 hover:scale-[1.03] hover:shadow-lg transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Offers Accepted</p>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white leading-none mb-1.5">{stats.offersAccepted}</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>2% from last week</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Top Candidates & Recruitment Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Candidates Column */}
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Top Candidates</h2>
            <Link href="/candidates" className="text-xs font-bold text-primary hover:underline">View All Candidates</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80">
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Position</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {topCandidates.slice(0, 3).map((candidate: any) => (
                  <tr key={candidate._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-300">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 font-black text-sm">
                          {candidate.personalInfo?.fullName?.[0] || '?'}
                        </div>
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{candidate.personalInfo?.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-xs font-bold text-slate-500 dark:text-slate-400">{candidate.jobPostingId?.title || 'General'}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${candidate.matchScore}%` }} />
                        </div>
                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{candidate.matchScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/candidates/${candidate._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all duration-300"><ArrowUpRight className="w-4 h-4" /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {topCandidates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      <p className="text-xs font-bold">No candidates rated yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recruitment Pipeline Column */}
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Recruitment Pipeline</h2>
            <Link href="/candidates" className="text-xs font-bold text-primary hover:underline">View Full Pipeline</Link>
          </div>

          {/* Top Tabs */}
          <div className="grid grid-cols-5 gap-2 text-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mt-1">
            {[
              { label: 'Applied', count: pipeline.applied, color: 'border-b-indigo-500' },
              { label: 'Screening', count: pipeline.screening, color: 'border-b-sky-400' },
              { label: 'Interview', count: pipeline.interviewing, color: 'border-b-cyan-400' },
              { label: 'Offered', count: pipeline.offered, color: 'border-b-amber-500' },
              { label: 'Hired', count: pipeline.hired, color: 'border-b-emerald-500' }
            ].map((tab) => (
              <div key={tab.label} className={`flex flex-col items-center pb-1 border-b-2 ${tab.color}`}>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{tab.label}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{tab.count}</span>
              </div>
            ))}
          </div>

          {/* Chart Content Area */}
          <div className="flex flex-col md:flex-row items-center gap-6 mt-2">
            {/* Left side: Doughnut */}
            <div className="relative w-44 h-44 shrink-0 mx-auto md:mx-0">
              <Doughnut 
                data={{
                  labels: ['Applied', 'Screening', 'Interviewing', 'Offered', 'Hired'],
                  datasets: [
                    {
                      data: [
                        pipeline.applied || 0, 
                        pipeline.screening || 0, 
                        pipeline.interviewing || 0, 
                        pipeline.offered || 0, 
                        pipeline.hired || 0
                      ],
                      backgroundColor: [
                        '#6366f1', // Applied (Indigo)
                        '#38bdf8', // Screening (Sky)
                        '#22d3ee', // Interviewing (Cyan)
                        '#f59e0b', // Offered (Amber)
                        '#10b981', // Hired (Emerald)
                      ],
                      borderWidth: 0,
                      hoverOffset: 4,
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  cutout: '75%',
                }} 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{pipeline.total}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Candidates</p>
              </div>
            </div>

            {/* Right side: Detailed Legend */}
            <div className="flex-1 w-full flex flex-col gap-2">
              {[
                { label: 'Applied', count: pipeline.applied, color: 'bg-indigo-500', total: pipeline.total },
                { label: 'Screening', count: pipeline.screening, color: 'bg-sky-400', total: pipeline.total },
                { label: 'Interview', count: pipeline.interviewing, color: 'bg-cyan-400', total: pipeline.total },
                { label: 'Offered', count: pipeline.offered, color: 'bg-amber-500', total: pipeline.total },
                { label: 'Hired', count: pipeline.hired, color: 'bg-emerald-500', total: pipeline.total },
              ].map((item) => {
                const percentage = item.total > 0 ? ((item.count / item.total) * 100).toFixed(1) : '0.0';
                return (
                  <div key={item.label} className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 border-b border-dashed border-slate-100 dark:border-slate-800/40 pb-1 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span>{item.label} ({item.count})</span>
                    </div>
                    <span className="text-slate-800 dark:text-slate-200">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Quick Actions */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm mb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/candidates?openUpload=true" className="w-full">
            <Button variant="outline" className="w-full rounded-2xl h-14 border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-700 dark:text-slate-200 font-extrabold text-sm gap-2 bg-slate-50/50 dark:bg-slate-950/20 hover:scale-[1.03] hover:shadow-sm transition-all duration-300">
              <Upload className="w-5 h-5 text-slate-500" />
              Upload CV
            </Button>
          </Link>
          <Link href="/candidates" className="w-full">
            <Button variant="outline" className="w-full rounded-2xl h-14 border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-700 dark:text-slate-200 font-extrabold text-sm gap-2 bg-slate-50/50 dark:bg-slate-950/20 hover:scale-[1.03] hover:shadow-sm transition-all duration-300">
              <UserPlus className="w-5 h-5 text-slate-500" />
              Add Candidate
            </Button>
          </Link>
          <Link href="/jobs" className="w-full">
            <Button variant="outline" className="w-full rounded-2xl h-14 border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-700 dark:text-slate-200 font-extrabold text-sm gap-2 bg-slate-50/50 dark:bg-slate-950/20 hover:scale-[1.03] hover:shadow-sm transition-all duration-300">
              <Briefcase className="w-5 h-5 text-slate-500" />
              Create Job Posting
            </Button>
          </Link>
          <Link href="/interviews" className="w-full">
            <Button variant="outline" className="w-full rounded-2xl h-14 border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-700 dark:text-slate-200 font-extrabold text-sm gap-2 bg-slate-50/50 dark:bg-slate-950/20 hover:scale-[1.03] hover:shadow-sm transition-all duration-300">
              <Calendar className="w-5 h-5 text-slate-500" />
              Schedule Interview
            </Button>
          </Link>
          <Link href="/email-templates" className="w-full">
            <Button variant="outline" className="w-full rounded-2xl h-14 border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-700 dark:text-slate-200 font-extrabold text-sm gap-2 bg-slate-50/50 dark:bg-slate-950/20 hover:scale-[1.03] hover:shadow-sm transition-all duration-300">
              <Mail className="w-5 h-5 text-slate-500" />
              Generate Email
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

