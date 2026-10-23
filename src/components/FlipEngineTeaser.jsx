import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sliders, DollarSign, Clock, TrendingUp, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const FlipEngineTeaser = () => {
  const [operatorMode, setOperatorMode] = useState('solo'); // 'solo' | 'crew'
  const [teamSize, setTeamSize] = useState(1);
  const [monthlySpendOrRev, setMonthlySpendOrRev] = useState(4000);

  // Dynamic, realistic calculations for solopreneurs vs small teams
  const isSolo = operatorMode === 'solo';
  
  // Realistic weekly hours lost:
  // Solo: 5-7 total hrs/wk (phone tag, evening paper invoices, dual entry)
  // Crew: scales with team size at ~2 hrs/employee
  const missedCallHours = isSolo ? 2 : Math.round(teamSize * 1.2);
  const schedulingHours = isSolo ? 2 : Math.round(teamSize * 1.0);
  const doubleEntryHours = isSolo ? 2 : Math.round(teamSize * 1.0);
  const totalWastedHoursWeek = missedCallHours + schedulingHours + doubleEntryHours;
  
  // Realistic financial calculation ($3k-5k/mo solo realistic baseline):
  // Solo captures 1-2 missed jobs/mo + reclaims ~25 hrs/mo
  const annualBase = monthlySpendOrRev * 12;
  const estimatedAnnualDrag = isSolo 
    ? Math.round(totalWastedHoursWeek * 50 * 28 + (annualBase * 0.08))
    : Math.round(teamSize * 3600 + (annualBase * 0.06));
    
  const projectedRecovery = Math.round(estimatedAnnualDrag * 0.65);

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
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all cursor-pointer"
              >
                <span>Launch 5-Step Diagnostic &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Interactive Drag Simulator (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 md:p-8 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/30 shadow-2xl relative">
              
              {/* Operator Type Selector (Solo Operator vs Small Crew) */}
              <div className="flex items-center justify-between gap-3 mb-6 p-1.5 rounded-xl bg-black/60 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    setOperatorMode('solo');
                    setTeamSize(1);
                    if (monthlySpendOrRev > 10000) setMonthlySpendOrRev(4000);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSolo
                      ? 'bg-[#D4AF37] text-[#07090E] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User size={13} />
                  <span>Solo Operator (1 Person)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOperatorMode('crew');
                    if (teamSize === 1) setTeamSize(4);
                    if (monthlySpendOrRev < 10000) setMonthlySpendOrRev(25000);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !isSolo
                      ? 'bg-[#D4AF37] text-[#07090E] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users size={13} />
                  <span>Small Crew (2–15 Staff)</span>
                </button>
              </div>

              {/* Slider Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/[0.08] mb-6">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Sliders size={12} className="text-[#D4AF37]" />
                    INTERACTIVE CAPACITY & LEAKAGE SIMULATOR
                  </span>
                  <div className="text-base font-bold text-white mt-1">
                    {isSolo ? (
                      <span>Scale: <span className="text-[#D4AF37] font-mono">Solo Owner-Operator</span></span>
                    ) : (
                      <span>Team Size: <span className="text-[#D4AF37] font-mono">{teamSize} Field Techs / Staff</span></span>
                    )}
                  </div>
                </div>
                <div className="px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 font-mono text-xs text-red-400 font-bold self-start sm:self-auto">
                  EST. DRAG: -${estimatedAnnualDrag.toLocaleString()}/yr
                </div>
              </div>

              {/* Interactive Range Slider */}
              <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                {isSolo ? (
                  <>
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                      <span>$2,000/mo</span>
                      <span className="text-[#D4AF37] font-bold">Monthly Revenue / Cash Flow ($USD)</span>
                      <span>$10,000/mo</span>
                    </div>
                    <input
                      type="range"
                      min="2000"
                      max="10000"
                      step="500"
                      value={monthlySpendOrRev}
                      onChange={(e) => setMonthlySpendOrRev(Number(e.target.value))}
                      className="w-full accent-[#D4AF37] h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="text-right font-mono text-xs text-[#D4AF37] mt-1 font-bold">
                      ${monthlySpendOrRev.toLocaleString()} / month (~${(monthlySpendOrRev * 12).toLocaleString()}/yr)
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                      <span>2 Techs</span>
                      <span className="text-[#D4AF37] font-bold">Slide to adjust team size</span>
                      <span>15 Techs</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="15"
                      value={teamSize}
                      onChange={(e) => setTeamSize(Number(e.target.value))}
                      className="w-full accent-[#D4AF37] h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </>
                )}
              </div>

              {/* Dynamic Wasted Hours Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400 block mb-1">{isSolo ? 'Unanswered Calls' : 'Missed Inbound Calls'}</span>
                  <span className="font-mono text-white font-bold text-sm">~{missedCallHours} hrs/wk</span>
                </div>
                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400 block mb-1">{isSolo ? 'Paper Invoicing' : 'Manual Routing'}</span>
                  <span className="font-mono text-white font-bold text-sm">~{schedulingHours} hrs/wk</span>
                </div>
                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400 block mb-1">{isSolo ? 'Phone Tag' : 'Double Data Entry'}</span>
                  <span className="font-mono text-white font-bold text-sm">~{doubleEntryHours} hrs/wk</span>
                </div>
              </div>

              {/* Recovery Banner */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 to-[#CA8A04]/10 border border-[#D4AF37]/35 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
                <div>
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase block font-bold">
                    ESTIMATED POTENTIAL RECOVERY*
                  </span>
                  <span className="text-sm font-bold text-white">
                    Reclaim ~{totalWastedHoursWeek} hrs/week &amp; Uncaptured Business
                  </span>
                </div>
                <div className="text-right self-end sm:self-auto">
                  <span className="text-2xl md:text-3xl font-bold font-mono text-[#D4AF37]">
                    +${projectedRecovery.toLocaleString()}
                  </span>
                  <span className="block text-[10px] font-mono text-emerald-400 font-semibold">
                    Estimated Annual Uplift*
                  </span>
                </div>
              </div>

              {/* Safe Harbor FTC Footnote */}
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-mono">
                *Illustrative estimate based on small trade operational benchmarks (average solo recovery of $600–$1,200/mo in saved administrative time and captured appointments). Results vary by trade volume and adoption.
              </p>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FlipEngineTeaser;
