import React from 'react';
import { ChevronDown, ArrowDown } from 'lucide-react';

const EcosystemMap = () => {
  return (
    <div className="p-8 md:p-12 rounded-xl bg-[#0B0F17] border border-[#D4AF37]/25 shadow-2xl relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/[0.08] mb-10">
        <div>
          <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block mb-1 font-bold">
            01 · ECOSYSTEM ARCHITECTURE HIERARCHY
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            How The Ecosystem Fits Together
          </h3>
        </div>
        <div className="px-3 py-1 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-mono text-[#D4AF37] font-semibold">
          MrTechSys Parent Ecosystem
        </div>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        
        {/* Tier 1: Parent Brand */}
        <div className="p-6 rounded-xl bg-[#07090E] border border-[#D4AF37]/40 text-center relative shadow-[0_0_20px_rgba(212,175,55,0.08)]">
          <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block mb-1 font-bold">
            LEVEL 01 · STRATEGIC TRANSFORMATION LAYER
          </span>
          <h4 className="text-xl font-bold text-white mb-2">MRTECHSYS</h4>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            The Technology Company & Digital Transformation Umbrella. Advisory, operational friction quantification, and multi-cloud systems architecture.
          </p>
        </div>

        <div className="flex justify-center text-[#D4AF37]">
          <ArrowDown size={20} />
        </div>

        {/* Tier 2: The Operating Layer (CloudFlip) */}
        <div className="p-6 rounded-xl bg-[#07090E] border border-[#D4AF37]/30 text-center relative shadow-[0_0_25px_rgba(212,175,55,0.06)]">
          <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block mb-1 font-bold">
            LEVEL 02 · FLAGSHIP OPERATING LAYER
          </span>
          <h4 className="text-xl font-bold text-white mb-2">CLOUDFLIP BUSINESS OS</h4>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            "Keep what works. Connect what doesn't. Automate what shouldn't be manual." Unified data pipeline connecting dispatch, field mobile quoting, and customer payments.
          </p>
        </div>

        <div className="flex justify-center text-[#D4AF37]">
          <ArrowDown size={20} />
        </div>

        {/* Tier 3: Vertical Fabric */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#07090E] border border-white/[0.08] text-center hover:border-[#D4AF37]/30 transition-colors">
            <span className="text-[9px] font-mono text-[#D4AF37] uppercase block mb-1 font-semibold">VERTICAL 01</span>
            <div className="text-sm font-bold text-white mb-1">Trades &amp; Field</div>
            <div className="text-[11px] text-slate-400">HVAC, Plumbing, Electrical, Roofing</div>
          </div>
          <div className="p-4 rounded-lg bg-[#07090E] border border-[#D4AF37]/30 text-center bg-[#D4AF37]/[0.02]">
            <span className="text-[9px] font-mono text-[#D4AF37] uppercase block mb-1 font-semibold">VERTICAL 02</span>
            <div className="text-sm font-bold text-white mb-1">CloudFlip Ops (Food)</div>
            <div className="text-[11px] text-slate-400">KDS, Waste Telemetry, Food Service</div>
          </div>
          <div className="p-4 rounded-lg bg-[#07090E] border border-white/[0.08] text-center hover:border-[#D4AF37]/30 transition-colors">
            <span className="text-[9px] font-mono text-[#D4AF37] uppercase block mb-1 font-semibold">VERTICAL 03</span>
            <div className="text-sm font-bold text-white mb-1">Commercial / Real Estate</div>
            <div className="text-[11px] text-slate-400">Property Mgmt, Leases, Professional</div>
          </div>
        </div>

        <div className="flex justify-center text-[#D4AF37]">
          <ArrowDown size={20} />
        </div>

        {/* Tier 4: Foundation Engine */}
        <div className="p-6 rounded-xl bg-[#07090E] border border-white/[0.08] text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
            LEVEL 04 · UNDERLYING FOUNDRY &amp; INFRASTRUCTURE
          </span>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-slate-300 mt-3">
            <span className="px-3 py-1 rounded bg-white/[0.03] border border-[#D4AF37]/20 text-[#D4AF37]">TOL-Core AI Runtime</span>
            <span className="px-3 py-1 rounded bg-white/[0.03] border border-white/10">Cloudflare Zero-Trust Edge</span>
            <span className="px-3 py-1 rounded bg-white/[0.03] border border-white/10">Multi-Cloud Mesh (AWS/GCP/Azure)</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EcosystemMap;
