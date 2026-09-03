import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sliders, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const FlipEngineTeaser = () => {
  const [teamSize, setTeamSize] = useState(8);

  // Dynamic calculations based on team size
  const missedCallHours = Math.round(teamSize * 1.5);
  const schedulingHours = Math.round(teamSize * 1.75);
  const doubleEntryHours = Math.round(teamSize * 2.0);
  const totalWastedHoursWeek = missedCallHours + schedulingHours + doubleEntryHours;
  
  const estimatedAnnualDrag = Math.round(teamSize * 8025);
  const projectedRecovery = Math.round(estimatedAnnualDrag * 0.68);

  return (
    <section id="readiness-teaser" className="py-20 md:py-28 relative overflow-hidden bg-[#07090E]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Narrative (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37] font-mono text-[11px] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              02 · THE FLIP ENGINE &reg;
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Quantify Your Drag. <br />
              <span className="text-slate-400 font-light">See The Cost of Inaction &mdash; Then Make <span className="text-gold-gradient font-bold">The Flip</span>.</span>
            </h2>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Every disconnected spreadsheet and missed customer phone call exerts continuous drag on your balance sheet. Drag the slider to see how much operational capacity your business can recover.
            </p>

            <div className="pt-2">
              <Link
                to="/diagnostic"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all cursor-pointer"
              >
                <span>Launch 5-Step Diagnostic &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Interactive Drag Simulator (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 md:p-8 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/30 shadow-2xl relative">
              
              {/* Slider Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/[0.08] mb-6">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Sliders size={12} className="text-[#D4AF37]" />
                    INTERACTIVE PAYROLL LEAKAGE SIMULATOR
                  </span>
                  <div className="text-base font-bold text-white mt-1">
                    Team Size: <span className="text-[#D4AF37] font-mono">{teamSize} Field Techs / Staff</span>
                  </div>
                </div>
                <div className="px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 font-mono text-xs text-red-400 font-bold self-start sm:self-auto">
                  EST. DRAG: -${estimatedAnnualDrag.toLocaleString()}/yr
                </div>
              </div>

              {/* Interactive Range Slider */}
              <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>1 Employee</span>
                  <span className="text-[#D4AF37] font-bold">Slide to adjust team size</span>
                  <span>25 Employees</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Dynamic Wasted Hours Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400 block mb-1">Missed Calls</span>
                  <span className="font-mono text-white font-bold text-sm">~{missedCallHours} hrs/wk</span>
                </div>
                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400 block mb-1">Manual Routing</span>
                  <span className="font-mono text-white font-bold text-sm">~{schedulingHours} hrs/wk</span>
                </div>
                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400 block mb-1">Double Entry</span>
                  <span className="font-mono text-white font-bold text-sm">~{doubleEntryHours} hrs/wk</span>
                </div>
              </div>

              {/* Recovery Banner */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 to-[#CA8A04]/10 border border-[#D4AF37]/35 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
                <div>
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase block font-bold">
                    THE CLOUDFLIP PROJECTION
                  </span>
                  <span className="text-sm font-bold text-white">
                    Recover ~{totalWastedHoursWeek} hours/wk &amp; Reclaim Payroll
                  </span>
                </div>
                <div className="text-right self-end sm:self-auto">
                  <span className="text-2xl md:text-3xl font-bold font-mono text-[#D4AF37]">
                    +${projectedRecovery.toLocaleString()}
                  </span>
                  <span className="block text-[10px] font-mono text-emerald-400 font-semibold">
                    Recovered Cashflow/yr
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FlipEngineTeaser;
