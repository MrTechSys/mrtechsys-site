import React from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, Cpu, ArrowRight
} from 'lucide-react';
import EcosystemMap from '../components/EcosystemMap';

const AboutPage = () => {
  return (
    <div className="pt-36 pb-24 bg-[#07090E] min-h-screen text-slate-200">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Header Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/[0.03] border border-[#D4AF37]/25 text-[#D4AF37] font-mono text-xs uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
            MRTECHSYS · DIGITAL TRANSFORMATION ECOSYSTEM
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Enterprise-Grade Architecture. <br />
            <span className="text-gold-gradient font-bold">
              SMB-First Execution. Texas-Rooted Simplicity.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
            MrTechSys exists to bridge the widening chasm between enterprise technology and local small businesses. We diagnose operational drag, eliminate friction, and deploy unified cloud-native platforms.
          </p>
        </motion.div>

        {/* The Origin Thesis */}
        <div className="p-8 md:p-12 rounded-xl bg-[#0B0F17] border border-[#D4AF37]/25 mb-16 shadow-2xl relative">
          <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest block mb-3 font-bold">
            THE STRATEGIC THESIS
          </span>
          <h2 className="text-2xl font-bold text-white mb-4">
            &ldquo;Why should small businesses have to operate like it&rsquo;s 2010 just because enterprise technology is complicated?&rdquo;
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            For decades, small businesses have been forced to stitch together 10 different single-feature apps, manual spreadsheets, and physical paper notes. MrTechSys was built to quantify that exact friction and replace it with a single, coherent operating layer &mdash; CloudFlip.
          </p>
        </div>

        {/* 22+ Year Experience & Engineering Foundations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-xl bg-[#0B0F17] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded bg-[#D4AF37]/10 text-[#D4AF37]">
                <Compass size={20} />
              </div>
              <h3 className="text-lg font-bold text-white font-mono uppercase">22+ Years of Business Physics</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              We understand real-world cash flow, payroll deadlines, customer quoting friction, and the daily realities of dispatchers and business owners. Solutions are designed from operational empathy, not abstract code theory.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[#0B0F17] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded bg-[#D4AF37]/10 text-[#D4AF37]">
                <Cpu size={20} />
              </div>
              <h3 className="text-lg font-bold text-white font-mono uppercase">Modern Software Engineering</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Built on deterministic AI runtimes (TOL-Core), serverless architectures, automated multi-cloud provisioning (AWS, GCP, Azure), and Cloudflare Zero-Trust edge protection.
            </p>
          </div>
        </div>

        {/* Embedded Architecture Hierarchy */}
        <div className="mb-16">
          <EcosystemMap />
        </div>

        {/* Strategic Call to Action */}
        <div className="p-8 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 via-[#0B0F17] to-[#CA8A04]/15 border border-[#D4AF37]/30 text-center shadow-[0_0_30px_rgba(212,175,55,0.06)]">
          <h3 className="text-2xl font-bold text-white mb-2">Ready to Make The Flip?</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Run the 5-step diagnostic assessment to see your exact operational drag and custom CloudFlip blueprint.
          </p>
          <a
            href="/diagnostic"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
          >
            <span>Launch Flip Diagnostic Engine</span>
            <ArrowRight size={14} />
          </a>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
