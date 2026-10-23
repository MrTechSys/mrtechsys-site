import React from 'react';

const Footer = () => {
  return (
    <footer id="contact" className="py-14 border-t border-[#D4AF37]/15 bg-[#05070A] text-slate-400 font-mono text-xs relative">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="MrTechSys Logo" 
              className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]" 
            />
            <span className="text-white font-bold tracking-tight text-sm">MrTechSys</span>
            <span className="text-slate-600">·</span>
            <span className="text-[#D4AF37] text-[11px] font-semibold tracking-wider uppercase">
              AI Consultancy OS
            </span>
          </div>

          <div className="flex items-center gap-6 text-white text-[11px]">
            <a href="/#reveal" className="hover:text-amber-400 active:text-[#D4AF37] transition-colors">
              Capabilities
            </a>
            <a href="/#proof" className="hover:text-amber-400 active:text-[#D4AF37] transition-colors">
              Platform
            </a>
            <a href="/#disciplines" className="hover:text-amber-400 active:text-[#D4AF37] transition-colors">
              Disciplines
            </a>
            <a 
              href="https://cloudflip.mrtechsys.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-amber-400 active:text-[#D4AF37] transition-colors text-amber-300"
            >
              CloudFlip ↗
            </a>
            <a href="/about/mrtechsys" className="hover:text-amber-400 active:text-[#D4AF37] transition-colors">
              Origin
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} MrTechSys — Systems, Resolved. Flagship Enterprise Architecture.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="/privacy.html" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="/terms.html" className="hover:text-amber-400 transition-colors">Terms of Service</a>
            <span>·</span>
            <a href="/cookies.html" className="hover:text-amber-400 transition-colors">Cookie Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
