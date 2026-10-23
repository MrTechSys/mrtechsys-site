import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Why MrTechSys', path: '/#why' },
    { name: 'Assessment', path: '/assessment' },
    { name: 'Flip Engine', path: '/diagnostic' },
    { name: 'CloudFlip OS', path: '/#cloudflip' },
    { name: 'Cloud Provisioner', path: '/cloud-provisioner' },
    { name: 'Foundry & AI', path: '/foundry' },
    { name: 'Origin & Mission', path: '/about/mrtechsys' },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 border-b border-[#D4AF37]/15 bg-[#05070A]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo with Official Texas Badge */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="MrTechSys Logo" 
              className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white group-hover:text-[#D4AF37] transition-colors">
              MrTechSys
            </span>
            <span className="font-mono text-[8.5px] text-[#D4AF37] tracking-widest uppercase">
              AI CONSULTANCY OS
            </span>
          </div>
        </Link>

        {/* Desktop Links (Clean Executive HUD) */}
        <div className="hidden lg:flex items-center gap-7">
          <a
            href="/#reveal"
            className="text-xs font-mono text-slate-300 hover:text-[#D4AF37] transition-colors tracking-wide"
          >
            Capabilities
          </a>
          <a
            href="/#cloudflip"
            className="text-xs font-mono text-slate-300 hover:text-[#D4AF37] transition-colors tracking-wide"
          >
            Platform
          </a>
          <a
            href="/#disciplines"
            className="text-xs font-mono text-slate-300 hover:text-[#D4AF37] transition-colors tracking-wide"
          >
            Disciplines
          </a>
          <Link
            to="/about/mrtechsys"
            className="text-xs font-mono text-slate-300 hover:text-[#D4AF37] transition-colors tracking-wide"
          >
            Origin
          </Link>
          <a
            href="https://cloudflip.mrtechsys.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/15 font-mono text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>CloudFlip</span>
            <span className="text-[10px] text-amber-400">&rarr;</span>
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('mrtechsys-open-booking', { detail: { service: 'General Advisory' } }))}
            className="px-4 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#05070A] font-mono text-xs font-bold rounded-lg shadow-[0_0_18px_rgba(212,175,55,0.3)] transition-all uppercase tracking-wider cursor-pointer"
          >
            Book Strategy
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-slate-300 p-2 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-[#05070A] border-b border-[#D4AF37]/25 flex flex-col p-6 gap-4 lg:hidden shadow-2xl backdrop-blur-2xl"
        >
          <a
            href="/#reveal"
            onClick={() => setIsOpen(false)}
            className="text-sm font-mono text-slate-300 hover:text-[#D4AF37] transition-colors py-1"
          >
            Capabilities
          </a>
          <a
            href="/#cloudflip"
            onClick={() => setIsOpen(false)}
            className="text-sm font-mono text-slate-300 hover:text-[#D4AF37] transition-colors py-1"
          >
            Platform
          </a>
          <a
            href="/#disciplines"
            onClick={() => setIsOpen(false)}
            className="text-sm font-mono text-slate-300 hover:text-[#D4AF37] transition-colors py-1"
          >
            Disciplines
          </a>
          <Link
            to="/about/mrtechsys"
            onClick={() => setIsOpen(false)}
            className="text-sm font-mono text-slate-300 hover:text-[#D4AF37] transition-colors py-1"
          >
            Origin
          </Link>
          <div className="pt-2 border-t border-white/[0.08] space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent('mrtechsys-open-booking', { detail: { service: 'General Advisory' } }));
              }}
              className="w-full text-center py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#05070A] font-mono text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer"
            >
              Book Strategy Session
            </button>
            <a
              href="https://cloudflip.mrtechsys.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block text-center py-2.5 border border-[#D4AF37]/50 text-[#D4AF37] font-mono text-xs font-bold rounded-lg uppercase tracking-wider"
            >
              Launch CloudFlip &rarr;
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
