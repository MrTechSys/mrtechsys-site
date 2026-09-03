import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Zap, CheckCircle2, AlertTriangle, Layers, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [activeMode, setActiveMode] = useState('after'); // 'before' | 'after'

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
      {/* Dynamic Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-[#D4AF37]/[0.035] rounded-full blur-[140px] pointer-events-none"></div>

      {/* Subtle Texas Logo Watermark */}
      <div className="absolute right-0 top-1/3 -translate-y-1/2 w-[350px] md:w-[500px] opacity-[0.03] pointer-events-none select-none">
        <img src="/logo.png" alt="" className="w-full h-auto object-contain" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-10 md:mb-14"
        >
          {/* Executive Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-mono mb-6 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            ENTERPRISE ARCHITECTURE · TEXAS-ROOTED SIMPLICITY
          </div>

          {/* Punchy Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-5">
            Your Business Has Evolved. <br />
            <span className="text-gold-gradient">Your Technology Should Too.</span>
          </h1>

          {/* Micro-Narrative (Trimmed 70% for effortless scanning) */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate software fragmentation. MrTechSys connects what works, automates what shouldn’t be manual, and deploys your cloud footprint &mdash; <strong className="text-white">free first, scale smart</strong>.
          </p>
        </motion.div>

        {/* INTERACTIVE SCROLLYTELLING COMPONENT: Before vs After Operations Mesh */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-4xl mx-auto mb-14"
        >
          <div className="p-1 rounded-2xl bg-gradient-to-b from-[#D4AF37]/30 via-white/[0.08] to-transparent shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="p-6 md:p-8 rounded-2xl bg-[#07090E] border border-white/[0.05]">
              
              {/* Interactive Mode Switcher Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
                    LIVE ARCHITECTURE COMPARISON:
                  </span>
                </div>

                <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/[0.08] self-start sm:self-auto">
                  <button
                    onClick={() => setActiveMode('before')}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeMode === 'before'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle size={13} />
                    <span>Fragmented State (Before)</span>
                  </button>
                  <button
                    onClick={() => setActiveMode('after')}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeMode === 'after'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>The MrTechSys Flip (After)</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Animated Matrix */}
              <div className="pt-6">
                <AnimatePresence mode="wait">
                  {activeMode === 'before' ? (
                    <motion.div
                      key="before"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="p-5 rounded-xl bg-red-950/20 border border-red-500/25 space-y-2">
                        <div className="flex items-center justify-between text-xs text-red-400 font-mono font-bold">
                          <span>INBOUND DISPATCH</span>
                          <span className="px-2 py-0.5 rounded bg-red-500/15">DRAG: HIGH</span>
                        </div>
                        <h4 className="text-white font-bold text-sm">Missed Calls to Voicemail</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Technicians are on roofs or driving. Customer calls ring out and dial the competitor down the street.
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-red-950/20 border border-red-500/25 space-y-2">
                        <div className="flex items-center justify-between text-xs text-red-400 font-mono font-bold">
                          <span>INVOICING &amp; QUOTES</span>
                          <span className="px-2 py-0.5 rounded bg-red-500/15">14 DAYS LATE</span>
                        </div>
                        <h4 className="text-white font-bold text-sm">Paper &amp; Spreadsheet Drag</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Handwritten job tickets typed into QuickBooks at midnight. Payments delayed by net-30 paper checks.
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-red-950/20 border border-red-500/25 space-y-2">
                        <div className="flex items-center justify-between text-xs text-red-400 font-mono font-bold">
                          <span>INFRASTRUCTURE</span>
                          <span className="px-2 py-0.5 rounded bg-red-500/15">FRAGILE</span>
                        </div>
                        <h4 className="text-white font-bold text-sm">Local Server &amp; App Fatigue</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          7 single-feature SaaS subscriptions that don't talk to each other. Constant fear of hardware crashes.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="after"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="p-5 rounded-xl bg-[#D4AF37]/[0.06] border border-[#D4AF37]/40 space-y-2 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
                        <div className="flex items-center justify-between text-xs text-[#D4AF37] font-mono font-bold">
                          <span>AUTONOMOUS DISPATCH</span>
                          <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">24/7 ACTIVE</span>
                        </div>
                        <h4 className="text-white font-bold text-sm">Zero-Loss Voice &amp; Lead AI</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Calls answered instantly. Auto-books into technician calendar with SMS ETA alerts to homeowner.
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-[#D4AF37]/[0.06] border border-[#D4AF37]/40 space-y-2 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
                        <div className="flex items-center justify-between text-xs text-[#D4AF37] font-mono font-bold">
                          <span>DRIVEWAY TAP-TO-PAY</span>
                          <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">12 SECONDS</span>
                        </div>
                        <h4 className="text-white font-bold text-sm">Photo-to-Quote Approval</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Tech snaps photo on mobile; customer signs and taps credit card in driveway. Cash in bank same day.
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-[#D4AF37]/[0.06] border border-[#D4AF37]/40 space-y-2 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
                        <div className="flex items-center justify-between text-xs text-[#D4AF37] font-mono font-bold">
                          <span>CLOUD FOOTPRINT</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">$0.00 / MO</span>
                        </div>
                        <h4 className="text-white font-bold text-sm">Multi-Cloud Mesh Architecture</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Built on permanent zero-cost developer allocations across Cloudflare + AWS with hard budget safety caps.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </motion.div>

        {/* High-Impact Visual CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-center">
          <Link 
            to="/cloud-provisioner"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Zap size={15} className="fill-[#07090E]" />
            <span>Build Your Cloud Footprint (Free First) &rarr;</span>
          </Link>

          <Link 
            to="/diagnostic"
            className="inline-flex items-center gap-2 px-7 py-4 bg-white/[0.04] hover:bg-white/[0.08] text-white font-mono text-xs font-semibold uppercase tracking-wider rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all cursor-pointer"
          >
            <span>The Flip Engine Diagnostic</span>
          </Link>

          <a 
            href="#cloudflip"
            className="inline-flex items-center gap-1.5 px-5 py-4 text-slate-400 hover:text-[#D4AF37] font-mono text-xs tracking-wider transition-colors"
          >
            Explore Live Workflows <ChevronRight size={14} />
          </a>
        </div>

        {/* Live Metrics Telemetry HUD */}
        <div className="mt-14 pt-8 border-t border-white/[0.07] grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 text-slate-400 font-mono text-xs text-center">
          <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.04]">
            <span className="text-slate-500 block text-[10px] uppercase">STARTING COST</span>
            <span className="text-emerald-400 font-bold text-sm">$0.00 Free Tier</span>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.04]">
            <span className="text-slate-500 block text-[10px] uppercase">QUOTE SPEED</span>
            <span className="text-[#D4AF37] font-bold text-sm">3.4x Faster</span>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.04]">
            <span className="text-slate-500 block text-[10px] uppercase">DEPLOYMENT MESH</span>
            <span className="text-white font-bold text-sm">Cloudflare + AWS</span>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.04]">
            <span className="text-slate-500 block text-[10px] uppercase">LEAD RECOVERY</span>
            <span className="text-white font-bold text-sm">100% Captured</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
