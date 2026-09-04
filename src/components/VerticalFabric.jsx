import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Utensils, Building2, CheckCircle2, ArrowRight, 
  Smartphone, PhoneCall, CreditCard, Sparkles, Send, Check,
  Share2, ShieldCheck, Navigation, DollarSign, ExternalLink, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VERTICALS = [
  {
    id: 'trades',
    title: 'Trades & Field Services',
    badge: 'HVAC • Plumbing • Electrical • Roofing',
    icon: Wrench,
    headline: 'From First Ring to Driveway Tap-to-Pay in Record Time.',
    stat: '3.4x Faster Turnaround',
    description: 'No app fatigue. Your field techs dispatch in real-time, generate instant photo-to-quote estimates in the customer driveway, and collect tap-to-pay signatures on mobile before leaving the job site.',
    simulator: {
      type: 'mobile-app',
      header: 'CloudFlip Field Ops',
      job: 'Lone Star AC & Heating · Ticket #482',
      customer: 'Sarah Jenkins · Austin, TX',
      steps: [
        { label: 'AI Voice Dispatch', status: 'Booked 24/7 via AI', badge: 'Completed', icon: PhoneCall },
        { label: 'Photo-to-Quote Link', status: 'Capacitor & Freon · $285', badge: 'Approved via SMS', icon: Send },
        { label: 'Driveway Tap-to-Pay', status: 'Visa •••• 4291', badge: 'Paid $285.00', icon: CreditCard }
      ]
    }
  },
  {
    id: 'jobnetwork',
    title: 'JobNetwork™ Mesh',
    badge: 'Sub Compliance • Route Densification • Partner Referrals',
    icon: Share2,
    headline: 'Monetize Referrals & Automate Subcontractor Compliance.',
    stat: '+28% Billable Capacity',
    description: 'Never leave money on the table. When your schedule is packed or a job requires another trade, hand off leads with 1 tap. When the customer pays, your referral reward direct-deposits into your bank account automatically via Stripe Connect. Plus: automated subcontractor W-9, COI insurance, and digital lien waivers before paying 1099 crews.',
    simulator: {
      type: 'jobnetwork-mesh',
      header: 'CloudFlip JobNetwork Mesh',
      job: 'Referral & Subcontractor Settlement',
      customer: 'Partner Circle & 1099 Operations',
      steps: [
        { label: 'Subcontractor Compliance', status: 'COI Insurance & W-9 Verified', badge: 'Active & Insured', icon: ShieldCheck },
        { label: 'Route Densification', status: '+3 Clustered Jobs in Oak Hill', badge: '-18 Mi Travel', icon: Navigation },
        { label: 'Partner Referral Settlement', status: 'Automated Payout via Stripe Connect', badge: 'Reward Settled', icon: DollarSign }
      ]
    }
  },
  {
    id: 'commercial',
    title: 'Commercial & Professional',
    badge: 'Legal • Accounting • Real Estate • Architecture',
    icon: Building2,
    headline: 'Zero-Trust Client Portals & Automated Document Intake.',
    stat: '72% Admin Drag Cut',
    description: 'No administrative drag. Automated document intake securely parses commercial leases, agreements, and contracts in seconds, routing data to zero-trust client vaults and triggering automatic recurring ACH payment billing.',
    simulator: {
      type: 'document-vault',
      header: 'CloudFlip Zero-Trust Portal',
      job: 'Commercial Lease Extraction · Suite 300',
      customer: 'Austin Commercial Ventures',
      steps: [
        { label: 'Automated Lease Extraction', status: 'Term dates & SLA parsed in 1.2s', badge: 'Verified', icon: CheckCircle2 },
        { label: 'Edge Encrypted Client Vault', status: 'Cloudflare Zero-Trust edge storage', badge: 'Encrypted', icon: Sparkles },
        { label: 'Instant Invoice & ACH Routing', status: 'Monthly retainer billed automatically', badge: 'Scheduled', icon: CreditCard }
      ]
    }
  },
  {
    id: 'food',
    title: 'CloudFlip Ops (Kitchen Display)',
    badge: 'Restaurants • Catering • Food Trucks • Ghost Kitchens',
    icon: Utensils,
    headline: 'Sub-Second Kitchen Orchestration & Live Device KDS.',
    stat: '99.4% Order Accuracy',
    description: 'Turn your existing iPads, Android tablets, or smart TV screens into a low-latency Kitchen Display System (KDS). CloudFlip Ops unifies walk-up POS tickets with DoorDash, UberEats, and catering orders in one queue—eliminating thousands in proprietary terminal fees while automating live ingredient depletion.',
    simulator: {
      type: 'kds-screen',
      header: 'CloudFlip Ops · Bring-Your-Own-Device KDS',
      job: 'Table 14 & UberEats Aggregator Mesh',
      customer: '4 Orders in Priority Line',
      steps: [
        { label: 'Unified POS & Delivery Ingest', status: 'Square + Toast + DoorDash synced', badge: 'Live Sync', icon: Sparkles },
        { label: 'Live Recipe & Ingredient Depletion', status: 'Brisket & Ribs inventory -2', badge: 'Auto-Updated', icon: CheckCircle2 },
        { label: 'Automated Supplier Re-Order PO', status: 'Sysco / US Foods re-order alert', badge: 'Dispatched', icon: Send }
      ]
    }
  }
];

const VerticalFabric = () => {
  const [activeVertical, setActiveVertical] = useState(VERTICALS[0]);

  return (
    <section id="cloudflip" className="py-20 md:py-28 bg-[#07090E]/90 border-t border-b border-white/[0.06] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          
          {/* Executive Subtitle Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37] font-mono text-[11px] tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            03 · FLAGSHIP SAAS PRODUCT &bull; CLOUDFLIP OS
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            The Operating Platform for <span className="text-gold-gradient">Modern Local Businesses</span>.
          </h2>

          {/* Multi-Industry Scope Reassurance Banner */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[#D4AF37]/20 max-w-3xl mx-auto mb-6 text-xs text-slate-300 font-mono">
            <span className="text-[#D4AF37] font-bold">MULTI-VERTICAL ARCHITECTURE:</span> Built to unify Trades &amp; Field Ops, Subcontractor JobNetwork™ Compliance, Commercial Zero-Trust Portals, and <span className="text-white font-bold">CloudFlip Ops Bring-Your-Own-Device KDS for Restaurants</span>.
          </div>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Select a live capability module below to preview real-time field dispatch, subcontractor compliance, client document intake, or kitchen ticket orchestration.
          </p>
        </div>

        {/* Vertical Tabs (Mobile & Desktop Responsive 4-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {VERTICALS.map((v) => {
            const Icon = v.icon;
            const isSelected = activeVertical.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActiveVertical(v)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.15)]' 
                    : 'border-white/[0.07] bg-white/[0.01] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={18} className={isSelected ? 'text-[#D4AF37]' : 'text-slate-400'} />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{v.stat}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-0.5">{v.title}</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 truncate">{v.badge}</div>
              </button>
            );
          })}
        </div>

        {/* Interactive Device Preview Simulator */}
        <div className="p-6 md:p-10 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/30 shadow-2xl relative mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVertical.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              
              {/* Left Context (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-mono text-[#D4AF37] uppercase font-bold tracking-widest block">
                  {activeVertical.badge}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {activeVertical.headline}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeVertical.description}
                </p>

                {/* Specific Value Highlights */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0" />
                    <span>No accounting disruption: Two-way sync with QuickBooks &amp; Xero</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0" />
                    <span>Direct deposit settlements with zero manual invoice chasing</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <a
                    href="https://cloudflip.mrtechsys.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer"
                  >
                    <span>Launch CloudFlip App ↗</span>
                  </a>
                  <Link
                    to="/diagnostic"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-[#D4AF37] transition-colors"
                  >
                    <span>Calculate ROI first &rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Right Interactive Smartphone / Tablet Device Mockup (6 cols) */}
              <div className="lg:col-span-6">
                <div className="max-w-[360px] mx-auto rounded-3xl bg-[#07090E] border-2 border-slate-700 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
                  
                  {/* Smartphone Top Speaker Notch */}
                  <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-1.5"></span>
                    <span className="w-8 h-1 bg-slate-900 rounded-full"></span>
                  </div>

                  {/* Device Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                    <div className="flex items-center gap-2">
                      <img src="/logo.png" alt="" className="w-3.5 h-3.5 object-contain" />
                      <span className="text-xs font-bold text-white tracking-wide">
                        {activeVertical.simulator.header}
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>

                  {/* Customer / Job Context */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono block">ACTIVE EVENT</span>
                    <span className="text-white font-bold block">{activeVertical.simulator.job}</span>
                    <span className="text-slate-400 text-[11px]">{activeVertical.simulator.customer}</span>
                  </div>

                  {/* 3 Step Interactive Workflow */}
                  <div className="space-y-2.5 mb-4">
                    {activeVertical.simulator.steps.map((step, sIdx) => {
                      const StepIcon = step.icon;
                      return (
                        <div 
                          key={sIdx}
                          className="p-3 rounded-xl bg-[#0B0F17] border border-[#D4AF37]/30 flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
                              <StepIcon size={14} />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">{step.label}</span>
                              <span className="text-[10px] text-slate-400 block">{step.status}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            {step.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Phone Bottom Home Bar */}
                  <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-2"></div>

                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* High-Impact App Router / Gateway Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#D4AF37]/15 via-white/[0.03] to-transparent border border-[#D4AF37]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#D4AF37] font-bold uppercase tracking-widest block">
              LIVE PLATFORM ROUTER &bull; CLOUDFLIP.MRTECHSYS.COM
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Ready to deploy CloudFlip across your business?
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Log directly into the CloudFlip operating platform at <strong className="text-white">cloudflip.mrtechsys.com</strong> to manage dispatch, launch route campaigns, and collect payments.
            </p>
          </div>
          <a
            href="https://cloudflip.mrtechsys.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <span>Launch CloudFlip App ↗</span>
          </a>
        </div>

      </div>
    </section>
  );
};

export default VerticalFabric;
