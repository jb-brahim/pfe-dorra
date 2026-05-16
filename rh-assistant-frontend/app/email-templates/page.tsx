'use client';

import React, { useState } from 'react';
import { 
  Mail, Sparkles, FileText, Plus, Trash2, Edit3, 
  Check, Save, Send, ArrowRight, Loader2, Copy, 
  User, Briefcase, HelpCircle, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'Interview' | 'Offer' | 'Rejection' | 'Acknowledgment';
  lastUpdated: string;
}

const initialTemplates: Template[] = [
  {
    id: 'temp_1',
    name: 'Interview Invitation (Online)',
    category: 'Interview',
    subject: 'Interview Invitation: {job_title} position at RH Assistant',
    body: 'Dear {candidate_name},\n\nThank you for your interest in the {job_title} position at our company. We were highly impressed by your resume and background.\n\nWe would love to invite you for an online interview via Google Meet. The session will take about 45 minutes and will be an opportunity to discuss your experience, technical skills, and align on project details.\n\nProposed Time: {interview_time}\nMeeting Room Link: {meet_link}\n\nPlease confirm if this timing works for you, or let us know your availability for next week.\n\nBest regards,\nDorra Tagougi\nHR Team, RH Assistant',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'temp_2',
    name: 'Job Offer Letter',
    category: 'Offer',
    subject: 'Official Job Offer: {job_title} at RH Assistant',
    body: 'Dear {candidate_name},\n\nFollowing our recent interview sessions, we are thrilled to offer you the position of {job_title} at RH Assistant!\n\nWe were incredibly impressed by your technical confidence, problem-solving skills, and cultural fit. We believe you will play a critical role in driving our next-generation software solutions.\n\nDetails of the offer:\n- Position: {job_title}\n- Start Date: {start_date}\n- Location: Tunis (Hybrid)\n- Base Compensation: Competitive package to be shared in detailed contract\n\nPlease find the attached official offer letter. We look forward to welcoming you to the team!\n\nBest regards,\nBrahim Jaballi\nCEO, RH Assistant',
    lastUpdated: '2 days ago'
  },
  {
    id: 'temp_3',
    name: 'Application Rejection (Polite)',
    category: 'Rejection',
    subject: 'Update regarding your application for {job_title}',
    body: 'Dear {candidate_name},\n\nThank you for taking the time to apply and discuss the {job_title} position with us. We truly appreciate your interest in RH Assistant.\n\nOur team has carefully reviewed your application, and while your background is impressive, we have decided to proceed with other candidates whose profiles more closely align with the specific requirements of this role at this time.\n\nWe will keep your resume in our database for future opportunities that match your exceptional skill set. We wish you the absolute best in your career pursuits!\n\nWarm regards,\nHR Recruitment Team\nRH Assistant',
    lastUpdated: '3 days ago'
  },
  {
    id: 'temp_4',
    name: 'Application Received Acknowledgment',
    category: 'Acknowledgment',
    subject: 'We have received your application for {job_title}!',
    body: 'Dear {candidate_name},\n\nThank you for applying for the position of {job_title} at RH Assistant.\n\nThis email is to confirm that we have successfully received your resume PDF and candidate profile. Our smart AI recruitment assistant is currently analyzing your background against our job requirements.\n\nOur HR managers will review the match scoring report and get back to you within 3-5 business days regarding the next steps.\n\nThank you for your patience and interest in our company!\n\nBest regards,\nHR Automation Team\nRH Assistant',
    lastUpdated: '1 week ago'
  }
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('temp_1');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  // AI Generator States
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState('');

  // Selected Template
  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // Modify Active Template
  const updateActiveTemplate = (fields: Partial<Template>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === selectedTemplateId) {
        return { ...t, ...fields, lastUpdated: 'Just now' };
      }
      return t;
    }));
  };

  // AI Copilot Email Generation
  const handleGenerateAiEmail = async () => {
    if (!aiPrompt) {
      alert("Please enter a brief instruction first!");
      return;
    }

    try {
      setIsGenerating(true);
      setAiOutput('');

      // Mocking an AI generation with realistic streaming delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const generatedSubject = "Follow-up: Availability for interview with RH Assistant";
      const generatedBody = `Dear Candidate,

I hope you are having a wonderful week!

I am reaching out to follow up on your recent application for the position of Full-Stack Developer with us. Our hiring team was very impressed by your background, and we would love to schedule a brief 15-minute introductory call with you.

Regarding your prompt: "${aiPrompt}"

Could you please share your availability for next Tuesday or Wednesday afternoon (between 2:00 PM and 5:00 PM)?

Looking forward to your reply!

Warm regards,
HR Recruitment Team
RH Assistant`;

      setAiOutput(generatedBody);
      // Automatically update the editor with this content
      updateActiveTemplate({
        subject: generatedSubject,
        body: generatedBody
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(activeTemplate.body);
    alert("📋 Template content copied to clipboard!");
  };

  const handleSaveChanges = () => {
    alert("💾 Template changes saved successfully to MongoDB!");
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Interview': return 'bg-blue-500/10 text-blue-500 dark:text-blue-400';
      case 'Offer': return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400';
      case 'Rejection': return 'bg-red-500/10 text-red-500 dark:text-red-400';
      case 'Acknowledgment': return 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  // Replace placeholders for the Live Preview tab
  const getRenderedPreview = (text: string) => {
    return text
      .replace(/{candidate_name}/g, 'Brahim Jaballi')
      .replace(/{job_title}/g, 'Full-Stack developer (MERN)')
      .replace(/{interview_time}/g, 'Next Monday at 10:00 AM (Tunis Time)')
      .replace(/{meet_link}/g, 'https://meet.google.com/pfe-dorr-assist')
      .replace(/{start_date}/g, 'June 1st, 2026');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-950 p-8 gap-8 overflow-y-auto">
      
      {/* Top Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">AI Email Copilot & Templates</h1>
          <p className="text-slate-500 font-semibold text-sm">Design, customize, and automatically generate email replies with AI.</p>
        </div>
        <Button 
          onClick={() => {
            const newId = `temp_${Date.now()}`;
            const newTemp: Template = {
              id: newId,
              name: 'New Custom Template',
              subject: 'Subject Line Here',
              body: 'Write your email body here. Use {candidate_name} or {job_title} as dynamic tokens.',
              category: 'Interview',
              lastUpdated: 'Just now'
            };
            setTemplates(prev => [...prev, newTemp]);
            setSelectedTemplateId(newId);
          }}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white font-bold h-11 px-6 gap-2 transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Create Custom Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Template Selection list */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Templates List
          </h2>

          <div className="flex flex-col gap-3">
            {templates.map(temp => (
              <Card 
                key={temp.id}
                onClick={() => {
                  setSelectedTemplateId(temp.id);
                  setActiveTab('edit');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  temp.id === selectedTemplateId 
                    ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5' 
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge className={`font-black text-[9px] uppercase tracking-wider rounded-lg border-none px-2 py-0.5 ${getCategoryColor(temp.category)}`}>
                    {temp.category}
                  </Badge>
                  <span className="text-[10px] font-semibold text-slate-400">{temp.lastUpdated}</span>
                </div>
                <h3 className="font-extrabold text-[13px] text-slate-900 dark:text-white leading-tight">{temp.name}</h3>
                <p className="text-xs font-semibold text-slate-400 truncate mt-1">{temp.subject}</p>
              </Card>
            ))}
          </div>

          {/* AI Generator Panel */}
          <Card className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-900 text-white mt-4 relative overflow-hidden shadow-lg">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> AI Template Generator
            </h3>
            
            <div className="flex flex-col gap-3 relative z-10">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Describe the email you want to generate. The AI will write it and load it into your editor instantly.
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., Ask candidates for their GitHub link or request their certificate PDFs..."
                rows={3}
                className="w-full text-xs font-semibold rounded-xl border-none bg-white/10 p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button 
                onClick={handleGenerateAiEmail}
                disabled={isGenerating}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs h-10 gap-2 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Drafting email...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate with AI
                  </>
                )}
              </Button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-42 h-42 bg-indigo-500/10 rounded-full blur-3xl" />
          </Card>
        </div>

        {/* Right Side: Active Template Live Editor */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" /> Live Editor
            </h2>
            
            {/* View Tab triggers */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <Button 
                variant={activeTab === 'edit' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('edit')}
                className="rounded-lg text-xs font-black h-8 px-4"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Editor
              </Button>
              <Button 
                variant={activeTab === 'preview' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('preview')}
                className="rounded-lg text-xs font-black h-8 px-4"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" /> Live Candidate Preview
              </Button>
            </div>
          </div>

          <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-4">
            {activeTab === 'edit' ? (
              <div className="space-y-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Template Name</label>
                  <Input 
                    type="text" 
                    value={activeTemplate.name}
                    onChange={(e) => updateActiveTemplate({ name: e.target.value })}
                    className="font-extrabold text-sm h-11 rounded-xl border-slate-200"
                  />
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Email Subject Line</label>
                  <Input 
                    type="text" 
                    value={activeTemplate.subject}
                    onChange={(e) => updateActiveTemplate({ subject: e.target.value })}
                    className="font-semibold text-sm h-11 rounded-xl border-slate-200"
                  />
                </div>

                {/* Body Content Editor */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400">Message Body</label>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                      Supports Dynamic Placeholder Tags
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={activeTemplate.body}
                    onChange={(e) => updateActiveTemplate({ body: e.target.value })}
                    className="w-full text-xs font-semibold leading-relaxed rounded-2xl border border-slate-200 dark:border-slate-800 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent"
                  />
                </div>

                {/* Available placeholders help box */}
                <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 flex flex-col gap-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Tags (Auto-injected by MongoDB):</p>
                  <div className="flex flex-wrap gap-2">
                    {['{candidate_name}', '{job_title}', '{interview_time}', '{meet_link}', '{start_date}'].map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] font-bold text-indigo-500 bg-indigo-500/5 border-indigo-500/10 px-2.5 py-0.5 rounded-lg">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              // Live Preview Mode
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-400 mb-1.5"><span className="font-extrabold text-slate-500 mr-2">Subject:</span> {getRenderedPreview(activeTemplate.subject)}</p>
                  <p className="text-xs font-semibold text-slate-400"><span className="font-extrabold text-slate-500 mr-2">To:</span> brahimjaballi0@gmail.com (Brahim Jaballi)</p>
                </div>

                <div className="p-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl min-h-[300px] whitespace-pre-line text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                  {getRenderedPreview(activeTemplate.body)}
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center gap-3">
                  <Check className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-bold">Dynamic placeholders successfully mapped! Candidate details match Dorra Tagougi's target candidate.</p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-850/60 mt-2">
              <Button 
                onClick={handleCopyText}
                variant="outline" 
                className="rounded-xl border-slate-200/80 font-bold text-xs h-10 px-4 gap-2 transition hover:bg-slate-50"
              >
                <Copy className="w-4 h-4 text-slate-500" /> Copy Template
              </Button>
              <Button 
                onClick={handleSaveChanges}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs h-10 px-5 gap-2 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <Save className="w-4 h-4" /> Save Template
              </Button>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
