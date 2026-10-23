import React, { useEffect, useRef } from 'react';
import { ArrowRight, ChevronRight, Shield, Zap, Sparkles, Layers, Cpu, Compass, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import WhyMrTechSys from '../components/WhyMrTechSys';
import FlipEngineTeaser from '../components/FlipEngineTeaser';
import VerticalFabric from '../components/VerticalFabric';
import TelemetryProof from '../components/TelemetryProof';
import OriginMission from '../components/OriginMission';

/**
 * Home: Flagship Fortune 500 AI Consultancy OS & Interactive Story Simulator
 * Aesthetic: Deep Black (#05070A), Metallic Gold (#D4AF37), Amber (#F59E0B), Yellow (#FDE047), White (#FFFFFF)
 * Architecture:
 * - Act 1: Living Hero with Interactive Architecture Toggle (Fragmented State vs MrTechSys Flip)
 * - Act 2: Interactive 3-Stage Pipeline (Diagnose • Connect • Scale)
 * - Act 3: Interactive Payroll Leakage Simulator (Drag Slider Computing Real-Time Savings)
 * - Act 4: The 4 Core Architectural Pillars (Strategy, Automation, Intelligence, Integration)
 * - Act 5: Interactive Vertical Fabric & Device Simulators (Trades, JobNetwork, Commercial, Food KDS)
 * - Act 6: Verifiable Telemetry Proof (Dynamic SVG Graph + Metrics HUD)
 * - Act 7: 6-Discipline Operational Architecture Bento Grid
 * - Act 8: Strategic Origin & 22-Year Perspective
 * - Act 9: Executive Gateway & Strategy Booking
 */
const Home = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full text-white relative z-10 selection:bg-[#D4AF37]/30 selection:text-white">
      
      {/* ─────────────────────────────────────────────────────────────
          ACT 1: LIVING HERO WITH INTERACTIVE BEFORE / AFTER STATE TOGGLE
      ────────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ─────────────────────────────────────────────────────────────
          ACT 2: INTERACTIVE 3-STAGE TRANSFORMATION PIPELINE
      ────────────────────────────────────────────────────────────── */}
      <WhyMrTechSys />

      {/* ─────────────────────────────────────────────────────────────
          ACT 3: THE FLIP ENGINE & LIVE INTERACTIVE PAYROLL LEAKAGE SLIDER
      ────────────────────────────────────────────────────────────── */}
      <FlipEngineTeaser />

      {/* ─────────────────────────────────────────────────────────────
          ACT 4: THE 4 CORE PILLARS (STRATEGY, AUTOMATION, INTELLIGENCE, INTEGRATION)
      ────────────────────────────────────────────────────────────── */}
      <section id="pillars" className="py-24 px-6 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <span className="font-mono text-xs text-[#D4AF37] uppercase tracking-widest font-semibold block mb-2">
            FOUNDATIONAL DOCTRINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Four pillars, engineered into one continuous system.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pillar 1: STRATEGY */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 transition-all reveal-left relative group shadow-xl">
            <div className="border-l-2 border-amber-500 pl-3 mb-4">
              <span className="font-mono text-xs text-amber-400 font-semibold tracking-widest uppercase block">
                01 · STRATEGY
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gold-gradient mb-3">
              Direction before code.
            </h3>
            <p className="text-sm sm:text-base text-white font-light leading-relaxed">
              Every build starts from the commercial outcome, not the tool. Technology serves business physics, never the inverse.
            </p>
          </div>

          {/* Pillar 2: AUTOMATION */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 transition-all reveal-right relative group shadow-xl">
            <div className="border-l-2 border-amber-500 pl-3 mb-4">
              <span className="font-mono text-xs text-amber-400 font-semibold tracking-widest uppercase block">
                02 · AUTOMATION
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gold-gradient mb-3">
              Work removed, not rearranged.
            </h3>
            <p className="text-sm sm:text-base text-white font-light leading-relaxed">
              Automations that eliminate steps instead of moving them. Replacing brittle manual handoffs with deterministic pipelines.
            </p>
          </div>

          {/* Pillar 3: INTELLIGENCE */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 transition-all reveal-left relative group shadow-xl">
            <div className="mb-2">
              <span className="font-mono text-xs text-[#D4AF37] font-semibold tracking-widest uppercase block">
                03 · INTELLIGENCE
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gold-gradient mb-2">
              Decisions, informed in real time.
            </h3>
            <div className="w-16 h-[1px] bg-gradient-to-r from-[#D4AF37] to-amber-500 mb-4"></div>
            <p className="text-sm sm:text-base text-white font-light leading-relaxed">
              Signals surfaced where the decision actually happens. Real-time operational telemetry grounding human judgment.
            </p>
          </div>

          {/* Pillar 4: INTEGRATION */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 transition-all reveal-right relative group shadow-xl">
            <div className="mb-2">
              <span className="font-mono text-xs text-[#D4AF37] font-semibold tracking-widest uppercase block">
                04 · INTEGRATION
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gold-gradient mb-3">
              Connected across the fabric.
            </h3>
            <p className="text-sm sm:text-base text-white font-light leading-relaxed">
              <strong className="text-amber-400 font-medium">One architecture, not many tools</strong> &mdash; every system speaking the same language, by design.
            </p>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          ACT 5: INTERACTIVE VERTICAL FABRIC & SIMULATED DEVICE WORKFLOWS
      ────────────────────────────────────────────────────────────── */}
      <VerticalFabric />

      {/* ─────────────────────────────────────────────────────────────
          ACT 6: VERIFIABLE TELEMETRY (DYNAMIC HUD & VALUE PROOF)
      ────────────────────────────────────────────────────────────── */}
      <TelemetryProof />

      {/* ─────────────────────────────────────────────────────────────
          ACT 7: THE 6 DISCIPLINES (BENTO GRID)
      ────────────────────────────────────────────────────────────── */}
      <section id="disciplines" className="py-28 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center reveal">
          <span className="font-mono text-xs text-[#D4AF37] uppercase tracking-widest font-semibold block mb-2">
            OPERATIONAL ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Six disciplines, engineered as one.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Advisory', sub: 'AI strategy aligned directly to balance sheet outcomes.', badge: 'Strategy' },
            { title: 'Automation', sub: 'Workflows engineered for continuous operational reliability.', badge: 'Runtime' },
            { title: 'Intelligence', sub: 'Decisions grounded in real-time verified data.', badge: 'Telemetry' },
            { title: 'Integration', sub: 'Every edge system united under one architecture.', badge: 'Mesh' },
            { title: 'Execution', sub: 'Precision software delivery without scope or time drift.', badge: 'Delivery' },
            { title: 'Governance', sub: 'Zero-trust enterprise guardrails built in, not bolted on.', badge: 'Security' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all flex flex-col justify-between group hover:-translate-y-1 shadow-lg relative overflow-hidden reveal"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-mono text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                  {item.badge}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 group-hover:bg-amber-400 group-hover:scale-125 transition-all"></span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white group-hover:text-gold-gradient transition-colors mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          ACT 8: STRATEGIC ORIGIN & MISSION
      ────────────────────────────────────────────────────────────── */}
      <OriginMission />

      {/* ─────────────────────────────────────────────────────────────
          ACT 9: THE EXECUTIVE GATEWAY (CLOUDFLIP & ADVISORY)
      ────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0B0F17] to-[#05070A] border border-[#D4AF37]/35 text-center shadow-2xl relative overflow-hidden reveal">
          <span className="font-mono text-xs text-[#D4AF37] uppercase tracking-widest font-bold block mb-3">
            THE PLATFORM GATEWAY
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Transform your systems into an <br />
            <span className="text-gold-gradient">autonomous engine</span>.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Deploy CloudFlip for immediate operational flow, or engage MrTechSys for private 1-on-1 architecture design.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('mrtechsys-open-booking', { detail: { service: 'General Advisory' } }))}
              className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#05070A] font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_24px_rgba(212,175,55,0.35)] transition-all cursor-pointer"
            >
              Book Strategy Session &rarr;
            </button>
            <a
              href="https://cloudflip.mrtechsys.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-4 bg-white/[0.04] hover:bg-white/[0.08] text-white font-mono text-xs font-semibold uppercase tracking-wider rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all"
            >
              Launch CloudFlip Platform ↗
            </a>
            <Link
              to="/assessment"
              className="px-6 py-4 text-slate-400 hover:text-[#D4AF37] font-mono text-xs tracking-wider transition-colors"
            >
              Run Diagnostic Assessment
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
