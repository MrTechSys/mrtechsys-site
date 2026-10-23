import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, Send, Minus, Maximize2, Minimize2, RotateCcw, 
  Copy, Check, Sparkles, Compass, ArrowUpRight, Calendar
} from 'lucide-react';

const STORAGE_KEY_MESSAGES = 'mrtechsys_chat_history_v1';
const STORAGE_KEY_STATE = 'mrtechsys_chat_state_v1';

const INITIAL_MESSAGE = {
  id: 'welcome-init',
  role: 'assistant',
  text: "Welcome to MrTechSys. I am your Senior Technology Advisor. How can I assist with evaluating your operational systems or designing your cloud architecture today?",
  timestamp: new Date().toISOString()
};

const SUGGESTED_PROMPTS = [
  "⚡ Check Live DevOps Health",
  "🛡️ Audit Cloudflare + AWS Zero-Cost Stack",
  "📊 Calculate Payroll Operational Drag",
  "🗺️ Generate Systems Architecture Plan"
];

const ROUTE_RULES = [
  {
    path: '/cloud-provisioner',
    name: 'Cloud Provisioner',
    icon: '⚡',
    keywords: ['provision', 'free tier', 'cloud footprint', 'aws', 'azure', 'gcp', 'google cloud', 'iac', 'terraform', 'primitives', 'tripwire', 'hosting']
  },
  {
    path: '/diagnostic',
    name: 'Flip Engine Diagnostic',
    icon: '📊',
    keywords: ['flip engine', 'diagnostic', 'friction drag', 'payroll', 'wasted hours', 'calculate savings', 'leakage', 'roi']
  },
  {
    path: '/assessment',
    name: 'CloudFX Readiness Assessment',
    icon: '📋',
    keywords: ['assessment', 'readiness', 'readiness form', 'baseline hurdles', 'operations diagnostic', 'readiness assessment']
  },
  {
    path: '/foundry',
    name: 'Foundry Tech',
    icon: '⚙️',
    keywords: ['foundry', 'custom software', 'bespoke system', 'internal tooling', 'enterprise build']
  },
  {
    path: '/about/mrtechsys',
    name: 'About MrTechSys',
    icon: '🤠',
    keywords: ['texas roots', 'origin mission', 'about mrtechsys', 'who are you', 'backstory', '22 years']
  },
  {
    path: '/risk',
    name: 'Risk Analyzer Module',
    icon: '🛡️',
    keywords: ['risk analyzer', 'commercial fleet risk', 'fleet insurance', 'driver risk']
  }
];

const TexasBot = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Session Persistence
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [INITIAL_MESSAGE];
  });

  const [isOpen, setIsOpen] = useState(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY_STATE);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return Boolean(parsed.isOpen);
      }
    } catch (e) {}
    return false;
  });

  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY_STATE);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return Boolean(parsed.isMinimized);
      }
    } catch (e) {}
    return false;
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeRouteHint, setActiveRouteHint] = useState(null);
  const [conciergePrompt, setConciergePrompt] = useState(null);
  
  const messagesEndRef = useRef(null);
  const idleTimerRef = useRef(null);

  // Proactive Executive Guide: Detect user idle (~4.5 mins) or section lingering
  useEffect(() => {
    const IDLE_TIME_MS = 270000; // 4.5 minutes

    const getContextualAdvice = () => {
      const path = location.pathname;
      if (path === '/diagnostic') {
        return "Evaluating operational drag? I can calculate your exact payroll leakage and map the 68% recovery curve for your team.";
      }
      if (path === '/assessment') {
        return "Navigating the 10-dimension audit? Let me synthesize your baseline systems score and identify high-friction risks.";
      }
      if (path === '/cloud-provisioner') {
        return "Designing your cloud footprint? I can verify permanent $0 free-tier allocations across Cloudflare and AWS.";
      }
      return "Need guidance navigating the platform? As your Virtual Systems Architect, I can help you evaluate your architecture, calculate operational drag, or schedule an executive strategy session.";
    };

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (!isOpen) {
          setConciergePrompt(getContextualAdvice());
        }
      }, IDLE_TIME_MS);
    };

    const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [location.pathname, isOpen]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Persist window state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify({ isOpen, isMinimized }));
    } catch (e) {}
  }, [isOpen, isMinimized]);

  // Conversational Smart Auto-Routing
  const handleSmartRouting = (text) => {
    if (!text) return;
    const lower = text.toLowerCase();

    for (const rule of ROUTE_RULES) {
      const matched = rule.keywords.some(k => lower.includes(k));
      if (matched) {
        if (location.pathname !== rule.path) {
          // Auto-navigate in the background
          navigate(rule.path);
          setActiveRouteHint({ name: rule.name, path: rule.path, icon: rule.icon });
          setTimeout(() => setActiveRouteHint(null), 7000);
        }
        break;
      }
    }
  };

  // Custom event listener for external triggers (e.g. from Provisioner Wizard or Consultation Modal)
  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail && e.detail.prompt) {
        executePrompt(e.detail.prompt);
      }
    };

    window.addEventListener('mrtechsys-open-chat', handleOpenChat);
    return () => window.removeEventListener('mrtechsys-open-chat', handleOpenChat);
  }, [location.pathname]);

  const executePrompt = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: queryText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage(''); // Immediately clear input field on submission
    setIsTyping(true);

    // Check user intent for smart auto-navigation
    handleSmartRouting(queryText);

    try {
      const res = await fetch("/api/mrtechsysgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: queryText,
          history: messages.slice(-4).map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (res.ok) {
        const result = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: result.reply,
            timestamp: new Date().toISOString()
          }
        ]);
        // Also check assistant response for recommended feature navigation
        handleSmartRouting(result.reply);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: "MrTechSys Technology Advisory is online. Contact MrTechSys directly for specialized multi-cloud architectures.",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: "MrTechSys Technology Advisory online. Run our Cloud Provisioner Wizard or Business Assessment for instant blueprints.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;
    executePrompt(message);
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_MESSAGE]);
    try {
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
    } catch (e) {}
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Proactive Concierge Nudge Toast (Idle / Confusion Assistance) */}
      <AnimatePresence>
        {conciergePrompt && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 max-w-[320px] p-4 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/50 shadow-[0_15px_40px_rgba(0,0,0,0.9)] text-slate-100 text-xs relative"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setConciergePrompt(null); }}
              className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white p-1 rounded cursor-pointer"
            >
              <X size={12} />
            </button>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Virtual Systems Concierge</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed mb-3">
              {conciergePrompt}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(true);
                  setIsMinimized(false);
                  setConciergePrompt(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#05070A] font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Open Architecture Chat &rarr;
              </button>
              <button
                type="button"
                onClick={() => setConciergePrompt(null)}
                className="px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white font-mono text-[10px] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Docked Bar */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            onClick={() => setIsMinimized(false)}
            className="mb-3 px-4 py-2 rounded-full bg-[#05070A] border border-[#D4AF37]/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 cursor-pointer hover:border-[#D4AF37] transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <img src="/logo.png" alt="MrTechSys" className="w-4 h-4 object-contain" />
              <span className="text-xs font-bold text-white tracking-wider font-mono">MrTechSys &bull; Advisor Online</span>
            </div>
            <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded font-mono font-semibold">
              Restore
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Box */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-16 right-0 bg-[#05070A] border border-[#D4AF37]/35 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col transition-all backdrop-blur-xl ${
              isExpanded 
                ? 'w-[94vw] sm:w-[600px] h-[680px]' 
                : 'w-[94vw] sm:w-[420px] h-[560px]'
            }`}
          >
            {/* Header */}
            <div className="p-3.5 bg-[#0B0F17] border-b border-[#D4AF37]/20 flex justify-between items-center select-none">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/logo.png" 
                  alt="MrTechSys" 
                  className="w-4 h-4 object-contain"
                />
                <div>
                  <div className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <span>Virtual Architecture Advisor</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  </div>
                  <div className="text-[10px] text-[#D4AF37] font-medium font-mono">MrTechSys AI Advisory Console</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('mrtechsys-open-booking', {
                      detail: { service: 'AI Automation', context: { question: message || 'Consultation from TexasBot chat' } }
                    }));
                  }}
                  title="Book 1-on-1 strategy session"
                  className="p-1.5 rounded hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-colors cursor-pointer"
                >
                  <Calendar size={13} />
                </button>
                <button 
                  onClick={handleClearHistory}
                  title="Reset conversation"
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                </button>
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Standard size" : "Expand size"}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
                <button 
                  onClick={() => setIsMinimized(true)}
                  title="Minimize window"
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Smart Route Ambient Notification Banner */}
            <AnimatePresence>
              {activeRouteHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 py-1.5 bg-[#D4AF37]/15 border-b border-[#D4AF37]/30 text-[10px] text-[#D4AF37] flex items-center justify-between font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <Compass size={11} className="animate-spin" />
                    <span>Loaded {activeRouteHint.icon} {activeRouteHint.name} in background</span>
                  </span>
                  <span className="text-[9px] text-slate-400">Auto-Navigated</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Message Thread (Multi-turn History) */}
            <div className="flex-grow p-4 flex flex-col gap-3.5 overflow-y-auto bg-black/40 text-xs">
              
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div 
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[9px] text-slate-500 uppercase">
                        {isUser ? 'You' : 'MrTechSysGPT'}
                      </span>
                    </div>

                    <div 
                      className={`max-w-[88%] p-3 rounded-xl leading-relaxed whitespace-pre-line relative text-xs ${
                        isUser 
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-medium font-sans rounded-tr-none shadow-[0_4px_12px_rgba(212,175,55,0.2)]' 
                          : 'bg-[#0B0F17] border border-[#D4AF37]/30 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {/* Render text with clickable markdown links [Label](url) */}
                      {(() => {
                        if (isUser) return m.text;
                        const parts = [];
                        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
                        let lastIndex = 0;
                        let match;
                        while ((match = linkRegex.exec(m.text)) !== null) {
                          if (match.index > lastIndex) {
                            parts.push(m.text.slice(lastIndex, match.index));
                          }
                          parts.push(
                            <a
                              key={match.index}
                              href={match[2]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#D4AF37] underline font-bold hover:text-white inline-flex items-center gap-0.5"
                            >
                              <span>{match[1]}</span>
                              <span className="text-[10px]">&rarr;</span>
                            </a>
                          );
                          lastIndex = linkRegex.lastIndex;
                        }
                        if (lastIndex < m.text.length) {
                          parts.push(m.text.slice(lastIndex));
                        }
                        return parts.length > 0 ? parts : m.text;
                      })()}

                      {/* 1-Click Copy on Assistant Messages */}
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.id, m.text)}
                          title="Copy response"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/40 text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                          {copiedId === m.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0B0F17] border border-white/[0.08] text-slate-400 text-[11px] self-start">
                  <Sparkles size={13} className="text-[#D4AF37] animate-spin" />
                  <span>MrTechSysGPT is synthesizing...</span>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37] animate-bounce"></span>
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Chips */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 bg-[#0B0F17]/80 border-t border-white/[0.05] flex items-center gap-1.5 overflow-x-auto">
                {SUGGESTED_PROMPTS.map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => executePrompt(promptText)}
                    className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-[#D4AF37]/15 border border-white/[0.08] hover:border-[#D4AF37]/40 text-slate-300 hover:text-[#D4AF37] transition-all cursor-pointer shrink-0"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 bg-[#0B0F17] border-t border-white/[0.08] flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask MrTechSysGPT..."
                className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="submit"
                disabled={isTyping || !message.trim()}
                className="px-3.5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] disabled:opacity-30 text-[#07090E] font-bold text-xs rounded-lg transition-all shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.2)] cursor-pointer flex items-center justify-center"
              >
                <Send size={12} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating HUD Trigger Button */}
      <motion.button
        onClick={() => {
          if (isOpen && isMinimized) {
            setIsMinimized(false);
          } else {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`w-12 h-12 rounded-full border transition-all flex items-center justify-center shadow-2xl relative cursor-pointer overflow-hidden ${
          isOpen && !isMinimized
            ? 'bg-[#0B0F17] border-[#D4AF37] text-white shadow-[0_0_25px_rgba(212,175,55,0.4)]' 
            : 'bg-[#07090E] border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#0B0F17] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
        }`}
        aria-label="Chat with MrTechSysGPT Assistant"
      >
        {isOpen && !isMinimized ? (
          <X size={20} className="text-[#D4AF37]" />
        ) : (
          <img 
            src="/logo.png" 
            alt="MrTechSys" 
            style={{ width: '26px', height: '26px', maxWidth: '26px', maxHeight: '26px' }}
            className="w-[26px] h-[26px] max-w-[26px] max-h-[26px] object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]" 
          />
        )}
      </motion.button>

    </div>
  );
};

export default TexasBot;
