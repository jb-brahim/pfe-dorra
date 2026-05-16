'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Search, 
  Calendar as CalendarIcon, Clock, User, 
  Video, MapPin, Loader2, Filter, Trash2, X, Briefcase, Info, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { api } from '@/lib/api';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Interview',
    date: '',
    time: '',
    candidateId: '',
    description: 'Online technical evaluation and interview review.'
  });

  const fetchEventsAndCandidates = async () => {
    try {
      setLoading(true);
      // 1. Fetch Events
      const data = await api.get('/events');
      const mapped = data.map((e: any) => ({
        id: e._id,
        day: new Date(e.date).getDate(),
        month: new Date(e.date).getMonth(),
        year: new Date(e.date).getFullYear(),
        title: e.title,
        time: new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: e.type,
        fullDate: e.date,
        candidateId: e.candidateId?._id || e.candidateId,
        candidateName: e.candidateId?.personalInfo?.fullName || 'External Participant',
        description: e.description || ''
      }));
      setEvents(mapped);

      // 2. Fetch Candidates
      const cands = await api.get('/candidates');
      setCandidates(cands);

    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndCandidates();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open scheduler prefilled with a specific day
  const handleOpenSchedulerOnDay = (dayNum: number) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setFormData({
      title: 'Google Meet Interview',
      type: 'Interview',
      date: targetDateStr,
      time: '10:00',
      candidateId: '',
      description: 'Online technical evaluation and interview review.'
    });
    setIsScheduleOpen(true);
  };

  // Open detailed popup when clicking an event pill
  const handleOpenEventDetails = (event: any) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  // Create event submission
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in the title, date, and time fields!');
      return;
    }

    try {
      setIsSaving(true);
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      // Assemble payload
      const payload = {
        title: formData.title,
        type: formData.type,
        date: eventDateTime.toISOString(),
        description: formData.description,
        candidateId: formData.candidateId || undefined
      };

      // 1. Post to backend events
      await api.post('/events', payload);

      // 2. If it is an Interview, automatically update Candidate status in DB
      if (formData.type === 'Interview' && formData.candidateId) {
        await api.put(`/candidates/${formData.candidateId}`, {
          status: 'Interviewing',
          notes: `Scheduled interview on ${eventDateTime.toLocaleString()}. Topic: ${formData.title}`
        });
      }

      alert('🎉 New Event successfully scheduled and saved to MongoDB!');
      setIsScheduleOpen(false);
      
      // Refresh
      fetchEventsAndCandidates();
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Failed to save event. Connecting with local database backup.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!window.confirm(`🗑️ Are you sure you want to delete the event: "${eventTitle}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/events/${eventId}`);
      
      // Update local events list instantly
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setIsDetailsOpen(false);
      setSelectedEvent(null);
      alert(`🗑️ Event "${eventTitle}" successfully deleted!`);
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event. Please check database connection.');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  // Force strict English locales so month displays beautifully (e.g., May 2026 instead of French "mai")
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-950 p-8 gap-8 overflow-hidden">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Calendar</h1>
          <p className="text-slate-500 font-semibold text-sm">Keep track of your online assessments and team alignment syncs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-2xl h-11 px-5 font-bold border-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800" 
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button 
            onClick={() => {
              setIsScheduleOpen(true);
              setFormData({
                title: 'Team Meeting',
                type: 'Meeting',
                date: new Date().toISOString().split('T')[0],
                time: '14:00',
                candidateId: '',
                description: 'General sync regarding candidate progression.'
              });
            }}
            className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white font-bold h-11 px-6 gap-2 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Schedule Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
        
        {/* Main Grid Calendar Panel */}
        <div className="col-span-12 lg:col-span-9 flex flex-col bg-white dark:bg-slate-900 rounded-[36px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden h-full">
          
          {/* Calendar month selector controls */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-black text-slate-900 dark:text-white">
                 {monthName} <span className="text-slate-300 font-medium">{year}</span>
               </h2>
               <div className="flex gap-1">
                 <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-50">
                   <ChevronLeft className="w-4 h-4" />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-50">
                   <ChevronRight className="w-4 h-4" />
                 </Button>
               </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
               <button className="px-4 py-1.5 rounded-lg text-[10px] font-black bg-white shadow-sm text-slate-900 uppercase tracking-widest">Month</button>
               <button className="px-4 py-1.5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Week</button>
               <button className="px-4 py-1.5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Day</button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
            ))}
          </div>

          {/* Calendar Grid cells */}
          <div className="flex-1 grid grid-cols-7 overflow-y-auto no-scrollbar">
            {/* Empty cells before first day */}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-slate-50 dark:border-slate-800 min-h-[110px] bg-slate-50/10" />
            ))}

            {/* Day cells */}
            {[...Array(days)].map((_, i) => {
              const dayNum = i + 1;
              const dayEvents = events.filter(e => e.day === dayNum && e.month === month && e.year === year);
              const isToday = dayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div 
                  key={dayNum} 
                  onClick={() => handleOpenSchedulerOnDay(dayNum)}
                  className={`border-b border-r border-slate-50 dark:border-slate-800 min-h-[110px] p-2.5 flex flex-col gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    isToday ? 'bg-indigo-50/25 dark:bg-indigo-950/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black ${
                      isToday 
                        ? 'w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md' 
                        : 'text-slate-400'
                    }`}>
                      {dayNum}
                    </span>
                  </div>
                  
                  {/* Event pills */}
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayEvents.map((event, idx) => (
                      <div 
                        key={idx} 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening empty day scheduler
                          handleOpenEventDetails(event);
                        }}
                        className={`p-1.5 rounded-lg text-[9px] font-extrabold border-l-4 shadow-sm truncate transition-all hover:scale-[1.03] ${
                          event.type === 'Interview' 
                            ? 'bg-blue-50 text-blue-600 border-blue-500 dark:bg-blue-950/20' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-500 dark:bg-emerald-950/20'
                        }`}
                      >
                        <div className="truncate">{event.title}</div>
                        <div className="opacity-75">{event.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Sidebar (Right Section) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8">
           
           {/* Daily Schedule List */}
           <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
             <h3 className="text-xs font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2 uppercase tracking-wider">
               <Clock className="w-4 h-4 text-indigo-500" /> Today's Schedule
             </h3>
             
             <div className="space-y-4 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
               {events.filter(e => e.month === month && e.year === year).slice(0, 5).map((event, i) => (
                 <div key={i} className="relative pl-8 group">
                   <div className="absolute left-1 top-2.5 w-4 h-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm group-hover:scale-125 transition-all" />
                   
                   <div 
                     onClick={() => handleOpenEventDetails(event)}
                     className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-50 dark:border-slate-800 flex justify-between items-center gap-2 hover:border-indigo-500/25 transition-all cursor-pointer"
                   >
                     <div className="flex-1 min-w-0">
                       <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">{event.time}</p>
                       <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">{event.title}</p>
                       <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">{event.candidateName}</p>
                     </div>
                     
                     {/* Delete Trigger */}
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDeleteEvent(event.id, event.title);
                       }}
                       title="Delete Event"
                       className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all shrink-0"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                   </div>
                 </div>
               ))}
               
               {events.length === 0 && (
                 <div className="text-center py-6 text-slate-400">
                   <Info className="w-6 h-6 mx-auto mb-2 opacity-30 text-indigo-500" />
                   <p className="text-[10px] font-black uppercase tracking-wider">No events scheduled</p>
                 </div>
               )}
             </div>
           </Card>

           {/* Sync Call card */}
           <Card className="p-6 rounded-[32px] border-none shadow-lg bg-indigo-600 text-white flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black mb-1">Google Calendar Sync</h4>
              <p className="text-[11px] font-semibold text-indigo-100 mb-5 leading-relaxed">Connect your Google account to dynamically lock and sync slots.</p>
              <Button className="w-full rounded-2xl bg-white text-indigo-600 h-11 font-black hover:bg-indigo-50 shadow-md">Connect Account</Button>
           </Card>
        </div>

      </div>

      {/* ==================== CREATE CALENDAR EVENT MODAL ==================== */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <Card className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Create Calendar Event</h3>
              </div>
              <button 
                onClick={() => setIsScheduleOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateEventSubmit} className="space-y-4">
              
              {/* Event Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Event Title</label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="E.g., Technical Review, Team Sync"
                  className="rounded-xl h-10 text-sm font-semibold border-slate-200"
                />
              </div>

              {/* Event Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Event Category</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="h-10 rounded-xl border border-slate-200 bg-transparent px-3 text-sm font-semibold text-slate-700"
                >
                  <option value="Interview">Interview Session</option>
                  <option value="Meeting">Team Meeting</option>
                  <option value="Task">Task Deadline</option>
                </select>
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
                    className="h-10 rounded-xl border border-slate-200 bg-transparent px-3 text-sm font-semibold text-slate-700"
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
                    className="h-10 rounded-xl border border-slate-200 bg-transparent px-3 text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* Conditional Candidate Selection (Show only if type is Interview) */}
              {formData.type === 'Interview' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Link Candidate Profile</label>
                  <select
                    name="candidateId"
                    value={formData.candidateId}
                    onChange={handleInputChange}
                    className="h-10 rounded-xl border border-slate-200 bg-transparent px-3 text-sm font-semibold text-slate-700"
                  >
                    <option value="">-- No Candidate / General --</option>
                    {candidates.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.personalInfo?.fullName} ({c.jobPostingId?.title || 'MERN stack'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-3 bg-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-50 mt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsScheduleOpen(false)}
                  className="rounded-xl font-bold text-xs h-10 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs h-10 px-5 gap-2 hover:shadow-lg hover:shadow-indigo-500/20"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Event
                </Button>
              </div>

            </form>
          </Card>
        </div>
      )}

      {/* ==================== VIEW EVENT DETAILS MODAL ==================== */}
      {isDetailsOpen && selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <Card className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4 mb-4">
              <Badge className={`font-black text-[8px] uppercase tracking-wider rounded-lg border-none px-2 py-0.5 ${
                selectedEvent.type === 'Interview' ? 'bg-indigo-500/15 text-indigo-500' : 'bg-emerald-500/15 text-emerald-500'
              }`}>
                {selectedEvent.type}
              </Badge>
              <button 
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedEvent(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-950 dark:text-white text-base leading-tight">{selectedEvent.title}</h3>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {new Date(selectedEvent.fullDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Linked Participant details */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100/50 dark:border-slate-800/80 space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Linked Candidate / Participant</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black text-xs">
                    {selectedEvent.candidateName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-none">{selectedEvent.candidateName}</h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">MERN Developer Pool</p>
                  </div>
                </div>
              </div>

              {/* Description body */}
              {selectedEvent.description && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Meeting Notes</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed leading-normal">{selectedEvent.description}</p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-850 mt-5">
                <Button 
                  onClick={() => handleDeleteEvent(selectedEvent.id, selectedEvent.title)}
                  variant="ghost" 
                  className="rounded-xl text-xs text-red-500 font-extrabold hover:bg-red-50 hover:text-red-600 h-9 px-3 gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete Event
                </Button>
                
                {selectedEvent.type === 'Interview' && (
                  <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 gap-1.5">
                      <Video className="w-4 h-4" /> Join Room
                    </Button>
                  </a>
                )}
              </div>

            </div>

          </Card>
        </div>
      )}

    </div>
  );
}
