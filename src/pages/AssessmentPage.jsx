import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Users, AlertCircle, CheckCircle2, ArrowRight, 
  Sparkles, ShieldCheck, DollarSign, Clock, HelpCircle, FileText, Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const VERTICAL_OPTIONS = [
  { id: 'trade_services', icon: '🔨', title: 'Contractor & Trades', desc: 'HVAC, Plumbing, Electrical, Roofing, General Contracting' },
  { id: 'food_hospitality', icon: '🍳', title: 'Food & Hospitality', desc: 'Restaurants, Food Trucks, Catering, Commercial Kitchens' },
  { id: 'real_estate', icon: '🏡', title: 'Real Estate & Property', desc: 'Agents, Property Managers, Inspectors, HOA Operations' },
  { id: 'auto_fleet', icon: '🚗', title: 'Auto & Fleet', desc: 'Mechanics, Mobile Detailing, Towing, Logistics' },
  { id: 'pro_services', icon: '💼', title: 'Professional Services', desc: 'Legal, Accounting, Consulting, Design & Media Agencies' },
  { id: 'health_wellness', icon: '🌿', title: 'Health & Wellness', desc: 'Clinics, Gyms, Salons, Medical Practices' },
];

const BOTTLENECK_OPTIONS = [
  { id: 'dispatch', icon: '📅', title: 'Scheduling & Dispatch', desc: 'Double-bookings, missed appointments, route chaos' },
  { id: 'invoicing', icon: '💳', title: 'Chasing Invoices & Quotes', desc: 'Slow net-30 payments, manual paper drafting, cash drag' },
  { id: 'leads', icon: '📞', title: 'Missed Customer Calls', desc: 'Losing high-value leads when technicians are busy' },
  { id: 'inventory', icon: '📦', title: 'Inventory & Supply Line', desc: 'Tracking materials, stock-outs, supplier reorder delays' },
  { id: 'app_fatigue', icon: '📱', title: 'Multiple Disconnected Apps', desc: 'Copy-pasting data across 5 different single-feature tools' },
  { id: 'data_loss', icon: '🛡️', title: 'On-Premises Hardware Risk', desc: 'Fragile local desktop software, fear of server crashes' }
];

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [selectedVerticals, setSelectedVerticals] = useState(['trade_services']);
  const [selectedBottlenecks, setSelectedBottlenecks] = useState(['dispatch', 'invoicing', 'leads']);
  const [teamSize, setTeamSize] = useState('5-15');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleVertical = (id) => {
    setSelectedVerticals(prev => 
      prev.includes(id)
        ? (prev.length > 1 ? prev.filter(v => v !== id) : prev)
        : [...prev, id]
    );
  };

  const toggleBottleneck = (id) => {
    setSelectedBottlenecks(prev => 
      prev.includes(id)
        ? (prev.length > 1 ? prev.filter(b => b !== id) : prev)
        : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const activeVerticalObjects = VERTICAL_OPTIONS.filter(v => selectedVerticals.includes(v.id));
  const activeBottleneckObjects = BOTTLENECK_OPTIONS.filter(b => selectedBottlenecks.includes(b.id));

  return (
    <div className="pt-32 pb-24 min-h-screen px-4 md:px-6 relative">
      <div className="max-w-3xl mx-auto rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/30 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
        
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-[10px] tracking-wider uppercase mb-3 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            CLOUDFX READINESS ASSESSMENT
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-2">
            Small Business Operations &amp; <span className="text-gold-gradient">AI Diagnostic</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Designed for local business owners. Select all operational hurdles and vertical focus areas that apply to generate your tailored roadmap.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Industry Vertical (Multi-select) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                  1. What type of business do you run?
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Select all that apply ({selectedVerticals.length} active)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VERTICAL_OPTIONS.map((vert) => {
                  const isSelected = selectedVerticals.includes(vert.id);
                  return (
                    <div
                      key={vert.id}
                      onClick={() => toggleVertical(vert.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.12)]' 
                          : 'border-white/[0.08] bg-white/[0.01] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{vert.icon}</span>
                        <div>
                          <div className="text-sm font-bold text-white">{vert.title}</div>
                          <div className="text-[11px] text-slate-400">{vert.desc}</div>
                        </div>
                      </div>
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#D4AF37] bg-[#D4AF37] text-[#07090E]' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Primary Bottlenecks (Multi-select) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                  2. What eats up most of your team's time each week?
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Select all that apply ({selectedBottlenecks.length} active)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOTTLENECK_OPTIONS.map((bot) => {
                  const isSelected = selectedBottlenecks.includes(bot.id);
                  return (
                    <div
                      key={bot.id}
                      onClick={() => toggleBottleneck(bot.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.12)]' 
                          : 'border-white/[0.08] bg-white/[0.01] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{bot.icon}</span>
                        <div>
                          <div className="text-sm font-bold text-white">{bot.title}</div>
                          <div className="text-[11px] text-slate-400">{bot.desc}</div>
                        </div>
                      </div>
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#D4AF37] bg-[#D4AF37] text-[#07090E]' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Team Size & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  3. Business Name &amp; Location
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Austin Pro HVAC, Austin TX"
                  required
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  4. Email to Send Diagnostic Blueprint
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourcompany.com"
                  required
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>⚡ Generate Operations Blueprint &rarr;</span>
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-2"
          >
            <div className="p-6 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 space-y-4">
              <div className="flex items-center gap-2 text-[#D4AF37] font-mono text-xs font-bold uppercase">
                <CheckCircle2 size={16} /> Prescribed Operations Architecture
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {businessName || 'Your Business'}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {activeVerticalObjects.map(v => (
                    <span key={v.id} className="px-2.5 py-1 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-[11px] font-semibold">
                      {v.icon} {v.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08]">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                  ACTIVE FRICTION TARGETS IDENTIFIED ({activeBottleneckObjects.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeBottleneckObjects.map(b => (
                    <div key={b.id} className="p-2.5 rounded bg-black/30 border border-white/[0.06] text-xs text-slate-300 flex items-center gap-2">
                      <span>{b.icon}</span>
                      <span className="font-semibold text-white">{b.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-2">
                <strong>Architect Prescription:</strong> Deploy <em>CloudFlip Business OS</em> paired with <em>TOL-Core Autonomous Lead Triage &amp; Mobile Dispatch</em>. Unifies customer communication, eliminates multi-app duplicate entry, and provides instant mobile invoicing without requiring you to switch accounting software.
              </p>
            </div>

            {/* Direct Bridge to Cloud Provisioner */}
            <div className="p-6 rounded-xl bg-[#07090E] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">RECOMMENDED NEXT STEP</span>
                <div className="text-sm font-bold text-white">Build your zero-dollar cloud footprint now</div>
                <div className="text-xs text-slate-400">Start 100% free across Cloudflare, AWS, and Azure.</div>
              </div>
              <Link
                to="/cloud-provisioner"
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all shrink-0"
              >
                Launch Cloud Provisioner &rarr;
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AssessmentPage;
