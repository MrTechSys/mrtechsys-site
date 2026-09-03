import React from 'react';
import { Cpu, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FoundryTech = () => {
  return (
    <section id="foundry" className="py-24 bg-[#07090E] relative border-b border-white/[0.06] overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37] font-mono text-[11px] tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            05 · CORE INTELLIGENCE &amp; RESILIENT FOUNDRY
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            The Engine Behind The Flip. <br />
            <span className="text-gold-gradient font-bold">TOL-Core AI Runtime &amp; Zero-Trust Edge Mesh.</span>
          </h2>
          <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
            Enterprise software breaks down for SMBs when it requires manual supervision. The MrTechSys Foundry combines deterministic AI logic with sub-second Cloudflare edge distribution &mdash; ensuring automated, highly available operations.
          </p>
        </div>

        {/* 3 Core Foundry Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="p-8 rounded-xl bg-[#0B0F17] border border-white/[0.08] hover:border-[#D4AF37]/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-6">
              <Cpu size={20} />
            </div>
            <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider block mb-1 font-semibold">DETERMINISTIC AI</span>
            <h3 className="text-xl font-bold text-white mb-3">TOL-Core Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminates LLM hallucinations for operational SMB workflows. Executes rules-based decision trees, automated voice triage, and financial validation with 100% auditability.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[#0B0F17] border border-white/[0.08] hover:border-[#D4AF37]/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#EAB308]/10 border border-[#EAB308]/30 flex items-center justify-center text-[#EAB308] mb-6">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[10px] font-mono text-[#EAB308] uppercase tracking-wider block mb-1 font-semibold">EDGE SECURITY</span>
            <h3 className="text-xl font-bold text-white mb-3">Zero-Trust Cloud Mesh</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every request is authenticated at 300+ edge data centers. Client PII, job estimates, and financial transactions never travel unencrypted over legacy public pipes.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[#0B0F17] border border-white/[0.08] hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
              <Zap size={20} />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1 font-semibold">CONTINUOUS RESILIENCE</span>
            <h3 className="text-xl font-bold text-white mb-3">Multi-Cloud Failover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated multi-region routing across AWS, Google Cloud, and Azure. If any single hyper-scaler experiences downtime, your business operations shift traffic seamlessly.
            </p>
          </div>

        </div>

        {/* Deep Tech Terminal Preview & Risk Analyzer Link */}
        <div className="p-8 rounded-xl bg-[#0B0F17] border border-[#D4AF37]/25 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-[10px]">
              OPERATIONAL COMPLIANCE &bull; RISK ENGINE
            </div>
            <h4 className="text-lg font-bold text-white">Looking for automated operational risk analysis?</h4>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Run our deep-tier Auto-Risk-Analyzer module to audit your business infrastructure against data loss, compliance gaps, and single points of hardware failure.
            </p>
          </div>
          <Link
            to="/risk"
            className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded transition-all shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center gap-2"
          >
            <span>Launch Risk Analyzer</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FoundryTech;
