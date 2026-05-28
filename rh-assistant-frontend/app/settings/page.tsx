'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Mail, Shield, Sparkles, Cpu, Sliders, 
  Layers, Key, Check, Save, Copy, RefreshCw, 
  Loader2, Globe, Building2, BellRing, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

type TabType = 'email' | 'ai' | 'smtp' | 'profile';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('email');
  const [isSaving, setIsSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [profileData, setProfileData] = useState({
    fullName: '',
    title: '',
    company: '',
    website: ''
  });

  const [aiWeights, setAiWeights] = useState({
    experience: 40,
    skills: 40,
    education: 20
  });

  const [aiEngine, setAiEngine] = useState('groq-llama-70b');

  const [smtpData, setSmtpData] = useState({
    user: '',
    pass: '',
    host: '',
    port: ''
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.get('/settings');
        if (data) {
          if (data.profileData) setProfileData(data.profileData);
          if (data.aiWeights) setAiWeights(data.aiWeights);
          if (data.aiEngine) setAiEngine(data.aiEngine);
          if (data.smtpData) setSmtpData(data.smtpData);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleCopyBridgeEmail = () => {
    const bridgeEmail = smtpData.user ? `${smtpData.user.split('@')[0]}+assistant@${smtpData.user.split('@')[1]}` : '';
    if (!bridgeEmail) {
      alert('Please configure your SMTP email first.');
      return;
    }
    navigator.clipboard.writeText(bridgeEmail);
    alert('📋 Bridge Email Address copied to clipboard!');
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await api.put('/settings', {
        profileData,
        aiWeights,
        aiEngine,
        smtpData
      });
      alert('💾 All system preferences successfully saved and integrated with MongoDB Atlas!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-950 p-8 gap-8 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
          <p className="text-slate-500 font-semibold text-sm">Configure AI pipelines, email integrations, and SMTP dispatch properties.</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white font-bold h-11 px-6 gap-2 transition-all duration-300 hover:scale-105"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save All Preferences
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Navigation Links */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
          {[
            { id: 'email', label: 'AI Email Bridging', icon: Mail, badge: 'On' },
            { id: 'ai', label: 'AI Match Tuning', icon: Cpu, badge: 'Llama 3' },
            { id: 'smtp', label: 'SMTP Credentials', icon: Key, badge: 'Active' },
            { id: 'profile', label: 'Profile Preferences', icon: Settings, badge: null }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full justify-start gap-3 rounded-2xl px-4 py-6 transition-all duration-300 font-extrabold text-xs text-left ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.03]' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{tab.label}</span>
                {tab.badge && (
                  <Badge className={`text-[8px] font-black tracking-wider uppercase border-none px-2 rounded-md ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {tab.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Right Side: Tab Contents panels */}
        <div className="col-span-12 lg:col-span-9">
          
          {/* ================= TAB 1: EMAIL BRIDGE ================= */}
          {activeTab === 'email' && (
            <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-500" /> AI Candidate Auto-Forwarding
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">Route candidate CV applications from your Outlook/Gmail directly to our AI evaluation parser.</p>
              </div>

              {/* Unique allocated assistant address */}
              <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Your Allocated Inbound Assistant Mail</p>
                  {smtpData.user ? (
                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      {`${smtpData.user.split('@')[0]}+assistant@${smtpData.user.split('@')[1]}`}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-slate-400 italic">Configure your SMTP email in the SMTP tab first</p>
                  )}
                </div>
                <Button 
                  onClick={handleCopyBridgeEmail}
                  className="rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-500/20 font-bold text-xs shrink-0"
                >
                  <Copy className="w-4 h-4 mr-1.5" /> Copy Bridge Address
                </Button>
              </div>

              {/* Instructions on Rule config */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">How to Setup in 60 seconds:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">1</div>
                    <h5 className="font-extrabold text-xs text-slate-900">Add Automatic Rule</h5>
                    <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">Go to your Business Gmail/Outlook Mailbox Settings &gt; Filters and Forwarding.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">2</div>
                    <h5 className="font-extrabold text-xs text-slate-900">Configure Filter</h5>
                    <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">Add rule: "Forward any incoming email with attachments to your bridge address above".</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">3</div>
                    <h5 className="font-extrabold text-xs text-slate-900">Done! Autopilot Active</h5>
                    <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">Our n8n agent parses candidates 24/7. Results land on your desk instantly!</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ================= TAB 2: AI MATCH TUNING ================= */}
          {activeTab === 'ai' && (
            <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-500" /> AI Recruiter Matching tuning
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">Configure weights, limits, and LLM core models utilized inside n8n to analyze candidates.</p>
              </div>

              {/* LLM Engine Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-400">LLM Core Engine</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'groq-llama-70b', title: 'Groq Llama-3-70b', desc: 'Default. Extremely fast, precise, and perfect for parsing resume timelines.', premium: false },
                    { id: 'gpt-4o', title: 'OpenAI GPT-4o', desc: 'Advanced. Deep semantic analysis, smart matching weights alignment.', premium: true },
                    { id: 'claude-35', title: 'Claude 3.5 Sonnet', desc: 'Elite. Unparalleled detail extraction, smart candidate summaries writing.', premium: true }
                  ].map(engine => (
                    <div 
                      key={engine.id}
                      onClick={() => setAiEngine(engine.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
                        aiEngine === engine.id 
                          ? 'border-indigo-500 bg-indigo-500/5' 
                          : 'border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{engine.title}</span>
                        {engine.premium && <Badge className="text-[7px] font-black tracking-widest uppercase bg-indigo-500 text-white rounded px-1.5 py-0.5">SaaS Pro</Badge>}
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400 leading-relaxed">{engine.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Weight Parameters */}
              <div className="flex flex-col gap-4 border-t border-slate-50 dark:border-slate-850/50 pt-5">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Configure Scoring Weight Distributions:</h4>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Work History & Experience years</span>
                      <span className="text-indigo-600">{aiWeights.experience}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={aiWeights.experience}
                      onChange={(e) => setAiWeights(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Key Technical Skills & Frameworks Match</span>
                      <span className="text-indigo-600">{aiWeights.skills}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={aiWeights.skills}
                      onChange={(e) => setAiWeights(prev => ({ ...prev, skills: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Academic Records & Certification matches</span>
                      <span className="text-indigo-600">{aiWeights.education}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={aiWeights.education}
                      onChange={(e) => setAiWeights(prev => ({ ...prev, education: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border border-indigo-500/10 rounded-2xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <p className="text-[10px] font-bold">Match Weights configured! Total weight: {aiWeights.experience + aiWeights.skills + aiWeights.education}% (AI recalibrates score instantly).</p>
                </div>
              </div>
            </Card>
          )}

          {/* ================= TAB 3: SMTP NODEMAILER ================= */}
          {activeTab === 'smtp' && (
            <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" /> Nodemailer SMTP Outbound Settings
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">Configure SMTP email server dispatch parameters. Emails scheduled for interviews or confirmations are sent through this server.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">SMTP Host Server</label>
                  <Input 
                    type="text" 
                    value={smtpData.host}
                    onChange={(e) => setSmtpData(prev => ({ ...prev, host: e.target.value }))}
                    className="font-semibold text-sm h-11 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">SMTP Port</label>
                  <Input 
                    type="text" 
                    value={smtpData.port}
                    onChange={(e) => setSmtpData(prev => ({ ...prev, port: e.target.value }))}
                    className="font-semibold text-sm h-11 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">SMTP Authorized Sender Email</label>
                  <Input 
                    type="email" 
                    value={smtpData.user}
                    onChange={(e) => setSmtpData(prev => ({ ...prev, user: e.target.value }))}
                    className="font-semibold text-sm h-11 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">App Password</label>
                  <div className="relative">
                    <Input 
                      type={showPass ? 'text' : 'password'} 
                      value={smtpData.pass}
                      onChange={(e) => setSmtpData(prev => ({ ...prev, pass: e.target.value }))}
                      className="font-semibold text-sm h-11 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <p className="text-[10px] font-bold">Mail dispatch server configured successfully! Outbound emails are sent through {smtpData.user}.</p>
              </div>
            </Card>
          )}

          {/* ================= TAB 4: PROFILE SETTINGS ================= */}
          {activeTab === 'profile' && (
            <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Recruiter & Corporate preferences
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">Configure details for your company account and your manager identity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Full Name</label>
                  <Input 
                    type="text" 
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="font-semibold text-sm h-11 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Title / Designation</label>
                  <Input 
                    type="text" 
                    value={profileData.title}
                    onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                    className="font-semibold text-sm h-11 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Company Name</label>
                  <Input 
                    type="text" 
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    className="font-semibold text-sm h-11 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Company Website</label>
                  <Input 
                    type="text" 
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    className="font-semibold text-sm h-11 rounded-xl"
                  />
                </div>
              </div>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
