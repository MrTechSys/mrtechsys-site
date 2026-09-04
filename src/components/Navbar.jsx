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
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-3.5 border-b border-white/[0.08] bg-[#07090E]/90 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo with Official Texas Badge */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="MrTechSys Texas Badge" 
              className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.35)] group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white group-hover:text-[#D4AF37] transition-colors">
              MrTechSys
            </span>
            <span className="font-mono text-[9px] text-[#D4AF37]/80 tracking-widest uppercase">
              DIGITAL TRANSFORMATION
            </span>
          </div>
        </Link>


        {/* Desktop Links (Cinematic Gold HUD style) */}
        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-xs font-mono text-slate-300 hover:text-[#D4AF37] transition-colors tracking-wide"
            >
              {link.name}
            </Link>
          ))}
          <a
            href="https://cloudflip.mrtechsys.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/15 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>CloudFlip</span>
            <span className="text-[10px]">&rarr;</span>
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('mrtechsys-open-booking', { detail: { service: 'General Advisory' } }))}
            className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 text-slate-200 hover:text-[#D4AF37] hover:border-[#D4AF37] font-mono text-xs font-semibold transition-all cursor-pointer"
          >
            Book Strategy
          </button>
          <Link
            to="/assessment"
            className="px-3.5 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold rounded shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all uppercase tracking-wider"
          >
            Free Assessment
          </Link>
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
          className="absolute top-full left-0 right-0 bg-[#07090E] border-b border-[#D4AF37]/20 flex flex-col p-6 gap-4 lg:hidden shadow-2xl"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-sm font-mono text-slate-300 hover:text-[#D4AF37] transition-colors py-1"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/[0.08] space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent('mrtechsys-open-booking', { detail: { service: 'General Advisory' } }));
              }}
              className="w-full text-center py-2.5 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-mono text-xs font-bold rounded uppercase tracking-wider cursor-pointer"
            >
              Book Strategy Session
            </button>
            <Link
              to="/assessment"
              onClick={() => setIsOpen(false)}
              className="block text-center py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-mono text-xs font-bold rounded uppercase tracking-wider"
            >
              Free Assessment (Health Score)
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
