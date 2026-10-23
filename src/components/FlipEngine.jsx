import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building2, Wrench, Utensils, Briefcase, Truck, 
  ArrowRight, CheckCircle2, RefreshCw, 
  DollarSign, Clock, TrendingDown, FileText, Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import ConsultationModal from './ConsultationModal';

const INDUSTRIES = [
  { id: 'trades', name: 'Trades & Field Services', icon: Wrench, defaultTeam: 1, avgJobValue: 350, desc: 'HVAC, Electrical, Plumbing, Roofing, Lawn Care' },
  { id: 'food', name: 'Food & Hospitality', icon: Utensils, defaultTeam: 8, avgJobValue: 45, desc: 'Restaurants, Commercial Kitchens, Catering' },
  { id: 'commercial', name: 'Commercial & Real Estate', icon: Building2, defaultTeam: 6, avgJobValue: 1800, desc: 'Property Mgmt, Brokerages, Facility Ops' },
  { id: 'professional', name: 'Solo Pro & Services', icon: Briefcase, defaultTeam: 1, avgJobValue: 600, desc: 'Independent Consulting, Legal, Bookkeeping' },
  { id: 'fleet', name: 'Auto & Logistics', icon: Truck, defaultTeam: 6, avgJobValue: 650, desc: 'Fleet Operations, Towing, Mobile Repair' }
];

const FRICTION_POINTS = [
  { id: 'missed_calls', label: 'Missed Calls & Inbound Lead Leakage', impactHours: 12, revImpactPct: 0.15, desc: 'Calls rolling to voicemail when dispatch or techs are in the field' },
  { id: 'manual_dispatch', label: 'Manual Scheduling & Route Drag', impactHours: 14, revImpactPct: 0.08, desc: 'Back-and-forth phone calls, double bookings, unoptimized routing' },
  { id: 'paper_quoting', label: 'Slow Paper / Manual Quoting', impactHours: 10, revImpactPct: 0.12, desc: 'Quotes taking 24-48 hours instead of instant photo-to-quote closing' },
  { id: 'duplicate_entry', label: 'Duplicate Entry across Disconnected Apps', impactHours: 16, revImpactPct: 0.05, desc: 'Re-entering customer details from CRM into invoicing and spreadsheets' },
  { id: 'delayed_payments', label: 'Payment Collection & Invoice Friction', impactHours: 8, revImpactPct: 0.10, desc: 'Waiting 30-60 days for net-30 checks instead of instant mobile settlement' },
  { id: 'onprem_fragility', label: 'Legacy On-Prem / Fragile Server Storage', impactHours: 6, revImpactPct: 0.06, desc: 'Local servers, manual backups, and fear of hardware failure downtime' },
];

const BLUEPRINTS = {
  trades: [
    { title: 'Missed Call AI Voice Agent', desc: 'Captures urgent inbound calls 24/7, qualifies work order, and creates dispatch tickets instantly.', tag: 'AI Runtime' },
    { title: 'Photo-to-Quote Engine', desc: 'Technicians take a field snapshot; automated parts/labor estimation generates an instant approval link.', tag: 'CloudFlip Mobile' },
    { title: 'Autonomous Route Densification', desc: 'Clusters appointments geographically to save 18% weekly fuel and 6+ hours of drive time.', tag: 'CloudFlip Ops' },
    { title: 'Instant Mobile Tap-to-Pay', desc: 'Zero-friction credit/debit/ACH invoice settlement right upon work sign-off.', tag: 'Payments' }
  ],
  food: [
    { title: 'CloudFlip Kitchen Display Orchestrator', desc: 'Unifies POS, online aggregators, and bar tickets into a sub-second low-latency queue.', tag: 'CloudFlip Ops' },
    { title: 'Dynamic Waste & Inventory Telemetry', desc: 'Predictive raw ingredient consumption tracking synchronized with vendor reorders.', tag: 'Automation' },
    { title: 'Autonomous Shift Scheduling & Labor AI', desc: 'Predicts staffing needs based on weather, local events, and historical covers.', tag: 'TOL-Core' }
  ],
  commercial: [
    { title: 'Automated Lease & Compliance Extraction', desc: 'TOL-Core document parser extracts critical dates, escalations, and SLA milestones.', tag: 'TOL-Core' },
    { title: 'Tenant Work Order Portal', desc: 'Centralized tenant request triage with vendor dispatch and maintenance milestone tracking.', tag: 'Client Portal' },
    { title: 'Zero-Trust Financial Reporting', desc: 'Continuous ledger synchronization into secure cloud analytics and investor dashboards.', tag: 'Security' }
  ],
  professional: [
    { title: 'Client Onboarding Pipeline', desc: 'Automated document ingestion, KYC verification, and e-sign signature workflows.', tag: 'Workflow' },
    { title: 'Automated Billable Time Capture', desc: 'Passive tracking and reconciliation against client retainers and project milestones.', tag: 'Cloud Engine' },
    { title: 'Secure Multi-Tenant Client Vault', desc: 'Zero-trust encrypted storage powered by Cloudflare edge access controls.', tag: 'Security' }
  ],
  fleet: [
    { title: 'Real-Time Telemetry & Maintenance AI', desc: 'Predictive diagnostic alerts and automated parts requisition prior to breakdown.', tag: 'IoT Stream' },
    { title: 'Dynamic Driver Dispatch Matrix', desc: 'Live traffic, vehicle capability, and driver availability calculated in milliseconds.', tag: 'CloudFlip Ops' }
  ]
};

const FlipEngine = () => {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0]);
  const [teamSize, setTeamSize] = useState(1);
  const [selectedFrictions, setSelectedFrictions] = useState(['missed_calls', 'manual_dispatch', 'duplicate_entry']);
  const [hourlyWage, setHourlyWage] = useState(28);
  const [monthlyRevenue, setMonthlyRevenue] = useState(4000);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  const toggleFriction = (id) => {
    setSelectedFrictions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const calculations = useMemo(() => {
    const activeFrictions = FRICTION_POINTS.filter(f => selectedFrictions.includes(f.id));
    const rawHours = activeFrictions.reduce((acc, curr) => acc + curr.impactHours, 0);
    
    // For solopreneurs (1 person), hours are capped realistically at 5-8 hrs/wk total
    // For larger teams, it scales moderately with employee count
    const totalWeeklyHoursLost = teamSize === 1 
      ? Math.min(8, Math.max(3, Math.round(rawHours * 0.18)))
      : Math.min(teamSize * 3, Math.round(rawHours * 0.22 * teamSize));
      
    const annualHoursLost = totalWeeklyHoursLost * 50;
    const annualWastedPayroll = annualHoursLost * hourlyWage;
    
    // Solopreneurs / small businesses realistically lose 4-8% to missed calls and delayed quoting
    const combinedRevLeakagePct = Math.min(0.08, activeFrictions.reduce((acc, curr) => acc + (curr.revImpactPct * 0.25), 0));
    const annualRevenueLeakage = (monthlyRevenue * 12) * combinedRevLeakagePct;
    
    const totalCostOfInaction = annualWastedPayroll + annualRevenueLeakage;
    const projectedSavings = totalCostOfInaction * 0.65; // realistic recovery benchmark

    return {
      totalWeeklyHoursLost,
      annualHoursLost,
      annualWastedPayroll,
      annualRevenueLeakage,
      totalCostOfInaction,
      projectedSavings
    };
  }, [selectedFrictions, hourlyWage, monthlyRevenue, teamSize]);

  // Viewport Auto-Scroll: Resets scroll to top of diagnostic engine on step advancement
  useEffect(() => {
    const el = document.getElementById('readiness-engine');
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }
  }, [step]);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generateExecutivePDF = () => {
    try {
      setIsGeneratingPDF(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = 48;

      // Background Tone
      doc.setFillColor(7, 9, 14); // #07090E
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Top Decorative Accent Line (Metallic Gold)
      doc.setFillColor(212, 175, 55); // #D4AF37
      doc.rect(margin, y, pageWidth - (margin * 2), 2, 'F');
      y += 18;

      // Header Tagline & Brand
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(212, 175, 55); // Gold
      doc.text('MRTECHSYS // CLOUDFLIP ARCHITECTURE BLUEPRINT', margin, y);

      const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`DATE: ${timestamp.toUpperCase()} | CONFIDENTIAL`, pageWidth - margin, y, { align: 'right' });
      y += 24;

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text(`Executive Transformation Blueprint: ${selectedIndustry.name}`, margin, y);
      y += 18;

      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Operating Baseline: ${teamSize} Full-Time Personnel | $${monthlyRevenue.toLocaleString()}/mo Revenue Profile`, margin, y);
      y += 26;

      // Card 1: Quantified Cost of Inaction (COI)
      doc.setFillColor(15, 23, 42); // slate-900 / #0F172A
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 94, 4, 4, 'F');
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.75);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 94, 4, 4, 'S');

      // COI Headers
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(212, 175, 55);
      doc.text('QUANTIFIED ANNUAL FRICTION & LEAKAGE (PRE-FLIP)', margin + 14, y + 20);

      // 4 Metric Columns inside COI Box
      const colWidth = (pageWidth - (margin * 2) - 28) / 4;
      const metrics = [
        { label: 'Weekly Hours Lost', value: `${calculations.totalWeeklyHoursLost} hrs/wk` },
        { label: 'Wasted Payroll Drag', value: `$${Math.round(calculations.annualWastedPayroll).toLocaleString()}/yr` },
        { label: 'Inbound Revenue Drag', value: `$${Math.round(calculations.annualRevenueLeakage).toLocaleString()}/yr` },
        { label: 'Total Inaction Cost', value: `$${Math.round(calculations.totalCostOfInaction).toLocaleString()}/yr` }
      ];

      metrics.forEach((m, idx) => {
        const colX = margin + 14 + (idx * colWidth);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(m.label, colX, y + 42);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(idx === 3 ? 245 : 255, idx === 3 ? 158 : 255, idx === 3 ? 11 : 255); // Amber for total
        doc.text(m.value, colX, y + 62);
      });

      y += 114;

      // Section: Projected Post-Flip Recovery
      doc.setFillColor(212, 175, 55, 0.08);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 48, 4, 4, 'F');
      doc.setDrawColor(245, 158, 11); // Amber
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 48, 4, 4, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(212, 175, 55);
      doc.text('ESTIMATED 12-MONTH POTENTIAL RECOVERY (BENCHMARK: 65%)*', margin + 14, y + 20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(253, 224, 71); // Yellow accent
      doc.text(`+$${Math.round(calculations.projectedSavings).toLocaleString()} / year`, margin + 14, y + 38);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Reclaimed across dispatch routing, instant photo-quoting, and automated lead capture.*', pageWidth - margin - 14, y + 36, { align: 'right' });

      y += 66;

      // Section: Recommended Architecture Modules
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('RECOMMENDED CLOUDFLIP ARCHITECTURE MODULES', margin, y);
      y += 16;

      const activeModules = BLUEPRINTS[selectedIndustry.id] || BLUEPRINTS.trades;
      activeModules.forEach((mod, idx) => {
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 52, 4, 4, 'F');
        doc.setDrawColor(51, 65, 85);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 52, 4, 4, 'S');

        // Module Tag
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(212, 175, 55);
        doc.text(`MODULE 0${idx + 1} // [${mod.tag.toUpperCase()}]`, margin + 14, y + 16);

        // Module Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(255, 255, 255);
        doc.text(mod.title, margin + 14, y + 30);

        // Module Description
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(mod.desc, margin + 14, y + 43);

        y += 60;
      });

      y += 8;

      // Phased Execution Timeline
      doc.setFillColor(10, 14, 22);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 62, 4, 4, 'F');
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 62, 4, 4, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(212, 175, 55);
      doc.text('3-STAGE ZERO-DOWNTIME ROLLOUT TIMELINE', margin + 14, y + 18);

      const phases = [
        { phase: 'STAGE 1 (Days 1-7)', desc: 'Zero-downtime shadow capture & data schema mapping' },
        { phase: 'STAGE 2 (Days 8-14)', desc: 'Edge MCP daemon & CloudFlip dispatch deployment' },
        { phase: 'STAGE 3 (Days 15+)', desc: 'Live cutover, staff enablement & telemetry verification' }
      ];

      const pColWidth = (pageWidth - (margin * 2) - 28) / 3;
      phases.forEach((p, idx) => {
        const pX = margin + 14 + (idx * pColWidth);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text(p.phase, pX, y + 34);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(p.desc, pX, y + 46, { maxWidth: pColWidth - 8 });
      });

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Architected by MrTechSys // Austin, Texas // https://mrtechsys.com // Enterprise Systems & Edge Cloud Architecture', margin, pageHeight - 24);

      // Save PDF
      doc.save(`MrTechSys-Executive-Blueprint-${selectedIndustry.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF blueprint:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <section id="readiness-engine" className="py-24 bg-[#07090E] relative border-t border-b border-white/[0.06] overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37] font-mono text-[11px] tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            THE FLIP ENGINE &reg; · DIAGNOSTIC SUITE
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Quantify Your Operational Friction. <br />
            <span className="text-slate-400 font-light">See The Cost of Inaction &mdash; Then Make <span className="text-gold-gradient font-bold">The Flip</span>.</span>
          </h2>
          <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
            Every disconnected spreadsheet, missed phone call, and manual paper quote exerts continuous drag on your balance sheet. Select your business parameters below to compute your actual friction baseline.
          </p>
        </div>

        {/* Step Indicator HUD */}
        <div className="grid grid-cols-5 gap-2 mb-10 border-b border-white/[0.08] pb-6">
          {[
            { num: '01', label: 'Operation Today' },
            { num: '02', label: 'Friction Drag' },
            { num: '03', label: 'Cost of Inaction' },
            { num: '04', label: 'The Flip' },
            { num: '05', label: 'CloudFlip Blueprint' }
          ].map((s, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <button
                key={s.num}
                onClick={() => setStep(stepNum)}
                className={`text-left p-3 rounded transition-all border ${
                  isActive 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : isCompleted 
                    ? 'border-white/10 bg-white/[0.02] text-slate-300' 
                    : 'border-transparent text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className="font-mono text-[10px] tracking-wider uppercase mb-1 flex items-center gap-1.5">
                  <span className={isActive ? 'text-[#D4AF37] font-bold' : isCompleted ? 'text-slate-400' : 'text-slate-600'}>
                    STEP {s.num}
                  </span>
                  {isCompleted && <CheckCircle2 size={12} className="text-[#D4AF37]" />}
                </div>
                <div className="text-xs font-semibold truncate">{s.label}</div>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Main Container */}
        <div className="bg-[#0B0F17] border border-[#D4AF37]/20 rounded-xl p-6 md:p-10 shadow-2xl relative">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Operation Today */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Step 01 &mdash; Select Your Industry Vertical</h3>
                  <p className="text-sm text-slate-400">Choose the operational model that matches your day-to-day business structure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {INDUSTRIES.map((ind) => {
                    const Icon = ind.icon;
                    const isSelected = selectedIndustry.id === ind.id;
                    return (
                      <div
                        key={ind.id}
                        onClick={() => {
                          setSelectedIndustry(ind);
                          setTeamSize(ind.defaultTeam);
                        }}
                        className={`p-5 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.12)]' 
                            : 'border-white/[0.07] bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Icon size={22} className={isSelected ? 'text-[#D4AF37]' : 'text-slate-400'} />
                          {isSelected && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold">ACTIVE</span>}
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{ind.name}</h4>
                        <p className="text-xs text-slate-400">{ind.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/[0.06]">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Team Size (1 = Solo Operator, 2+ = Crew / Staff)
                    </label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value))}
                        className="w-full accent-[#D4AF37] bg-slate-800"
                      />
                      <span className="font-mono text-lg font-bold text-white w-12 text-right">{teamSize}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Estimated Monthly Revenue / Cash Flow ($USD)
                    </label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="2000" 
                        max="250000" 
                        step="1000"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                        className="w-full accent-[#D4AF37] bg-slate-800"
                      />
                      <span className="font-mono text-sm font-bold text-white w-24 text-right">
                        ${monthlyRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-bold text-xs uppercase tracking-wider rounded hover:from-[#EAB308] hover:to-[#F1C40F] transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                  >
                    Proceed to Friction Diagnostic <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Where Friction Occurs */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Step 02 &mdash; Identify Active Friction Vectors</h3>
                  <p className="text-sm text-slate-400">Select all operational pain points that currently drain resources across your business.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FRICTION_POINTS.map((friction) => {
                    const isChecked = selectedFrictions.includes(friction.id);
                    return (
                      <div
                        key={friction.id}
                        onClick={() => toggleFriction(friction.id)}
                        className={`p-4 rounded-lg border cursor-pointer flex items-start gap-4 transition-all ${
                          isChecked 
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                            : 'border-white/[0.07] bg-white/[0.01] hover:border-white/20'
                        }`}
                      >
                        <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-600'
                        }`}>
                          {isChecked && <CheckCircle2 size={12} className="text-[#07090E]" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white mb-1">{friction.label}</div>
                          <div className="text-xs text-slate-400">{friction.desc}</div>
                          <div className="mt-2 text-[10px] font-mono text-slate-500">
                            Est. Drag: ~{friction.impactHours} hrs/wk &bull; {Math.round(friction.revImpactPct * 100)}% revenue leakage risk
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                  >
                    &larr; Back to Parameters
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={selectedFrictions.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] disabled:opacity-40 text-[#07090E] font-bold text-xs uppercase tracking-wider rounded hover:from-[#EAB308] hover:to-[#F1C40F] transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                  >
                    Calculate Cost of Inaction <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Operational Cost of Inaction */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Step 03 &mdash; Estimated Annual Operational Friction</h3>
                  <p className="text-sm text-slate-400">
                    Based on your team size ({teamSize}), {selectedFrictions.length} active friction points, and annual turnover.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="p-6 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                      <Clock size={14} className="text-[#D4AF37]" />
                      ANNUAL HOURS LOST
                    </div>
                    <div className="text-3xl font-bold text-white font-mono mb-1">
                      {calculations.annualHoursLost.toLocaleString()} hrs
                    </div>
                    <div className="text-xs text-slate-500">
                      ~{calculations.totalWeeklyHoursLost} hours every single week in manual overhead.
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                      <DollarSign size={14} className="text-red-400" />
                      PAYROLL & ADMIN WASTE
                    </div>
                    <div className="text-3xl font-bold text-red-400 font-mono mb-1">
                      ${Math.round(calculations.annualWastedPayroll).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      Paid for administrative duplicate entry and phone chasing.
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                      <TrendingDown size={14} className="text-amber-400" />
                      ANNUAL REVENUE LEAKAGE
                    </div>
                    <div className="text-3xl font-bold text-amber-400 font-mono mb-1">
                      ${Math.round(calculations.annualRevenueLeakage).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      Uncaptured leads, delayed estimates, and payment friction.
                    </div>
                  </div>

                </div>

                {/* Total Cost Highlight Banner */}
                <div className="p-6 rounded-lg border border-red-500/30 bg-red-500/5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold block mb-1">
                      TOTAL OPERATIONAL DRAG (ANNUAL INACTION COST)
                    </span>
                    <p className="text-sm text-slate-300">
                      Staying on legacy fragmented tools is actively costing your business:
                    </p>
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white font-mono text-right">
                    ${Math.round(calculations.totalCostOfInaction).toLocaleString()} <span className="text-sm text-slate-400 font-normal">/yr</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                  >
                    &larr; Adjust Friction Points
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-bold text-xs uppercase tracking-wider rounded hover:from-[#EAB308] hover:to-[#F1C40F] shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
                  >
                    Initiate The Flip &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: The Cinematic Moment ("THE FLIP") */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] block mb-2 font-bold">
                    ARCHITECTURAL PARADIGM SHIFT
                  </span>
                  <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                    THE FLIP
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Transitioning your business from fragmented reactive friction to a unified, cloud-native orchestration layer.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  
                  {/* Current State Column */}
                  <div className="p-6 md:p-8 rounded-xl bg-red-950/10 border border-red-500/20 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-wider">
                        CURRENT OPERATING STATE
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-300 border border-red-500/20">
                        FRAGMENTED
                      </span>
                    </div>

                    <ul className="space-y-3.5 text-sm text-slate-300 mb-8">
                      <li className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Spreadsheet & paper data silos
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Manual back-and-forth phone dispatch
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        24-48hr quote turnaround lag
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Reactive panic during hardware/server outages
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        High CAPEX & recurring IT repair costs
                      </li>
                    </ul>

                    <div className="pt-4 border-t border-white/[0.08] text-xs font-mono text-slate-400 flex justify-between">
                      <span>ANNUAL DRAG:</span>
                      <span className="text-red-400 font-bold">${Math.round(calculations.totalCostOfInaction).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Future State Column */}
                  <div className="p-6 md:p-8 rounded-xl bg-[#D4AF37]/[0.03] border border-[#D4AF37]/35 relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.08)]">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs text-[#D4AF37] font-bold uppercase tracking-wider">
                        DIGITALLY FLIPPED · CLOUDFLIP OS
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-bold">
                        ORCHESTRATED
                      </span>
                    </div>

                    <ul className="space-y-3.5 text-sm text-slate-200 mb-8">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                        Unified real-time cloud data pipeline
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                        Autonomous 24/7 AI lead capture & dispatch
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                        Sub-second mobile photo-to-quote approvals
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                        Zero-Trust edge security & zero downtime
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                        Predictive labor telemetry & cash flow visibility
                      </li>
                    </ul>

                    <div className="pt-4 border-t border-white/[0.08] text-xs font-mono text-slate-400 flex justify-between">
                      <span>ESTIMATED ANNUAL UPLIFT*:</span>
                      <span className="text-[#D4AF37] font-bold">+${Math.round(calculations.projectedSavings).toLocaleString()} /yr</span>
                    </div>
                  </div>

                </div>

                <p className="text-[10px] text-slate-500 font-mono text-center max-w-2xl mx-auto leading-relaxed">
                  *Illustrative estimate based on small trade operational benchmarks (average solo recovery of $600–$1,200/mo in saved administrative time and captured appointments). Results vary by trade volume and adoption.
                </p>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                  >
                    &larr; Review Friction Numbers
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-bold text-xs uppercase tracking-wider rounded hover:from-[#EAB308] hover:to-[#F1C40F] transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                  >
                    Generate Custom CloudFlip Blueprint &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Digital Transformation Blueprint */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                  <div>
                    <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold block mb-1">
                      TRANSFORMATION BLUEPRINT GENERATED
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      Recommended CloudFlip Architecture for {selectedIndustry.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3.5 py-1.5 rounded bg-white/[0.03] border border-[#D4AF37]/20 font-mono text-xs text-slate-300">
                      Profile: {teamSize} staff &bull; ${monthlyRevenue.toLocaleString()}/mo
                    </div>
                    <button
                      type="button"
                      onClick={generateExecutivePDF}
                      disabled={isGeneratingPDF}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] font-mono text-xs font-semibold rounded border border-[#D4AF37]/40 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50"
                    >
                      <Download size={13} />
                      {isGeneratingPDF ? 'Compiling Blueprint...' : 'Download Executive PDF'}
                    </button>
                  </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(BLUEPRINTS[selectedIndustry.id] || BLUEPRINTS.trades).map((module, idx) => (
                    <div 
                      key={idx}
                      className="p-5 rounded-lg border border-white/[0.08] bg-white/[0.01] hover:border-[#D4AF37]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                          {module.tag}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">MODULE 0{idx + 1}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1.5">{module.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{module.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Final Call to Action Box */}
                <div className="p-6 rounded-lg bg-gradient-to-r from-[#D4AF37]/15 via-[#0B0F17] to-[#CA8A04]/15 border border-[#D4AF37]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(212,175,55,0.06)]">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">Ready to execute your transformation blueprint?</h4>
                    <p className="text-xs text-slate-300">
                      MrTechSys will map your existing data, deploy your customized CloudFlip modules, and verify live telemetry with zero operational downtime.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={generateExecutivePDF}
                      disabled={isGeneratingPDF}
                      className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-mono text-xs font-semibold rounded border border-white/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      <Download size={13} className="text-[#D4AF37]" />
                      Download Blueprint (PDF)
                    </button>
                    <Link
                      to={`/cloud-provisioner?industry=${selectedIndustry.id}&workload=web,api,database,automation,messaging`}
                      className="px-5 py-2.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] font-mono text-xs font-semibold rounded border border-[#D4AF37]/40 transition-all"
                    >
                      ⚡ Cloud Provisioner (Pre-Populated) &rarr;
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsConsultModalOpen(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold rounded shadow-[0_0_20px_rgba(212,175,55,0.3)] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Consult MrTechSys &rarr;
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-mono text-center max-w-3xl mx-auto leading-relaxed">
                  *Illustrative diagnostic estimates based on operational benchmarks for small service contractors. Results vary based on individual business volume and operational variables. Not an express guarantee of revenue or profit.
                </p>

                <div className="flex justify-start pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-mono text-slate-500 hover:text-slate-400 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} /> Reset Diagnostic Session
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

      {/* Interactive Consultation Advisory Modal */}
      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        contextTitle="Operational Diagnostic Consultation"
        selectedBuild={['web', 'api', 'automation']}
        selectedCsps={['cloudflare', 'aws']}
        diagnosticMetrics={{
          leakageHours: calculations.totalWeeklyHoursLost,
          leakageCost: Math.round(calculations.annualWastedPayroll / 12)
        }}
        source="flip_diagnostic_engine"
      />
    </section>
  );
};

export default FlipEngine;
