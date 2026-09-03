import React from 'react';
import { Compass, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const OriginMission = () => {
  return (
    <section id="origin" className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37] font-mono text-[11px] tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            04 · STRATEGIC ORIGIN &amp; MISSION
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Built from Real Operational Physics. <br />
            <span className="text-slate-400 font-light">Not an Academic Exercise.</span>
          </h2>
        </div>

        {/* The Thesis Quote Card */}
        <div className="p-8 md:p-12 rounded-xl bg-[#0B0F17] border border-[#D4AF37]/25 relative mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none"></div>

          <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest block mb-3 font-bold">
            THE CORE THESIS
          </span>
          <blockquote className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-6">
            &ldquo;Why should small businesses have to operate like it&rsquo;s 2010 just because enterprise technology is unnecessarily complicated?&rdquo;
          </blockquote>
          <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
            Enterprise software providers build bloated, seven-figure systems that demand dedicated IT departments. Meanwhile, local businesses &mdash; the economic backbone that keeps Texas and American communities moving &mdash; get left with fragmented spreadsheets, sticky notes, and fragile desktop software. MrTechSys was founded to permanently bridge that chasm.
          </p>
        </div>

        {/* 22+ Year Strategic Lens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-lg bg-[#0B0F17] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Compass size={18} className="text-[#D4AF37]" />
              <h4 className="text-sm font-bold text-white uppercase font-mono">The 22+ Year Business Perspective</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rooted in over two decades of front-line commercial, sales, and operational experience. We understand how payroll is met, how field dispatchers handle stress, and where real cash flow leakage happens on the ground.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#0B0F17] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={18} className="text-[#D4AF37]" />
              <h4 className="text-sm font-bold text-white uppercase font-mono">Modern Systems Architecture</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fusing modern software engineering, serverless cloud resilience, and deterministic AI runtimes (TOL-Core) into practical platforms that deploy without disrupting ongoing business operations.
            </p>
          </div>
        </div>

        {/* The Spine of the Ecosystem */}
        <div className="p-8 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 via-[#0B0F17] to-[#CA8A04]/10 border border-[#D4AF37]/30 text-center shadow-[0_0_30px_rgba(212,175,55,0.06)]">
          <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block mb-2 font-bold">
            THE DEFINING PHILOSOPHY
          </span>
          <h3 className="text-lg md:text-xl font-bold text-white max-w-2xl mx-auto leading-snug mb-6">
            MrTechSys helps businesses understand where they are, see where they could be, and gives them the technology to make the flip.
          </h3>
          <div className="flex justify-center gap-4">
            <Link
              to="/diagnostic"
              className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold rounded shadow-[0_0_20px_rgba(212,175,55,0.3)] uppercase tracking-wider transition-all"
            >
              Start Diagnostic Assessment &rarr;
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default OriginMission;
