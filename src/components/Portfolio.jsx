import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const projects = [
  { name: 'Connect AV', category: 'Infrastructure', description: 'Streamlined audio-visual control and orchestration.', link: '/demo/keynote', featured: true },
  { name: 'Remnant', category: 'Data Science', description: 'Advanced residual data analysis and recovery.' },
  { name: 'AutoModular', category: 'Automation', description: 'Plug-and-play modular automation framework.' },
  { name: 'BizFlow', category: 'Workflow', description: 'Intelligent business process optimization.' },
  { name: 'CJCLife', category: 'Application', description: 'Core production environment for CJCLife ecosystem.' },
  { name: 'GameGrid', category: 'Entertainment', description: 'High-performance gaming infrastructure.' },
  { name: 'SoundFX Events', category: 'Media', description: 'Real-time sound processing for live environments.' },
  { name: 'Left Field BBQ', category: 'Retail Tech', description: 'Custom operational stack for hospitality.' },
  { name: 'ZRK Electric', category: 'Industrial', description: 'Power monitoring and management solutions.' },
  { name: 'CloudFlip', category: 'Flagship', description: 'Comprehensive small business CloudFX platform.', link: '/cloudflip', featured: true },
  { name: 'Auto-Risk-Analyzer', category: 'Flagship', description: 'AI-driven risk assessment and intelligence.', link: '/risk', featured: true },
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#111111]">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Expanding Portfolio</h2>
          <p className="text-slate-400 max-w-2xl">
            A unified cloud-native showcase of our specialized applications, ranging from industrial automation to AI-driven intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`group p-8 rounded-2xl bg-[#1e293b]/20 border border-white/5 hover:border-[#00E5FF]/30 transition-all duration-300 relative overflow-hidden ${project.featured ? 'border-[#00E5FF]/20 bg-[#00E5FF]/5' : ''}`}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/0 to-[#6366F1]/0 group-hover:from-[#00E5FF]/5 group-hover:to-[#6366F1]/5 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00E5FF] mb-2 block">
                  {project.category}
                </span>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00E5FF] transition-colors flex items-center gap-2">
                  {project.name}
                  {project.link && <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {project.description}
                </p>
                
                {project.link ? (
                  <a 
                    href={project.link}
                    className="text-xs font-bold text-white group-hover:text-[#00E5FF] flex items-center gap-1 transition-colors"
                  >
                    LAUNCH PROJECT <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">IN DEVELOPMENT</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
