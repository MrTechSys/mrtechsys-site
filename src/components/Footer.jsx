import React from 'react';

const Footer = () => {
  return (
    <footer className="py-14 border-t border-white/[0.08] bg-[#07090E] text-slate-500 font-mono text-xs relative">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.04]">
          <div className="flex items-center gap-3.5">
            <img 
              src="/logo.png" 
              alt="MrTechSys Texas Logo" 
              className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.25)]" 
            />
            <span className="text-white font-bold tracking-tight text-sm">MrTechSys</span>
            <span className="text-slate-600">·</span>
            <span className="text-[#D4AF37]/90 text-[11px] font-semibold tracking-wider">Digital Transformation Ecosystem</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-[11px]">
            <a href="/about/mrtechsys" className="hover:text-[#D4AF37] transition-colors">Ecosystem Map</a>
            <a href="/diagnostic" className="hover:text-[#D4AF37] transition-colors">The Flip Engine</a>
            <a href="/#cloudflip" className="hover:text-[#D4AF37] transition-colors">CloudFlip</a>
            <a href="/cloud-provisioner" className="hover:text-[#D4AF37] transition-colors">Cloud Provisioner</a>
            <a href="/about/mrtechsys" className="hover:text-[#D4AF37] transition-colors">Origin</a>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} MrTechSys · Enterprise Architecture. SMB-First Execution. Texas-Rooted Simplicity.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="/privacy.html" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="/terms.html" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <span>·</span>
            <a href="/cookies.html" className="hover:text-slate-300 transition-colors">Cookie Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
