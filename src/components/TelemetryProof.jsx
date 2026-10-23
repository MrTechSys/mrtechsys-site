import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, TrendingUp, ShieldCheck, Database, Layers, ArrowUpRight, Cpu } from 'lucide-react';

const TELEMETRY_SCENARIOS = [
  {
    id: 'velocity',
    title: 'Cycle Velocity & Throughput',
    badge: 'Operational Velocity',
    subtitle: 'Decision-to-edge execution latency across decentralized teams',
    primaryMetric: '4.8x',
    metricLabel: 'Faster Release Cycles',
    subMetrics: [
      { label: 'Edge Propagation', value: '14ms', change: '-92% vs Legacy' },
      { label: 'CI/CD Pipeline Run', value: '42s', change: 'Deterministic' },
      { label: 'Incident MTTR', value: '< 4 min', change: 'Auto-Healing' }
    ],
    pathData: 'M10,190 C 80,185 140,165 210,120 C 290,75 380,110 460,60 C 530,20 600,45 690,14',
    fillGradient: ['#D4AF37', '#F59E0B', '#FDE047'],
    nodes: [
      { cx: 210, cy: 120, label: 'Audit Passed (0.2s)' },
      { cx: 460, cy: 60, label: 'Zero-Downtime Rollout' },
      { cx: 690, cy: 14, label: 'Edge Verified' }
    ],
    details: 'Replaces fractured developer pipelines with unified edge-routed deployments. Code commits propagate through multi-cloud free-tier instances in milliseconds with cryptographic verification.'
  },
  {
    id: 'cost',
    title: 'Cloud Cost-to-Serve Optimization',
    badge: 'Spend Tripwires',
    subtitle: 'Free-tier optimization across Cloudflare, AWS, Azure, & GCP',
    primaryMetric: '$0 / mo',
    metricLabel: 'Base Infrastructure Tier',
    subMetrics: [
      { label: 'Cloudflare Pages & Workers', value: '100k req/day', change: 'Free Tier' },
      { label: 'AWS Lambda Compute', value: '1M req/mo', change: 'Always-Free' },
      { label: 'Hard Budget Alarms', value: '$10.00', change: 'Strict Tripwires' }
    ],
    pathData: 'M10,35 C 100,45 180,60 260,110 C 340,155 430,170 520,185 C 600,195 650,200 690,205',
    fillGradient: ['#10B981', '#059669', '#34D399'],
    nodes: [
      { cx: 10, cy: 35, label: 'Legacy Bill: $1,480/mo' },
      { cx: 260, cy: 110, label: 'Workloads Isolated' },
      { cx: 690, cy: 205, label: 'Spend Floor: $0' }
    ],
    details: 'Enforces architectural budget tripwires. Rather than paying unbounded multi-tenant SaaS fees, your core infrastructure runs on permanent cloud zero-dollar primitives with deterministic cost ceilings.'
  },
  {
    id: 'conversion',
    title: 'Lead Capture & Cash Conversion',
    badge: 'Revenue Continuity',
    subtitle: 'Zero-loss inbound dispatch and driveway tap-to-pay settlement',
    primaryMetric: '99.8%',
    metricLabel: 'Dispatch Capture Rate',
    subMetrics: [
      { label: 'First-Ring AI Answer', value: '< 2.1s', change: 'Zero Missed Calls' },
      { label: 'SMS Quote Acceptance', value: '4.2 min', change: 'Instant Approval' },
      { label: 'Payment Settlement', value: 'Immediate', change: 'Stripe Connect' }
    ],
    pathData: 'M10,175 C 90,165 170,140 240,115 C 330,85 410,65 500,40 C 580,20 640,28 690,10',
    fillGradient: ['#F59E0B', '#D4AF37', '#FDE047'],
    nodes: [
      { cx: 10, cy: 175, label: 'Inquiry Triggered' },
      { cx: 240, cy: 115, label: 'AI Dispatched' },
      { cx: 690, cy: 10, label: 'Driveway Settlement' }
    ],
    details: 'Closes the loop between customer inquiry and revenue settlement. Inbound calls are converted to work orders immediately, quotes are dispatched by SMS, and payments hit the ledger in real-time.'
  },
  {
    id: 'integrity',
    title: 'Zero-Trust Security & Ownership',
    badge: 'Security Posture',
    subtitle: 'Enterprise sovereign tenancy with zero vendor lock-in',
    primaryMetric: '100%',
    metricLabel: 'Asset Tenancy',
    subMetrics: [
      { label: 'IAM Edge Keys', value: 'Zero-Trust', change: 'Hardware Enforced' },
      { label: 'Data Egress Lock', value: 'Encrypted', change: 'Customer Owned' },
      { label: 'Audit Trail', value: 'Immutable', change: 'Full Provenance' }
    ],
    pathData: 'M10,130 C 110,128 200,90 300,85 C 400,80 500,50 590,45 C 640,42 670,30 690,25',
    fillGradient: ['#D4AF37', '#60A5FA', '#93C5FD'],
    nodes: [
      { cx: 10, cy: 130, label: 'Zero-Trust Perimeter' },
      { cx: 300, cy: 85, label: 'Identity Attested' },
      { cx: 690, cy: 25, label: 'Sovereignty Intact' }
    ],
    details: 'You retain complete ownership of code, databases, customer vaults, and domain records. No opaque proprietary black boxes or vendor capture lockouts.'
  }
];

const TelemetryProof = () => {
  const [activeScenario, setActiveScenario] = useState(TELEMETRY_SCENARIOS[0]);

  return (
    <section id="proof" className="py-24 md:py-32 px-6 max-w-6xl mx-auto text-center relative">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D4AF37]/[0.025] blur-[130px] pointer-events-none"></div>

      <div className="reveal space-y-8 relative z-10">
        
        {/* Section Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37] font-mono text-[11px] tracking-wider uppercase mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
          VERIFIABLE TELEMETRY &bull; PROOF OF CLARITY
        </div>

        {/* Section Headline */}
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Verifiable Metrics. <br />
            <span className="text-gold-gradient">Operational Physics, Not Promises.</span>
          </h2>
          <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-xl mx-auto">
            Interact with live operational telemetry across throughput, cost floors, capture speed, and zero-trust ownership.
          </p>
        </div>

        {/* Interactive Scenario Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-3xl mx-auto">
          {TELEMETRY_SCENARIOS.map((scenario) => {
            const isActive = activeScenario.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => setActiveScenario(scenario)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                    : 'bg-[#0B0F17] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.2]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#D4AF37]' : 'bg-slate-600'}`}></span>
                <span>{scenario.title.split(' ')[0]} {scenario.title.split(' ')[1]}</span>
                <span className="text-[10px] opacity-60 hidden sm:inline">&bull; {scenario.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Telemetry HUD Canvas */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0F17]/95 border border-[#D4AF37]/25 shadow-2xl relative overflow-hidden text-left">
          
          {/* Header Bar within HUD */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#D4AF37]" />
                <span className="font-mono text-xs text-[#D4AF37] uppercase tracking-widest font-semibold">
                  {activeScenario.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {activeScenario.subtitle}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-gold-gradient tracking-tight">
                {activeScenario.primaryMetric}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase">
                {activeScenario.metricLabel}
              </span>
            </div>
          </div>

          {/* Dynamic Animated Telemetry Curve */}
          <div className="py-6 relative">
            <svg
              className="w-full h-44 sm:h-60"
              viewBox="0 0 700 230"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="telemetryGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={activeScenario.fillGradient[0]} />
                  <stop offset="50%" stopColor={activeScenario.fillGradient[1]} />
                  <stop offset="100%" stopColor={activeScenario.fillGradient[2]} />
                </linearGradient>
              </defs>

              {/* Grid guide lines */}
              <line x1="10" y1="50" x2="690" y2="50" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <line x1="10" y1="115" x2="690" y2="115" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <line x1="10" y1="180" x2="690" y2="180" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

              {/* Dynamic Path with Framer Motion AnimatePresence key */}
              <AnimatePresence mode="wait">
                <motion.path
                  key={activeScenario.id}
                  d={activeScenario.pathData}
                  stroke="url(#telemetryGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </AnimatePresence>

              {/* Interactive Telemetry Inspection Points */}
              {activeScenario.nodes.map((node, i) => (
                <g key={i}>
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="5"
                    fill="#05070A"
                    stroke={activeScenario.fillGradient[1]}
                    strokeWidth="2.5"
                    className="cursor-pointer transition-transform hover:scale-150"
                  />
                  <text
                    x={node.cx}
                    y={node.cy > 40 ? node.cy - 12 : node.cy + 22}
                    textAnchor={node.cx > 550 ? 'end' : node.cx < 100 ? 'start' : 'middle'}
                    fill="#F1F5F9"
                    fontSize="10"
                    fontFamily="monospace"
                    className="select-none tracking-wider font-semibold opacity-90"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Real-Time Telemetry Inspector Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
            {activeScenario.subMetrics.map((sm, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/[0.05]">
                <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase tracking-wider">
                  {sm.label}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-white">
                    {sm.value}
                  </span>
                  <span className="text-[10px] font-mono text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                    {sm.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Engineering Narrative Footnote */}
          <div className="mt-4 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-slate-400 border-t border-white/[0.05]">
            <p className="max-w-2xl leading-relaxed">
              <strong className="text-white">Architectural Reality: </strong>{activeScenario.details}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] text-emerald-400 uppercase tracking-widest font-bold">Edge Verified</span>
            </div>
          </div>

        </div>

        {/* 3 Core Value Pillars Cards (Enhanced & Interactive) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-xl bg-[#0B0F17] border border-[#D4AF37]/25 hover:border-[#D4AF37] transition-all text-left group shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold font-mono text-[#D4AF37]">Fewer Tools</span>
              <Layers size={18} className="text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors" />
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Consolidate disconnected monthly subscriptions into one cohesive architectural fabric with unified identity and billing.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0B0F17] border border-amber-400/25 hover:border-amber-400 transition-all text-left group shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold font-mono text-amber-400">Faster Cycles</span>
              <Zap size={18} className="text-amber-400/60 group-hover:text-amber-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              From high-level executive decision to sub-second edge deployment with zero manual IT handoffs or ticket queues.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0B0F17] border border-yellow-300/25 hover:border-yellow-300 transition-all text-left group shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold font-mono text-yellow-300">Clear Ownership</span>
              <ShieldCheck size={18} className="text-yellow-300/60 group-hover:text-yellow-300 transition-colors" />
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Every data point, domain record, and runtime process is hosted under your sovereign ownership with zero lock-in.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TelemetryProof;
