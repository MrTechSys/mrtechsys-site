import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, ArrowRight, ShieldCheck, CheckCircle2, Cpu, X, Send } from 'lucide-react';

const ConsultationModal = ({
  isOpen,
  onClose,
  contextTitle = "Architecture Advisory Session",
  selectedBuild = [],
  selectedCsps = [],
  diagnosticMetrics = null,
  source = "general"
}) => {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !businessName.trim() || !email.trim()) return;

    setIsSubmitting(true);

    const consultationPayload = {
      name: name.trim(),
      businessName: businessName.trim(),
      email: email.trim(),
      question: question.trim() || "Review our custom cloud architecture and highlight zero-cost optimization opportunities.",
      selectedBuild,
      selectedCsps,
      source
    };

    // 1. Quietly record lead into D1 serverless inbox
    try {
      await fetch('/api/consult-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultationPayload)
      });
    } catch (err) {
      console.warn("Notice: Lead recorded locally in advisory queue", err);
    }

    // 2. Synthesize rich prompt for TexasBot / MrTechSysGPT
    const workloadStr = selectedBuild.length > 0 ? selectedBuild.join(', ') : 'Web, API & Database';
    const cspStr = selectedCsps.length > 0 ? selectedCsps.map(c => c.toUpperCase()).join(' + ') : 'Cloudflare + AWS';
    
    let promptDetail = `Consultation Advisory Request for ${businessName} (${name}):\n`;
    promptDetail += `Target Providers: [${cspStr}]\n`;
    promptDetail += `Workload Primitives: [${workloadStr}]\n`;
    
    if (diagnosticMetrics) {
      promptDetail += `Operational Diagnostic Context: ${diagnosticMetrics.leakageHours || '15+'} hrs/wk leakage, est. $${diagnosticMetrics.leakageCost || '2,400'}/mo payroll drag.\n`;
    }

    promptDetail += `Client Question & Situation: "${question.trim() || 'Provide enterprise architecture recommendations starting on free-tier allocations.'}"\n`;
    promptDetail += `Please provide your senior architecture advice, specific integration steps, and zero-egress safeguards for our business.`;

    // 3. Dispatch to TexasBot and close modal
    window.dispatchEvent(new CustomEvent('mrtechsys-open-chat', {
      detail: { 
        prompt: promptDetail,
        userName: name,
        businessName: businessName
      }
    }));

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg p-6 md:p-8 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative text-slate-100 font-sans"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-[10px] tracking-wider uppercase mb-3 font-bold">
          <Sparkles size={12} className="animate-spin" />
          <span>MRTECHSYS ARCHITECTURE ADVISORY</span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Consult With MrTechSys <span className="text-[#D4AF37]">Virtual Architect</span>
        </h3>
        
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          Get instantaneous, enterprise-grade architecture advice and implementation guidance tailored directly to your business situation &mdash; with zero waiting and zero vendor lock-in.
        </p>

        {/* Footprint badge pill */}
        {(selectedBuild.length > 0 || selectedCsps.length > 0) && (
          <div className="mt-4 p-3 rounded-lg bg-black/50 border border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Current Footprint:</span>
            <span className="text-[#D4AF37] font-semibold truncate max-w-[280px]">
              {selectedCsps.map(c => c.toUpperCase()).join(' + ') || 'CLOUDFLARE + AWS'} &bull; {selectedBuild.length || 3} Modules
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                Your Name <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                Business Name <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Lone Star Tech"
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
              Email Address <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@yourcompany.com"
              className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
              Your Architecture Question or Current Bottleneck (Optional)
            </label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How do we connect our customer data to Cloudflare Workers and AWS without running up billing surprises?"
              className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] disabled:opacity-50 text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Bot size={15} />
              <span>{isSubmitting ? 'Syncing Architecture...' : 'Launch AI Architecture Advisory →'}</span>
            </button>
            <div className="flex items-center justify-center gap-2 mt-2.5 text-[10px] font-mono text-slate-500">
              <ShieldCheck size={11} className="text-emerald-400" />
              <span>Private &bull; Zero Spam &bull; Immediate Live Synthesis</span>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ConsultationModal;
