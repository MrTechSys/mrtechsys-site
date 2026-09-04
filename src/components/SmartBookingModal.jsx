import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Bot, Calendar, Clock,
  Video, Phone, Sparkles, CheckCircle2, ShieldCheck,
  Loader2, Zap, AlertCircle
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { id: 'AI Automation', label: 'AI Automation', emoji: '🤖', desc: 'AI agents, voice dispatch, lead capture' },
  { id: 'Cloud Migration', label: 'Cloud Migration', emoji: '☁️', desc: 'Move workloads to zero-cost cloud stack' },
  { id: 'DevOps Setup', label: 'DevOps Setup', emoji: '⚙️', desc: 'CI/CD, pipelines, container orchestration' },
  { id: 'Security Audit', label: 'Security Audit', emoji: '🔐', desc: 'Zero-trust, compliance, SOC 2 posture' },
  { id: 'Custom Build', label: 'Custom Build', emoji: '🏗️', desc: 'Full-stack application from scratch' },
  { id: 'CloudFlip Setup', label: 'CloudFlip Setup', emoji: '⚡', desc: 'Launch your CloudFlip OS workspace' },
  { id: 'Enterprise Integration', label: 'Enterprise Integration', emoji: '🔗', desc: 'Connect your existing tools and APIs' },
  { id: 'General Advisory', label: 'General Advisory', emoji: '🧭', desc: 'Strategy, architecture review, roadmap' },
];

const INDUSTRIES = [
  { id: 'trades', label: 'Trades & Field Services' },
  { id: 'food', label: 'Food & Hospitality' },
  { id: 'commercial', label: 'Commercial & Real Estate' },
  { id: 'professional', label: 'Professional Services' },
  { id: 'fleet', label: 'Auto & Logistics' },
  { id: 'technology', label: 'Technology & Software' },
  { id: 'retail', label: 'Retail & E-Commerce' },
  { id: 'other', label: 'Other' },
];

const BUDGETS = ['<$1K', '$1–5K', '$5–15K', '$15K+'];
const TIMELINES = ['ASAP', '1 Month', '1–3 Months', 'Flexible'];
const DURATIONS = [30, 45, 60];
const MEETING_TYPES = [
  { id: 'zoom', label: 'Zoom', icon: Video },
  { id: 'google_meet', label: 'Google Meet', icon: Video },
  { id: 'phone', label: 'Phone Call', icon: Phone },
  { id: 'cloudflip_live', label: 'CloudFlip Live', icon: Zap },
];

const STEP_LABELS = ['Service', 'Details', 'AI Plan', 'Schedule', 'Confirm'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDates(count = 21) {
  const dates = [];
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1); // enforce 24h advance notice
  for (let i = 0; i < count; i++) {
    const d = new Date(tomorrow);
    d.setDate(tomorrow.getDate() + i);
    const dow = d.getDay();
    if (dow === 0) continue; // skip Sundays
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepDot = ({ step, current, label }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold font-mono transition-all ${
      step < current ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
      step === current ? 'bg-[#D4AF37] text-[#07090E] shadow-[0_0_12px_rgba(212,175,55,0.4)]' :
      'bg-white/[0.05] text-slate-500 border border-white/[0.08]'
    }`}>
      {step < current ? <CheckCircle2 size={13} /> : step}
    </div>
    <span className={`text-[9px] font-mono tracking-wider uppercase hidden sm:block ${step === current ? 'text-[#D4AF37]' : 'text-slate-600'}`}>{label}</span>
  </div>
);

const ChipButton = ({ selected, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
      selected
        ? 'bg-[#D4AF37]/20 border-[#D4AF37]/60 text-[#D4AF37]'
        : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-[#D4AF37]/30 hover:text-slate-300'
    } ${className}`}
  >
    {children}
  </button>
);

const InputField = ({ label, required, ...props }) => (
  <div>
    <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
      {label}{required && <span className="text-[#D4AF37]"> *</span>}
    </label>
    {props.as === 'textarea'
      ? <textarea {...props} className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] resize-none" />
      : <input {...props} className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]" />
    }
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SmartBookingModal = ({ isOpen, onClose, prefillService = null, prefillContext = null }) => {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState(prefillService || '');
  const [industry, setIndustry] = useState('');
  const [problemSummary, setProblemSummary] = useState(prefillContext?.question || '');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline, setTimeline] = useState('');
  const [aiPlan, setAiPlan] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [meetingType, setMeetingType] = useState('zoom');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [name, setName] = useState(prefillContext?.name || '');
  const [email, setEmail] = useState(prefillContext?.email || '');
  const [businessName, setBusinessName] = useState(prefillContext?.businessName || '');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const availableDates = getDates(21);

  // Fetch AI plan when entering step 3
  const fetchAIPlan = useCallback(async () => {
    if (aiPlan) return; // Already fetched
    setIsLoadingAI(true);
    setAiError('');
    try {
      const prompt = `Architecture Strategy Request for ${businessName || 'a business'}:
Service Needed: ${serviceType}
Industry: ${INDUSTRIES.find(i => i.id === industry)?.label || industry}
Problem: ${problemSummary || 'Looking for digital transformation guidance'}
Budget: ${budgetRange || 'TBD'}
Timeline: ${timeline || 'Flexible'}

As MrTechSys Virtual Architect, provide a concise personalized plan covering:
1. Recommended architecture approach (2-3 sentences)
2. Top 3 specific tools/services for their stack
3. Quick wins they can implement immediately
4. What we'll cover in the strategy session

Keep it practical, direct, and exciting. No more than 250 words.`;

      const res = await fetch('/api/mrtechsysgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });
      const data = await res.json();
      setAiPlan(data.reply || 'Unable to generate plan at this time.');
    } catch (err) {
      setAiError('Could not generate AI plan. You can still continue to book your session.');
      setAiPlan('AI plan generation unavailable. We will discuss your situation live during the session.');
    } finally {
      setIsLoadingAI(false);
    }
  }, [serviceType, industry, problemSummary, budgetRange, timeline, businessName, aiPlan]);

  // Fetch available time slots when date or duration changes
  const fetchSlots = useCallback(async (date, dur) => {
    if (!date) return;
    setIsLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedTime('');
    try {
      const res = await fetch(`/api/booking-availability?date=${date}&duration=${dur}`);
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (step === 3) fetchAIPlan();
  }, [step, fetchAIPlan]);

  useEffect(() => {
    if (step === 4 && selectedDate) fetchSlots(selectedDate, duration);
  }, [step, selectedDate, duration, fetchSlots]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    fetchSlots(date, duration);
  };

  const handleDurationChange = (d) => {
    setDuration(d);
    if (selectedDate) fetchSlots(selectedDate, d);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/booking-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          businessName: businessName.trim(),
          phone: phone.trim(),
          serviceType,
          industry,
          problemSummary,
          budgetRange,
          timeline,
          aiPlanSummary: aiPlan,
          bookingDate: selectedDate,
          bookingTime: selectedTime,
          duration,
          meetingType
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingResult(data);
        setStep(6); // Success state
      } else if (data.code === 'SLOT_CONFLICT') {
        setSubmitError('That slot was just taken — please go back and choose another time.');
        setStep(4);
      } else {
        setSubmitError(data.error || 'Booking failed. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAdvance = () => {
    if (step === 1) return !!serviceType;
    if (step === 2) return !!industry && !!budgetRange && !!timeline;
    if (step === 3) return true;
    if (step === 4) return !!selectedDate && !!selectedTime;
    if (step === 5) return !!name.trim() && !!email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return false;
  };

  const next = () => { if (canAdvance() && step < 5) setStep(s => s + 1); };
  const back = () => { if (step > 1) setStep(s => s - 1); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/40 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 pt-5 pb-4 bg-[#0B0F17] border-b border-white/[0.07]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-[10px] tracking-wider uppercase mb-3 font-bold">
            <Sparkles size={11} className="animate-spin" />
            <span>MrTechSys Smart Booking</span>
          </div>
          <h2 className="text-lg font-bold text-white">Book a Strategy Session</h2>
          {step < 6 && (
            <div className="flex items-center gap-2 mt-4">
              {STEP_LABELS.map((label, i) => (
                <React.Fragment key={i}>
                  <StepDot step={i + 1} current={step} label={label} />
                  {i < STEP_LABELS.length - 1 && (
                    <div className={`flex-1 h-px transition-all ${i + 1 < step ? 'bg-emerald-500/40' : 'bg-white/[0.07]'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Service Type ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h3 className="text-sm font-semibold text-white mb-1">What can I help you with?</h3>
                <p className="text-xs text-slate-400 mb-4">Choose the primary focus for your strategy session.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {SERVICE_TYPES.map(svc => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setServiceType(svc.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        serviceType === svc.id
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37]/60 shadow-[0_0_12px_rgba(212,175,55,0.1)]'
                          : 'bg-white/[0.02] border-white/[0.07] hover:border-[#D4AF37]/30'
                      }`}
                    >
                      <div className="text-base mb-1">{svc.emoji}</div>
                      <div className={`text-xs font-semibold mb-0.5 ${serviceType === svc.id ? 'text-[#D4AF37]' : 'text-white'}`}>{svc.label}</div>
                      <div className="text-[10px] text-slate-500 leading-relaxed">{svc.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Qualifying Questions ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Tell me about your situation</h3>
                  <p className="text-xs text-slate-400 mb-4">This helps me generate a personalized architecture plan before our call.</p>
                </div>
                {/* Industry */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2">Industry <span className="text-[#D4AF37]">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map(ind => (
                      <ChipButton key={ind.id} selected={industry === ind.id} onClick={() => setIndustry(ind.id)}>{ind.label}</ChipButton>
                    ))}
                  </div>
                </div>
                {/* Problem */}
                <InputField label="Current Bottleneck or Goal" as="textarea" rows={3} value={problemSummary} onChange={e => setProblemSummary(e.target.value)} placeholder="e.g. We're losing customers because missed calls roll to voicemail. We need AI dispatch and mobile payments..." />
                {/* Budget */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2">Budget Range <span className="text-[#D4AF37]">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map(b => <ChipButton key={b} selected={budgetRange === b} onClick={() => setBudgetRange(b)}>{b}</ChipButton>)}
                  </div>
                </div>
                {/* Timeline */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2">Timeline <span className="text-[#D4AF37]">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {TIMELINES.map(t => <ChipButton key={t} selected={timeline === t} onClick={() => setTimeline(t)}>{t}</ChipButton>)}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: AI Plan ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center gap-2 mb-4">
                  <Bot size={18} className="text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Your Personalized Architecture Plan</h3>
                </div>
                {isLoadingAI ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 size={28} className="text-[#D4AF37] animate-spin" />
                    <p className="text-xs text-slate-400 font-mono">MrTechSysGPT is analyzing your situation...</p>
                  </div>
                ) : aiError ? (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
                    <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-300">{aiError}</p>
                  </div>
                ) : null}
                {aiPlan && !isLoadingAI && (
                  <div className="p-4 rounded-xl bg-[#D4AF37]/[0.06] border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.06)]">
                    <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Sparkles size={10} /> MrTechSys Architecture Advisory
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{aiPlan}</div>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 mt-3 text-center">We'll walk through this live during your session and dive deeper into your specific setup.</p>
              </motion.div>
            )}

            {/* ── Step 4: Calendar + Slots ── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h3 className="text-sm font-semibold text-white mb-1">Choose a Date & Time</h3>
                <p className="text-xs text-slate-400 mb-4">All times in Central Standard Time (CST).</p>

                {/* Duration selector */}
                <div className="mb-4">
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2">Session Duration</label>
                  <div className="flex gap-2">
                    {DURATIONS.map(d => (
                      <ChipButton key={d} selected={duration === d} onClick={() => handleDurationChange(d)}>{d} min</ChipButton>
                    ))}
                  </div>
                </div>

                {/* Date picker scroll */}
                <div className="mb-4">
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar size={11} /> Select Date</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {availableDates.map(date => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => handleDateSelect(date)}
                        className={`shrink-0 px-3 py-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                          selectedDate === date
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-[#07090E] font-bold shadow-[0_0_16px_rgba(212,175,55,0.35)]'
                            : 'bg-white/[0.03] border-white/[0.08] text-slate-300 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <div className="text-[10px] font-mono uppercase tracking-wider">{formatDate(date).split(' ')[0]}</div>
                        <div className="text-sm font-bold">{formatDate(date).split(' ').slice(1).join(' ')}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock size={11} /> Available Times</label>
                    {isLoadingSlots ? (
                      <div className="flex items-center gap-2 py-4"><Loader2 size={14} className="text-[#D4AF37] animate-spin" /><span className="text-xs text-slate-400 font-mono">Loading slots...</span></div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3">No available slots on this date. Please choose another day.</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map(slot => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setSelectedTime(slot.time)}
                            className={`py-2 px-3 rounded-lg border text-xs font-mono text-center cursor-pointer transition-all ${
                              selectedTime === slot.time
                                ? 'bg-[#D4AF37]/20 border-[#D4AF37]/60 text-[#D4AF37] font-bold'
                                : 'bg-white/[0.03] border-white/[0.07] text-slate-400 hover:border-[#D4AF37]/30'
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Meeting type */}
                {selectedDate && selectedTime && (
                  <div className="mt-4">
                    <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-2">Meeting Format</label>
                    <div className="flex flex-wrap gap-2">
                      {MEETING_TYPES.map(mt => {
                        const Icon = mt.icon;
                        return (
                          <button
                            key={mt.id}
                            type="button"
                            onClick={() => setMeetingType(mt.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                              meetingType === mt.id
                                ? 'bg-[#D4AF37]/20 border-[#D4AF37]/60 text-[#D4AF37]'
                                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-[#D4AF37]/30'
                            }`}
                          >
                            <Icon size={11} />{mt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step 5: Contact + Confirm ── */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Almost there — confirm your details</h3>
                  <div className="p-3 rounded-lg bg-[#D4AF37]/[0.06] border border-[#D4AF37]/30 text-xs font-mono mb-3">
                    <span className="text-slate-400">📅 </span>
                    <span className="text-white font-bold">{formatDateFull(selectedDate)}</span>
                    <span className="text-slate-400"> · </span>
                    <span className="text-[#D4AF37] font-bold">
                      {/* Show 12h time */}
                      {(() => { const [h, m] = selectedTime.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 || 12; return `${h12}:${m.toString().padStart(2, '0')} ${ap} CST`; })()}
                    </span>
                    <span className="text-slate-400"> · {duration} min · {MEETING_TYPES.find(m => m.id === meetingType)?.label}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="Your Name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex Morgan" />
                  <InputField label="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Lone Star Tech" />
                </div>
                <InputField label="Email Address" required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="owner@yourcompany.com" />
                <InputField label="Phone (optional)" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (512) 555-0100" />
                {submitError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{submitError}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canAdvance()}
                  className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] disabled:opacity-50 text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Confirming Booking...</> : <><CheckCircle2 size={14} /> Confirm Strategy Session →</>}
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  <span>Private · Zero Spam · Confirmation sent to your email</span>
                </div>
              </motion.div>
            )}

            {/* ── Step 6: Success ── */}
            {step === 6 && bookingResult && (
              <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">You're booked!</h3>
                <p className="text-sm text-slate-400 mb-4">Your strategy session is confirmed. Check your email for the details and meeting link.</p>
                <div className="p-4 rounded-xl bg-[#D4AF37]/[0.06] border border-[#D4AF37]/30 text-left mb-6">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Booking Summary</div>
                  <div className="text-xs font-mono space-y-1">
                    <div><span className="text-slate-400">Session: </span><span className="text-white">{bookingResult.date} · {bookingResult.time} CST</span></div>
                    <div><span className="text-slate-400">Topic: </span><span className="text-[#D4AF37]">{serviceType}</span></div>
                    <div><span className="text-slate-400">Format: </span><span className="text-white">{MEETING_TYPES.find(m => m.id === bookingResult.meetingType)?.label}</span></div>
                    <div><span className="text-slate-400">ID: </span><span className="text-slate-400 text-[10px]">{bookingResult.bookingId?.slice(0, 8).toUpperCase()}</span></div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        {step < 6 && (
          <div className="sticky bottom-0 px-6 py-4 bg-[#0B0F17] border-t border-white/[0.07] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={back}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 font-mono text-xs transition-all cursor-pointer ${step === 1 ? 'invisible' : ''}`}
            >
              <ChevronLeft size={14} /> Back
            </button>
            {step < 5 && (
              <button
                type="button"
                onClick={next}
                disabled={!canAdvance()}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] disabled:opacity-40 text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-[0_0_14px_rgba(212,175,55,0.25)]"
              >
                {step === 3 ? 'Schedule Session' : 'Continue'} <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SmartBookingModal;
