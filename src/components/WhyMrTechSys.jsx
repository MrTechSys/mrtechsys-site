import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Gauge, Cpu, Cloud, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PIPELINE_STAGES = [
  {
    step: '01',
    label: 'DIAGNOSE',
    title: 'Technology Health Audit',
    metric: '10-Dimension Rubric',
    desc: 'Audits your security posture, software sprawl, single-computer risks, and cash flow leaks in plain English.',
    icon: Gauge,
    cta: 'Start 10-Point Assessment &rarr;',
    link: '/assessment',
    bullets: ['Deterministic 0–100 score', 'NOW / NEXT / LATER roadmap', 'Zero IT jargon or sales pitch']
  },
  {
    step: '02',
    label: 'CONNECT',
    title: 'Systems & Workflow Integration',
    metric: 'Zero Drag Ops',
    desc: 'Connects your inquiry forms, calendars, and customer data to eliminate dual data entry and telephone tag.',
    icon: Cpu,
    cta: 'Calculate Payroll Drag &rarr;',
    link: '/diagnostic',
    bullets: ['Eliminate dual data entry', 'Connected customer flow', 'Works alongside QuickBooks']
  },
  {
    step: '03',
    label: 'SCALE',
    title: 'Unbiased Multi-Cloud Infrastructure',
    metric: 'Zero Vendor Lock-In',
    desc: 'Architects your footprint across Cloudflare, AWS, Azure, and GCP using permanent zero-dollar free tiers and strict budget alarms.',
    icon: Cloud,
    cta: 'Explore Cloud Provisioner &rarr;',
    link: '/cloud-provisioner',
    bullets: ['Cloudflare Edge & AWS Lambda', 'Azure M365 & GCP Data', '$0 hard budget tripwires']
  }
];

const WhyMrTechSys = () => {
  return (
    <section id="why" className="py-20 md:py-28 border-t border-b border-white/[0.06] bg-[#07090E]/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37] font-mono text-[11px] tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            01 · ADVISORY METHODOLOGY &bull; THE 3-STAGE TRANSFORMATION
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Practical Engineering for Businesses <br />
            <span className="text-gold-gradient">Without an IT Department</span>.
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Most IT providers sell confusing monthly maintenance tickets. MrTechSys delivers an objective, 3-stage transformation framework designed for small business realities.
          </p>
        </div>

        {/* 3 Interactive Pipeline Cards with Flow Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative">
          
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.step}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`p-7 rounded-2xl bg-[#0B0F17] border flex flex-col justify-between relative group transition-all ${
                  idx === 1 
                    ? 'border-[#D4AF37]/40 bg-[#D4AF37]/[0.03] shadow-[0_0_35px_rgba(212,175,55,0.08)]' 
                    : 'border-white/[0.08] hover:border-[#D4AF37]/40'
                }`}
              >
                <div>
                  {/* Top Stage Header */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono text-[#D4AF37] font-bold tracking-widest px-2.5 py-1 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      STAGE {stage.step} &bull; {stage.label}
                    </span>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[#D4AF37] group-hover:scale-110 transition-transform">
                      <Icon size={18} />
                    </div>
                  </div>

                  {/* Title & Metric */}
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                      {stage.title}
                    </h3>
                    <div className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                      {stage.metric}
                    </div>
                  </div>

                  {/* Concise Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-5">
                    {stage.desc}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 mb-6 pt-2 border-t border-white/[0.05]">
                    {stage.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={13} className="text-[#D4AF37] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA */}
                {stage.link.startsWith('#') ? (
                  <a 
                    href={stage.link}
                    className="text-xs font-mono text-[#D4AF37] flex items-center gap-1.5 hover:underline font-bold pt-4 border-t border-white/[0.05]"
                    dangerouslySetInnerHTML={{ __html: stage.cta }}
                  />
                ) : (
                  <Link 
                    to={stage.link}
                    className="text-xs font-mono text-[#D4AF37] flex items-center gap-1.5 hover:underline font-bold pt-4 border-t border-white/[0.05]"
                    dangerouslySetInnerHTML={{ __html: stage.cta }}
                  />
                )}
              </motion.div>
            );
          })}

        </div>

        {/* View Full Architecture Link */}
        <div className="p-6 rounded-xl bg-white/[0.02] border border-[#D4AF37]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-300 font-mono">
            Want to see how your tech stack connects without disrupting operations?
          </div>
          <Link 
            to="/about/mrtechsys"
            className="px-5 py-2.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] font-mono text-xs font-bold rounded-lg border border-[#D4AF37]/40 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Explore 22-Year Architecture &amp; Mission</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default WhyMrTechSys;
