import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, ShieldCheck, AlertTriangle, Clock,
  DollarSign, ArrowRight, RefreshCw, Send, Check, Phone,
  Calendar, Wrench, ChevronRight, HelpCircle, FileText, Lock,
  Briefcase, Truck, User, Building2, Cpu, FileSpreadsheet, Server
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BUSINESS_PROFILES = [
  { id: 'contractor', icon: Wrench, title: 'Contractor & Trades', sub: 'HVAC, Plumbing, Electrical, Roofing, Construction' },
  { id: 'pro_service', icon: Briefcase, title: 'Professional Practice', sub: 'Legal, Accounting, Consulting, Clinics, Real Estate' },
  { id: 'auto_fleet', icon: Truck, title: 'Auto & Fleet Services', sub: 'Repair Shops, Mobile Detailing, Towing, Logistics' },
  { id: 'solo_pro', icon: User, title: 'Solo Operator', sub: 'Independent Consultant, Specialized Practitioner' },
  { id: 'growing_smb', icon: Building2, title: 'Growing Enterprise', sub: '5–50 Employees, Multi-location Operations' }
];

export default function AssessmentPage() {
  const [stage, setStage] = useState('profile'); // 'profile' | 'interactive' | 'report'
  const [assessmentMode, setAssessmentMode] = useState('guided'); // 'guided' | 'checklist' | 'print'
  const [selectedProfile, setSelectedProfile] = useState('contractor');
  const [businessName, setBusinessName] = useState(() => {
    try {
      return localStorage.getItem('mrtechsys_cached_business_name') || '';
    } catch {
      return '';
    }
  });
  const [contactEmail, setContactEmail] = useState(() => {
    try {
      return localStorage.getItem('mrtechsys_cached_email') || '';
    } catch {
      return '';
    }
  });
  
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
  const [dispatchingEmail, setDispatchingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [reportEmailInput, setReportEmailInput] = useState(() => {
    try {
      return localStorage.getItem('mrtechsys_cached_email') || '';
    } catch {
      return '';
    }
  });

  // Scroll to top of window whenever stage or mode changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage, assessmentMode]);

  // Persist email and business name to cache whenever updated
  useEffect(() => {
    if (contactEmail && contactEmail.includes('@')) {
      try {
        localStorage.setItem('mrtechsys_cached_email', contactEmail.trim());
      } catch {}
    }
  }, [contactEmail]);

  useEffect(() => {
    if (reportEmailInput && reportEmailInput.includes('@')) {
      try {
        localStorage.setItem('mrtechsys_cached_email', reportEmailInput.trim());
      } catch {}
    }
  }, [reportEmailInput]);

  useEffect(() => {
    if (businessName) {
      try {
        localStorage.setItem('mrtechsys_cached_business_name', businessName.trim());
      } catch {}
    }
  }, [businessName]);

  const toggleAnswer = (key) => {
    setAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendReportEmail = async (overrideEmail) => {
    const targetEmail = (overrideEmail || reportEmailInput || contactEmail || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setEmailStatus({ sent: false, message: 'Please enter a valid business email address.' });
      return;
    }
    setDispatchingEmail(true);
    try {
      const res = await fetch('/api/assessment-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_report_email',
          profile: selectedProfile,
          email: targetEmail,
          businessName: businessName || 'Enterprise Client',
          contactName: 'Executive Leader',
          state: {
            ...answers,
            business_name: businessName || 'Enterprise Client',
            contact_email: targetEmail
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus({
          sent: data.emailSent,
          message: data.emailSent
            ? `Briefing successfully dispatched to ${targetEmail}.`
            : data.emailError
              ? `Delivery alert: ${data.emailError}`
              : `Briefing recorded for ${targetEmail}.`
        });
      }
    } catch (e) {
      setEmailStatus({ sent: false, message: 'Could not dispatch briefing. Please retry.' });
    } finally {
      setDispatchingEmail(false);
    }
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
            business_name: businessName || 'Enterprise Client',
            contact_email: contactEmail || 'leader@enterprise.com'
          }
        })
      });
      const data = await res.json();
      if (data.evaluation) {
        setReportData(data);
        if (data.emailSent) {
          setEmailStatus({ sent: true, message: `Playbook automatically dispatched to ${contactEmail}.` });
        }
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
          businessName: businessName || 'Enterprise Client',
          email: contactEmail || '',
          question: `Technology Health Assessment (${reportData?.evaluation?.healthScore || 72}/100) — Profile: ${reportData?.evaluation?.profileName || selectedProfile}`
        }
      }
    }));
  };

  const FRICTION_ITEMS = [
    { key: 'missed_calls', icon: Phone, title: 'Inbound Call & Lead Leakage', desc: 'Urgent calls rolling to unmonitored voicemail where qualified inquiries go cold.' },
    { key: 'manual_scheduling', icon: Calendar, title: 'Manual Scheduling Overhead', desc: 'Dispatchers coordinating schedules across calls and messages instead of automated rules.' },
    { key: 'paper_invoicing', icon: DollarSign, title: 'Delayed Billing & Settlements', desc: 'Work completed on-site, but invoices delayed by manual bookkeeping cycles.' },
    { key: 'former_employee_access', icon: Lock, title: 'Dormant Account Credential Exposure', desc: 'Former personnel or contractors retaining dormant credentials to core repositories.' },
    { key: 'mfa_enabled', icon: ShieldCheck, title: 'Two-Factor Authentication Active', desc: 'Multi-factor authentication enforced across email, infrastructure, and financial platforms.', inverted: true },
    { key: 'single_computer_risk', icon: Server, title: 'Single Point of Hardware Failure', desc: 'Critical operational continuity depending on one specific local computer or terminal.' },
    { key: 'backup_verified', icon: Cpu, title: 'Verified Automated Off-Site Backups', desc: 'Automated encrypted backups running with recovery verified in the last 6 months.', inverted: true },
    { key: 'duplicate_data_entry', icon: FileSpreadsheet, title: 'Duplicate Cross-Application Entry', desc: 'Data manually transcribed between forms, databases, spreadsheets, and ledgers.' },
  ];

  return (
    <div className="pt-28 pb-24 min-h-screen px-4 md:px-6 relative font-sans text-slate-100 bg-[#05070A]">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header Badge */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-[10px] tracking-wider uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>MRTECHSYS ADVISORY INSTRUMENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Systems Health <span className="text-gold-gradient">Diagnostic</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            High-precision operational evaluation across 10 structural dimensions. Designed for executive decision-makers.
          </p>

          {/* Assessment Mode Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-[#0B0F17] border border-[#D4AF37]/20 mt-3">
            <button
              type="button"
              onClick={() => { setAssessmentMode('guided'); setStage('profile'); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                assessmentMode === 'guided'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#05070A] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Guided Diagnostic
            </button>
            <button
              type="button"
              onClick={() => { setAssessmentMode('checklist'); setStage('interactive'); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                assessmentMode === 'checklist'
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rapid 60-Sec Audit
            </button>
            <button
              type="button"
              onClick={() => { setAssessmentMode('print'); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                assessmentMode === 'print'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Printable Instrument
            </button>
          </div>
        </div>

        {/* MODE: PRINTABLE AUDIT WORKSHEET */}
        {assessmentMode === 'print' && (
          <div className="printable-document-payload bg-[#0B0F17] text-slate-100 border border-[#D4AF37]/30 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6">
            
            {/* Document Header with Official Logo and Title */}
            <div className="border-b border-[#D4AF37]/20 pb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="MrTechSys" 
                  className="w-10 h-10 object-contain drop-shadow"
                />
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] block">
                    MRTECHSYS // EXECUTIVE AUDIT INSTRUMENT
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-0.5">10-Point Operational Friction Rubric</h2>
                  <p className="text-xs text-slate-400">Confidential on-site diagnostic &amp; structural readiness baseline.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#05070A] font-mono text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)]"
              >
                Print / Save PDF
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="border border-white/10 p-2.5 rounded bg-black/40">Enterprise: ____________________________</div>
              <div className="border border-white/10 p-2.5 rounded bg-black/40">Industry Model: _________________________</div>
              <div className="border border-white/10 p-2.5 rounded bg-black/40">Executive Lead: ______________________</div>
              <div className="border border-white/10 p-2.5 rounded bg-black/40">Headcount / Units: ______________________</div>
            </div>

            <div className="space-y-3">
              {FRICTION_ITEMS.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.key} className="p-3.5 border border-white/[0.08] rounded-xl flex items-start justify-between gap-4 bg-black/30">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <ItemIcon size={14} className="text-[#D4AF37]" />
                        <span className="font-bold text-xs text-white">{idx + 1}. {item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-1 font-mono text-xs">
                      <span className="px-2.5 py-1 border border-white/20 rounded">[ &nbsp; ] PASS</span>
                      <span className="px-2.5 py-1 border border-amber-500/40 bg-amber-500/10 text-amber-400 rounded">[ &nbsp; ] DRAG</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Document Print Footer */}
            <div className="pt-6 border-t border-[#D4AF37]/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>MRTECHSYS // SYSTEMS, RESOLVED &bull; CONFIDENTIAL AUDIT</span>
              <span>HTTPS://MRTECHSYS.COM &bull; AUSTIN, TX</span>
            </div>
          </div>
        )}

        {/* STAGE 1: PROFILE SELECTOR */}
        {assessmentMode !== 'print' && stage === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0B0F17] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-semibold">Phase 01 · Baseline Operations Model</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Select your primary operational archetype:</h2>
              <p className="text-xs text-slate-300 mt-1">Calibrates the telemetry rules engine to your vertical physics.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUSINESS_PROFILES.map((p) => {
                const ProfileIcon = p.icon;
                const isSelected = selectedProfile === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProfile(p.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/[0.04] text-slate-400'}`}>
                        <ProfileIcon size={20} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-[#D4AF37]' : 'text-white'}`}>{p.title}</h4>
                        <p className="text-xs text-slate-300 mt-0.5">{p.sub}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1 font-semibold">Enterprise Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Mechanical"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1 font-semibold">Corporate Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="executive@company.com"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStage('interactive')}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#05070A] font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Initialize 10-Point Friction Matrix &rarr;</span>
            </button>
          </motion.div>
        )}

        {/* STAGE 2: INTERACTIVE 10-DIMENSION DIAGNOSTIC OR 60-SEC CHECKLIST */}
        {assessmentMode !== 'print' && stage === 'interactive' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0B0F17] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-semibold">
                  {assessmentMode === 'checklist' ? 'Rapid 60-Second Audit' : 'Phase 02 · Operational Friction Vectors'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Identify active operational drag points:</h2>
              </div>
              <button
                type="button"
                onClick={() => setStage('profile')}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Change Profile
              </button>
            </div>

            {/* Profile Quick Pill in Checklist Mode */}
            {assessmentMode === 'checklist' && (
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-xs font-mono text-slate-300">Active Archetype:</span>
                {BUSINESS_PROFILES.map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProfile(p.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedProfile === p.id
                          ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-bold'
                          : 'bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{p.title}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              {FRICTION_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                const isTriggered = item.inverted ? !answers[item.key] : answers[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleAnswer(item.key)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isTriggered
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2 rounded-lg mt-0.5 ${isTriggered ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.04] text-slate-400'}`}>
                        <ItemIcon size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {item.title}
                          {isTriggered && <span className="text-[10px] font-mono text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">Flagged</span>}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-all ${
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
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] disabled:opacity-50 text-[#05070A] font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-[#05070A]" />
                  <span>Synthesizing Systems Telemetry...</span>
                </>
              ) : (
                <span>Generate Executive Diagnostic Report &rarr;</span>
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
                  <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-semibold">Executive Diagnostic Briefing</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">{businessName || 'Enterprise Systems'}</h2>
                  <p className="text-xs text-slate-300 mt-1">Evaluated across 10 core dimensions by MrTechSys Consultant Agent</p>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-center shrink-0 min-w-[170px]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Health Score</span>
                  <div className="text-4xl font-extrabold text-gold-gradient my-0.5">
                    {reportData.evaluation.healthScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
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

              {/* UNBIASED MULTI-CLOUD LAUNCHPAD */}
              <div className="p-5 sm:p-6 rounded-xl bg-black/50 border border-[#D4AF37]/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">Unbiased Architecture Advisory</span>
                    <h4 className="text-base font-bold text-white">Recommended Zero-Cost Cloud Primitives</h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 self-start sm:self-auto">
                    Multi-Cloud &bull; Zero Vendor Lock-in
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  As an objective cloud architecture consultancy, MrTechSys configures solutions across the top tier providers so you never suffer vendor lock-in. Activate your permanent free-tier allocations:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Cloudflare */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F38020]"></span>
                          <strong className="text-white text-sm font-bold">Cloudflare Edge</strong>
                        </div>
                        <span className="text-[9px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30 font-semibold">
                          Zero-Egress &bull; Global CDN
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Industry-leading edge network operating across 330+ global data centers. Acts as the protective, zero-cost front door to your business applications.
                      </p>
                      <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#D4AF37] font-bold">✦ What They Offer:</span>
                          <span>Unlimited static requests, automated SSL/TLS certificates, DDoS shielding, 100K daily serverless Worker API calls, 5GB D1 SQL, and 10GB/mo R2 storage with zero egress fees.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✦ What to Expect:</span>
                          <span>Instant signup with email only. Zero credit card required to start. Setup involves pointing your domain nameservers to Cloudflare for immediate speed and protection.</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400">100% Free Forever Tier</span>
                      <a
                        href="https://dash.cloudflare.com/sign-up"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-bold transition-all"
                      >
                        <span>Setup Cloudflare &rarr;</span>
                      </a>
                    </div>
                  </div>

                  {/* AWS */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]"></span>
                          <strong className="text-white text-sm font-bold">Amazon Web Services (AWS)</strong>
                        </div>
                        <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
                          Serverless &bull; Permanent Free
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        The world's most comprehensive cloud infrastructure platform. Powers scalable backends, automated compute, and bulletproof NoSQL databases without fixed servers.
                      </p>
                      <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                        <div className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">✦ What They Offer:</span>
                          <span>1 Million AWS Lambda executions monthly forever, 25GB Amazon DynamoDB NoSQL storage permanently free, 1M API Gateway calls, and 5GB S3 asset storage for 12 months.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✦ What to Expect:</span>
                          <span>Requires credit card for identity verification ($0 charge). Setup includes root account MFA security and configuring a $0.00 AWS Budgets alarm so you never get surprise bills.</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400">12 Mo Free + Always Free</span>
                      <a
                        href="https://aws.amazon.com/free"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold transition-all"
                      >
                        <span>Setup AWS Free Tier &rarr;</span>
                      </a>
                    </div>
                  </div>

                  {/* Microsoft Azure */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-blue-500/30 hover:border-blue-500/60 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0078D4]"></span>
                          <strong className="text-white text-sm font-bold">Microsoft Azure</strong>
                        </div>
                        <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
                          Identity &bull; Enterprise SSO
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Enterprise-grade cloud suite seamlessly integrated with Microsoft 365, Outlook, and Active Directory. Ideal for professional firms and corporate teams.
                      </p>
                      <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                        <div className="flex items-start gap-1.5">
                          <span className="text-blue-400 font-bold">✦ What They Offer:</span>
                          <span>$200 in 30-day starter credits, Microsoft Entra ID (Azure AD) single sign-on for 50,000 users at $0, 1M Azure Functions monthly, and 1,000 RU/s Cosmos DB free.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✦ What to Expect:</span>
                          <span>Sign up with your work Microsoft or personal account. You get 12 months of popular services plus 55+ services permanently free. Cost management budgets prevent spending beyond $0.</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-blue-400">$200 Credit + 55+ Free</span>
                      <a
                        href="https://azure.microsoft.com/free"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold transition-all"
                      >
                        <span>Setup Azure Free Tier &rarr;</span>
                      </a>
                    </div>
                  </div>

                  {/* Google Cloud */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]"></span>
                          <strong className="text-white text-sm font-bold">Google Cloud (GCP)</strong>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                          Containers &bull; BigQuery &amp; AI
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Pinnacle developer cloud built on Google's private global fiber network. Unrivaled container autoscaling, analytics data warehousing, and native Vertex AI primitives.
                      </p>
                      <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✦ What They Offer:</span>
                          <span>$300 in 90-day free credits, 2 Million Cloud Run container requests monthly with sub-second scale-to-zero, 1GB Firestore NoSQL DB, and 1TB/mo free BigQuery SQL analytics.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✦ What to Expect:</span>
                          <span>Instant signup with any Google Account. Google explicitly guarantees no auto-billing when the $300 credit expires unless you explicitly upgrade to a paid account.</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400">$300 Credit + Always Free</span>
                      <a
                        href="https://cloud.google.com/free"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold transition-all"
                      >
                        <span>Setup Google Cloud &rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* EMAIL REPORT DISPATCH CARD */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#D4AF37]" />
                    <h4 className="text-sm font-bold text-white">Receive Complete PDF &amp; Playbook via Email</h4>
                  </div>
                  {emailStatus && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      emailStatus.sent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {emailStatus.sent ? 'Dispatched ✓' : 'Notice'}
                    </span>
                  )}
                </div>

                {emailStatus?.message ? (
                  <p className={`text-xs font-mono p-2.5 rounded-lg border ${
                    emailStatus.sent
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                  }`}>
                    {emailStatus.message}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Send this executive briefing, 10-point audit scores, and direct activation links directly to your inbox or operations manager:
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="email"
                    value={reportEmailInput || contactEmail}
                    onChange={(e) => setReportEmailInput(e.target.value)}
                    placeholder="Enter recipient email..."
                    className="flex-grow bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    disabled={dispatchingEmail}
                    onClick={() => handleSendReportEmail()}
                    className="px-5 py-2.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/40 font-mono text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {dispatchingEmail ? 'Sending...' : 'Email Report →'}
                  </button>
                </div>
              </div>

              {/* Consultation Booking Call to Action */}
              <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Want help implementing your roadmap?</h4>
                  <p className="text-xs text-slate-400">Review your findings live with the MrTechSys advisory team in a private strategy session.</p>
                </div>
                <button
                  type="button"
                  onClick={triggerBookingWithContext}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer whitespace-nowrap"
                >
                  Book Free 30-Min Strategy Review →
                </button>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
