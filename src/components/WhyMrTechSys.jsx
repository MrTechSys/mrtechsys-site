import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Gauge, Cpu, Cloud, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PIPELINE_STAGES = [
  {
    step: '01',
    label: 'DIAGNOSE',
    title: 'Tech Health Assessment',
    metric: 'Health Score 0–100',
    desc: 'Evaluates 10 business dimensions in plain English to pinpoint security gaps, software waste, and lost revenue.',
    icon: Gauge,
    cta: 'Start 10-Point Assessment &rarr;',
    link: '/assessment',
    bullets: ['Deterministic 0–100 score', 'NOW/NEXT/LATER roadmap', 'Zero IT jargon required']
  },
  {
    step: '02',
    label: 'CONNECT',
    title: 'CloudFlip OS',
    metric: 'Unified Hub',
    desc: 'Unifies phone dispatch, mobile photo-to-quote, and tap-to-pay without changing your accounting.',
    icon: Cpu,
    cta: 'Explore Platform &rarr;',
    link: '#cloudflip',
    bullets: ['24/7 AI Voice Dispatch', 'Driveway Tap-to-Pay', 'Zero app switching']
  },
  {
    step: '03',
    label: 'SCALE',
    title: 'Zero-Dollar Cloud',
    metric: '$0/mo Primitives',
    desc: 'Deploys your modern cloud footprint on Cloudflare + AWS free tiers with $0 hard budget tripwires.',
    icon: Cloud,
    cta: 'Build Cloud Footprint &rarr;',
    link: '/cloud-provisioner',
    bullets: ['Cloudflare Edge Global Speed', 'AWS Serverless Lambda', 'Zero surprise bills']
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
            01 · THE 3-STAGE TRANSFORMATION
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            From Fragmented Chaos to <span className="text-gold-gradient">Connected Cloud</span>.
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Most IT companies sell isolated software tickets. MrTechSys delivers a complete 3-step operational continuum.
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
