import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, ShieldCheck, AlertTriangle, Clock,
  DollarSign, ArrowRight, Bot, RefreshCw, Send, Check, Phone,
  Calendar, Wrench, ChevronRight, HelpCircle, FileText, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BUSINESS_PROFILES = [
  { id: 'contractor', icon: '🔨', title: 'Contractor & Trades', sub: 'HVAC, Plumbing, Electrical, Roofing, Construction' },
  { id: 'pro_service', icon: '💼', title: 'Professional Practice', sub: 'Legal, Accounting, Consulting, Clinics, Real Estate' },
  { id: 'auto_fleet', icon: '🚗', title: 'Auto & Fleet Services', sub: 'Repair Shops, Mobile Detailing, Towing, Logistics' },
  { id: 'solo_pro', icon: '👤', title: 'Solo Operator', sub: 'Independent Consultant, Freelancer, Single-Truck Owner' },
  { id: 'growing_smb', icon: '🏢', title: 'Growing Small Business', sub: '5–25 Employees, Multi-role Operations' }
];

export default function AssessmentPage() {
  const [stage, setStage] = useState('profile'); // 'profile' | 'interactive' | 'report'
  const [selectedProfile, setSelectedProfile] = useState('contractor');
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Interactive diagnostic state
  const [answers, setAnswers] = useState({
    missed_calls: false,
    manual_scheduling: true,
    paper_invoicing: true,
    former_employee_access: false,
    mfa_enabled: false,
    single_computer_risk: true,
    backup_verified: false,
    duplicate_data_entry: true,
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [reportData, setReportData] = useState(null);

  const toggleAnswer = (key) => {
    setAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateReport = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/assessment-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_report',
          profile: selectedProfile,
          state: {
            ...answers,
            business_name: businessName || 'My Business',
            contact_email: contactEmail || 'owner@example.com'
          }
        })
      });
      const data = await res.json();
      if (data.evaluation) {
        setReportData(data);
        setStage('report');
      }
    } catch (e) {
      console.warn('Fallback to local calculation', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const triggerBookingWithContext = () => {
    window.dispatchEvent(new CustomEvent('mrtechsys-open-booking', {
      detail: {
        service: 'General Advisory',
        context: {
          businessName: businessName || 'Small Business',
          email: contactEmail || '',
          question: `Business Technology Health Assessment (${reportData?.evaluation?.healthScore || 72}/100) — Inefficiencies: ${reportData?.evaluation?.inefficiencies?.map(i => i.title).join(', ')}`
        }
      }
    }));
  };

  return (
    <div className="pt-28 pb-24 min-h-screen px-4 md:px-6 relative font-sans text-slate-100">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header Badge */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-[10px] tracking-wider uppercase font-bold">
            <Sparkles size={12} className="animate-spin" />
            <span>MRTECHSYS TECHNOLOGY ADVISORY SYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Small Business <span className="text-gold-gradient">Technology Assessment</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Practical technology advisory for small businesses that don't have a technology department. Evaluate your 10 critical operational dimensions in plain English.
          </p>
        </div>

        {/* STAGE 1: PROFILE SELECTOR */}
        {stage === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0B0F17] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold">Step 1 of 2 · Identify Your Business Type</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Select the profile that best describes your operations:</h2>
              <p className="text-xs text-slate-400 mt-1">This tailors our diagnostic to the specific operational realities of your trade.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUSINESS_PROFILES.map((p) => {
                const isSelected = selectedProfile === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProfile(p.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-[#D4AF37]' : 'text-white'}`}>{p.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{p.sub}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">Your Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Lone Star Mechanical"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">Your Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="owner@yourcompany.com"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStage('interactive')}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Begin 10-Dimension Operational Audit &rarr;</span>
            </button>
          </motion.div>
        )}

        {/* STAGE 2: INTERACTIVE 10-DIMENSION DIAGNOSTIC */}
        {stage === 'interactive' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0B0F17] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold">Step 2 of 2 · Operational Friction Check</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Which of these happen in your day-to-day operations?</h2>
              </div>
              <button
                type="button"
                onClick={() => setStage('profile')}
                className="text-xs font-mono text-slate-500 hover:text-white transition-colors"
              >
                Change Profile
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'missed_calls', icon: '📞', title: 'Missed Calls / Phone Tag', desc: 'When the phone rings during a busy job, calls often roll to unmonitored voicemail where leads go cold.' },
                { key: 'manual_scheduling', icon: '📅', title: 'Manual Scheduling Friction', desc: 'Staff coordinates times over phone calls and text messages instead of automated online booking.' },
                { key: 'paper_invoicing', icon: '💳', title: 'Invoices Drafted Days Later', desc: 'Technicians finish work on-site, but invoices are handwritten or drafted days later in QuickBooks.' },
                { key: 'former_employee_access', icon: '🔐', title: 'Old Logins Still Active', desc: 'Former employees or past contractors might still have passwords to company email, drives, or apps.' },
                { key: 'mfa_enabled', icon: '🛡️', title: '2-Step Verification (MFA) Active', desc: 'Staff must enter a code from their phone when logging into email, banking, or business software.', inverted: true },
                { key: 'single_computer_risk', icon: '💻', title: 'Single Computer Dependency', desc: 'If one specific office computer or laptop died tomorrow, critical business work would freeze.' },
                { key: 'backup_verified', icon: '💾', title: 'Verified Automated Off-Site Backups', desc: 'You have automated cloud backups running and have tested restoring them in the last 6 months.', inverted: true },
                { key: 'duplicate_data_entry', icon: '📋', title: 'Re-Typing Data Between Apps', desc: 'Customer info is copied by hand between forms, calendars, spreadsheets, and accounting software.' },
              ].map((item) => {
                const isTriggered = item.inverted ? !answers[item.key] : answers[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleAnswer(item.key)}
                    className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isTriggered
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{item.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {item.title}
                          {isTriggered && <span className="text-[10px] font-mono text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">Flagged</span>}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                      isTriggered ? 'bg-amber-500 border-amber-400 text-black font-bold text-xs' : 'border-slate-600'
                    }`}>
                      {isTriggered ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              disabled={analyzing}
              onClick={handleGenerateReport}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] disabled:opacity-50 text-[#07090E] font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Running Diagnostic Rules Engine...</span>
                </>
              ) : (
                <span>Generate Business Technology Report &rarr;</span>
              )}
            </button>
          </motion.div>
        )}

        {/* STAGE 3: EXECUTIVE CONSULTING REPORT */}
        {stage === 'report' && reportData && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            
            {/* Header Score Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
                <div>
                  <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold">Executive Diagnostic Briefing</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">{businessName || 'Your Business'}</h2>
                  <p className="text-xs text-slate-400 mt-1">Evaluated across 10 core dimensions by MrTechSys Consultant Agent</p>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-center shrink-0 min-w-[170px]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Health Score</span>
                  <div className="text-4xl font-extrabold text-[#D4AF37] my-0.5">
                    {reportData.evaluation.healthScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {reportData.healthRating}
                  </span>
                </div>
              </div>

              {/* Economic Opportunity Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold">
                    $
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Potential Annual Tech Savings</span>
                    <span className="text-base font-bold text-white">{reportData.savingsRange}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Potential Admin Time Recovered</span>
                    <span className="text-base font-bold text-white">{reportData.hoursRange}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inefficiencies Identified */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0F17] border border-white/[0.08] shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle size={17} className="text-amber-400" />
                <span>Primary Operational &amp; Financial Inefficiencies Identified</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportData.evaluation.inefficiencies.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{item.dimension}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        item.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>{item.severity}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prioritized Execution Roadmap (NOW / NEXT / LATER) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/30 shadow-2xl space-y-6">
              <div>
                <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold">Actionable Execution Playbook</span>
                <h3 className="text-xl font-bold text-white mt-1">Recommended Sequence: Protect &rarr; Simplify &rarr; Scale</h3>
              </div>

              <div className="space-y-4">
                {/* NOW */}
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                  <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <span>🚨 NOW · Protect The Business &amp; Stop The Bleeding (Days 1–30)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {reportData.evaluation.nowActions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* NEXT */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span>⚙️ NEXT · Make The Business Easier To Run (Days 31–90)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {reportData.evaluation.nextActions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* LATER */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                  <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <span>🚀 LATER · Build For Scalable Growth (Day 90+)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {reportData.evaluation.laterActions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Consultation Booking Call to Action */}
              <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Want help implementing your roadmap?</h4>
                  <p className="text-xs text-slate-400">Review your findings live with Eric &amp; the MrTechSys team in a private strategy session.</p>
                </div>
                <button
                  type="button"
                  onClick={triggerBookingWithContext}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer whitespace-nowrap"
                >
                  Book Free 30-Min Strategy Review &rarr;
                </button>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
