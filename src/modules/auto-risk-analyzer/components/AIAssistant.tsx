import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRiskStore } from '../store/useRiskStore';

export default function AIAssistant() {
  const { messages, addMessage } = useRiskStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = { role: 'user' as const, text: input };
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);
    
    try {
      // Use Puter.js AI Chat (No API Key Required)
      const prompt = `
        You are MrTechSysGPT, a professional senior insurance risk analyst. 
        Your goal is to provide educational, context-aware explanations about auto insurance.
        
        FORMATTING RULES:
        1. Use clean, readable paragraphs.
        2. Break complex feedback into clearly separated sections with bold headings.
        3. Use bullet points for lists of coverage issues or recommendations.
        4. Maintain a professional, advisory, and authoritative tone.
        5. Avoid dense blocks of text and run-on sentences.
        6. Use headings like "Coverage Gaps," "Risk Exposure," or "Professional Recommendations."
        
        USER QUESTION: ${input}
      `;
      
      const response = await puter.ai.chat(prompt);
      addMessage({ role: 'assistant', text: response.toString() });
    } catch {
      addMessage({ role: 'assistant', text: "I'm having trouble connecting to my intelligence core. Please try again in a moment." });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--color-gold)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 25px rgba(212, 175, 55, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isOpen ? <X color="black" /> : <MessageSquare color="black" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '30px',
              width: '400px',
              height: '600px',
              background: 'var(--color-black)',
              border: '1px solid #333',
              borderRadius: '24px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #222', background: 'linear-gradient(90deg, #111, #000)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-gold)', boxShadow: '0 0 15px var(--color-gold)' }} />
                <h3 className="text-gold" style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.1em' }}>MRTECHSYS <span style={{ color: 'white' }}>GPT</span></h3>
              </div>
              <p className="text-grey" style={{ margin: '4px 0 0 22px', fontSize: '0.7rem', textTransform: 'uppercase' }}>Sovereign Risk Intelligence</p>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.role === 'user' ? 'var(--color-gold)' : 'rgba(255,255,255,0.05)',
                  color: msg.role === 'user' ? 'black' : '#eee',
                  padding: '14px 18px',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  border: msg.role === 'assistant' ? '1px solid #222' : 'none',
                  boxShadow: msg.role === 'assistant' ? '0 4px 15px rgba(0,0,0,0.3)' : 'none'
                }}>
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '20px 20px 20px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 className="animate-spin text-gold" size={16} />
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>Analyzing...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid #222', display: 'flex', gap: '1rem', background: '#080808' }}>
              <input 
                className="input-field" 
                style={{ padding: '14px', borderRadius: '12px', background: '#111' }} 
                placeholder="Ask about Bodily Injury, PIP..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="btn-primary"
                style={{ borderRadius: '12px', padding: '0 18px', height: 'auto' }}
                disabled={isTyping}
              >
                <Send size={20} color="black" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
