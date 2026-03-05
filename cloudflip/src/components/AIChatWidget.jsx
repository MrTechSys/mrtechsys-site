import React, { useState, useRef, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Send,
  X,
  Sparkles,
  Loader2,
  Lightbulb,
  Mail,
  TrendingUp,
  CheckCircle,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const quickHelpTopics = [
  { label: "How do I create a quote?", category: "quotes" },
  { label: "How does lead scoring work?", category: "leads" },
  { label: "What are loyalty tiers?", category: "growth" },
  { label: "How do I track SEO keywords?", category: "seo" },
  { label: "Explain referral rewards", category: "referrals" },
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Load proactive suggestions when widget opens
  const suggestionsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.current_org_id) return { suggestions: [] };
      
      try {
        const { data } = await api.functions.invoke('aiAdminAssistant', {
          action: 'get_proactive_suggestions',
          orgId: user.current_org_id
        });
        return data || { suggestions: [] };
      } catch (error) {
        console.error('Suggestions error:', error);
        return { suggestions: [] };
      }
    },
    onSuccess: (data) => {
      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }
    },
    onError: (error) => {
      console.error('Failed to load suggestions:', error);
    }
  });

  useEffect(() => {
    if (isOpen && user?.current_org_id && suggestions.length === 0) {
      suggestionsMutation.mutate();
    }
  }, [isOpen, user]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage) => {
      const currentPage = location.pathname.replace('/', '') || 'Dashboard';
      
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `You are MrTechSysGPT CloudFlip Assistant, a helpful AI assistant for small business owners using the CloudFlip platform.

User is currently on: ${currentPage}
User question: "${userMessage}"

Provide a helpful, friendly response. Keep responses concise (2-3 sentences) and actionable. Suggest relevant pages they can visit if needed.

If the user asks about customer interactions, summarize recent activities.
If they ask about follow-ups, suggest personalized email drafts.
Always be proactive and business-focused.`,
      });

      return response;
    },
    onSuccess: (aiResponse) => {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, {
      type: 'user',
      content: message,
      timestamp: new Date()
    }]);

    chatMutation.mutate(message);
    setMessage("");
  };

  const handleQuickTopic = (topic) => {
    setMessage(topic);
    setTimeout(() => handleSend(), 100);
  };

  const handleSuggestionClick = (suggestion) => {
    try {
      if (suggestion.action === 'draft_email') {
        toast.success("Email draft created! Check your Communications Hub");
      } else if (suggestion.action === 'follow_up') {
        handleQuickTopic(suggestion.message || suggestion.description);
      } else {
        handleQuickTopic(suggestion.message || suggestion.description);
      }
    } catch (error) {
      console.error('Suggestion click error:', error);
    }
  };

  return (
    <>
      {/* Minimized State - Half Visible Widget */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            whileHover={{ x: -10 }}
            className="fixed bottom-8 right-0 z-50 cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <div className="relative">
              {/* Main Widget Circle - Half visible */}
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-2xl border-2 border-white/20"
                style={{
                  marginRight: '-40px',
                  filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.5)',
                    '0 0 40px rgba(236, 72, 153, 0.7)',
                    '0 0 20px rgba(168, 85, 247, 0.5)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/5fae4ab52_image.png"
                  alt="CloudFlip Assistant"
                  className="w-12 h-12 object-contain"
                  style={{
                    filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))'
                  }}
                />
              </motion.div>

              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-400"
                style={{ marginRight: '-40px' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
              />

              {/* Floating particles */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full"
                  style={{
                    right: '10px',
                    top: '50%',
                  }}
                  animate={{
                    x: [-20, -40, -20],
                    y: [
                      -30 + i * 15,
                      -40 + i * 15,
                      -30 + i * 15
                    ],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}

              {/* Hover hint text */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute right-24 top-1/2 -translate-y-1/2 bg-purple-600/90 backdrop-blur px-4 py-2 rounded-lg whitespace-nowrap"
              >
                <p className="text-white text-sm font-medium">AI Assistant - Click to chat</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: 100, y: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={{ scale: 0, opacity: 0, x: 100, y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-8 right-8 z-50 w-96 max-w-[calc(100vw-4rem)]"
          >
            <div className="bg-[#0a1929]/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/5fae4ab52_image.png"
                    alt="CloudFlip"
                    className="w-10 h-10 object-contain"
                    style={{ filter: 'brightness(1.3) drop-shadow(0 0 10px rgba(255, 255, 255, 0.9))' }}
                  />
                  <div>
                    <h3 className="text-white font-bold">MrTechSysGPT</h3>
                    <p className="text-white/80 text-xs">AI Business Assistant</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="icon"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-3 bg-[#0a1929]">
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-white font-bold mb-2">Hi! I'm MrTechSysGPT</h4>
                      <p className="text-white/60 text-sm mb-4">
                        Your AI Business Assistant - Here to help grow your business!
                      </p>
                    </div>

                    {/* Proactive Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <p className="text-amber-400 text-xs font-semibold uppercase">Suggested Actions:</p>
                        </div>
                        {suggestions.slice(0, 3).map((suggestion, idx) => (
                          <Card
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/50 cursor-pointer transition-all"
                          >
                            <div className="flex items-start gap-2">
                              {suggestion.type === 'follow_up' && <Mail className="w-4 h-4 text-cyan-400 mt-0.5" />}
                              {suggestion.type === 'lead' && <Users className="w-4 h-4 text-green-400 mt-0.5" />}
                              {suggestion.type === 'insight' && <TrendingUp className="w-4 h-4 text-purple-400 mt-0.5" />}
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">{suggestion.title}</p>
                                <p className="text-white/60 text-xs mt-1">{suggestion.description}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-2 mt-4">
                      <p className="text-white/50 text-xs uppercase tracking-wide">Quick Help:</p>
                      {quickHelpTopics.map((topic, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickTopic(topic.label)}
                          className="block w-full p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-all text-left"
                        >
                          <span className="text-white/80 text-sm">{topic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-xl p-3 ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                        : 'bg-white/10 text-white/90 border border-purple-500/20'
                    }`}>
                      {msg.type === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-400 font-medium text-xs">MrTechSysGPT</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.actions && Array.isArray(msg.actions) && msg.actions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.actions.map((action, i) => (
                            <Button
                              key={i}
                              size="sm"
                              variant="outline"
                              className="w-full text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                              onClick={() => handleSuggestionClick(action)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      <p className={`text-xs mt-2 ${msg.type === 'user' ? 'text-white/60' : 'text-white/40'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 rounded-xl p-3 border border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        <span className="text-white/70 text-sm">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-purple-500/20 p-4 bg-[#0a1929]">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Ask me anything..."
                    className="bg-white/5 border-purple-500/30 text-white placeholder:text-white/40"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={chatMutation.isPending || !message.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  Get insights, draft emails, and manage your business with AI
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}