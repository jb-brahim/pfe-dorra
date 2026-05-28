'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, ShieldCheck, ArrowLeft, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function UpgradePage() {
  const router = useRouter();
  const [step, setStep] = useState<'pricing' | 'checkout' | 'success'>('pricing');
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call for payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
    }, 2500);
  };

  const renderPricing = () => (
    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Upgrade your recruitment process</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Choose the plan that best fits your company's hiring needs.</p>
        
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
          <button 
            type="button"
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full relative transition-colors duration-300"
            style={{ backgroundColor: billingCycle === 'annual' ? '#4f46e5' : undefined }}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-300 ${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1 shadow-sm'}`} />
          </button>
          <span className={`text-sm font-bold flex items-center gap-2 ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            Annually <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <Card className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col opacity-70 hover:opacity-100 transition-opacity">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Basic Starter</h3>
            <div className="text-4xl font-black mb-1">$0<span className="text-lg text-slate-400 font-medium">/mo</span></div>
            <p className="text-sm text-slate-500">For small businesses trying out the platform.</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-slate-400" /> Up to 5 Active Jobs</li>
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-slate-400" /> 100 Candidates / month</li>
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-slate-400" /> Basic AI parsing</li>
          </ul>
          <Button variant="outline" className="w-full h-12 rounded-2xl font-bold" disabled>Current Plan</Button>
        </Card>

        {/* Pro Plan */}
        <Card className="p-8 rounded-3xl border-2 border-primary bg-white dark:bg-slate-900 shadow-xl shadow-primary/10 flex flex-col relative scale-105">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Crown className="w-3 h-3" /> Recommended
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-primary">Pro Recruiter</h3>
            <div className="text-4xl font-black mb-1">${billingCycle === 'monthly' ? '29' : '24'}<span className="text-lg text-slate-400 font-medium">/mo</span></div>
            <p className="text-sm text-slate-500">Perfect for growing startups and agencies.</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary" /> Unlimited Active Jobs</li>
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary" /> Unlimited Candidates</li>
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary" /> Advanced AI Matching Score</li>
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-primary" /> Automated Email Sequences</li>
          </ul>
          <Button 
            className="w-full h-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            onClick={() => { setSelectedPlan('pro'); setStep('checkout'); }}
          >
            Upgrade to Pro
          </Button>
        </Card>

        {/* Enterprise Plan */}
        <Card className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
            <div className="text-4xl font-black mb-1">${billingCycle === 'monthly' ? '99' : '79'}<span className="text-lg text-slate-400 font-medium">/mo</span></div>
            <p className="text-sm text-slate-500">For large scale organizational needs.</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Everything in Pro</li>
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Custom API Access</li>
            <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Dedicated Account Manager</li>
          </ul>
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => { setSelectedPlan('enterprise'); setStep('checkout'); }}
          >
            Select Enterprise
          </Button>
        </Card>
      </div>
    </div>
  );

  const renderCheckout = () => (
    <div className="max-w-4xl mx-auto flex gap-8 flex-col lg:flex-row animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex-1">
        <Button variant="ghost" onClick={() => setStep('pricing')} className="mb-6 gap-2 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white -ml-4">
          <ArrowLeft className="w-4 h-4" /> Back to Plans
        </Button>
        <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
          Checkout <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </h2>
        
        <form onSubmit={handleCheckout} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Name on Card</label>
              <input 
                required
                type="text" 
                placeholder="Jane Doe"
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-sm shadow-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  required
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full p-4 pl-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-sm shadow-sm"
                  value={formData.cardNumber}
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, '');
                    val = val.replace(/(.{4})/g, '$1 ').trim();
                    setFormData({...formData, cardNumber: val});
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Expiry Date</label>
                <input 
                  required
                  type="text" 
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-sm shadow-sm"
                  value={formData.expiry}
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2,4);
                    setFormData({...formData, expiry: val});
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">CVC</label>
                <input 
                  required
                  type="text" 
                  placeholder="123"
                  maxLength={4}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-sm shadow-sm"
                  value={formData.cvc}
                  onChange={e => setFormData({...formData, cvc: e.target.value.replace(/\D/g, '')})}
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit"
            disabled={isProcessing}
            className="w-full h-14 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing Payment...</>
            ) : (
              `Pay $${selectedPlan === 'pro' ? (billingCycle === 'monthly' ? '29' : '24') : (billingCycle === 'monthly' ? '99' : '79')}`
            )}
          </Button>
          <p className="text-center text-xs font-medium text-slate-400 mt-4 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Payments are secure and encrypted.
          </p>
        </form>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-96">
        <Card className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sticky top-8 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{selectedPlan === 'pro' ? 'Pro Recruiter' : 'Enterprise'} Plan</span>
            <span className="font-bold">${selectedPlan === 'pro' ? (billingCycle === 'monthly' ? '29' : '24') : (billingCycle === 'monthly' ? '99' : '79')}</span>
          </div>
          <div className="flex justify-between items-center mb-6 text-xs text-slate-500 font-medium">
            <span>Billing Cycle</span>
            <span className="capitalize">{billingCycle}</span>
          </div>
          <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-6" />
          <div className="flex justify-between items-center text-lg">
            <span className="font-bold text-slate-900 dark:text-white">Total due today</span>
            <span className="font-black text-primary">${selectedPlan === 'pro' ? (billingCycle === 'monthly' ? '29' : '24') : (billingCycle === 'monthly' ? '99' : '79')}</span>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-lg mx-auto text-center animate-in zoom-in duration-500 pt-12">
      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-500/20">
        <Check className="w-12 h-12 text-emerald-500" />
      </div>
      <h1 className="text-4xl font-black mb-4 tracking-tight">Payment Successful!</h1>
      <p className="text-lg text-slate-500 mb-10">You are now on the <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedPlan}</span> plan. All advanced features have been unlocked for your workspace.</p>
      <Button 
        onClick={() => router.push('/dashboard')}
        className="h-14 px-8 rounded-2xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform duration-300 shadow-xl"
      >
        Return to Dashboard
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#fafbfc] dark:bg-slate-950 p-8 overflow-y-auto custom-scrollbar">
      <div className="py-12">
        {step === 'pricing' && renderPricing()}
        {step === 'checkout' && renderCheckout()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  );
}
