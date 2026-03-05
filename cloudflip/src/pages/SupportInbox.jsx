
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Sparkles, ThumbsUp, ThumbsDown, Send, BookOpen, AlertTriangle, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function SupportInbox() {
  const [user, setUser] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: tickets = [] } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => api.entities.SupportTicket.filter({
      org_id: user?.current_org_id
    }, '-created_date'),
    enabled: !!user
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ['ai-suggestions', selectedTicket?.id],
    queryFn: () => api.entities.AISuggestion.filter({
      ticket_id: selectedTicket?.id
    }),
    enabled: !!selectedTicket
  });

  // Filter tickets by search
  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.ticket_number?.toLowerCase().includes(query) ||
      ticket.subject?.toLowerCase().includes(query) ||
      ticket.body?.toLowerCase().includes(query) ||
      ticket.requester_email?.toLowerCase().includes(query) ||
      ticket.requester_name?.toLowerCase().includes(query)
    );
  });

  const handleGenerateSuggestions = async () => {
    if (!selectedTicket) return;
    
    setGeneratingSuggestions(true);
    try {
      await api.functions.invoke('autoReplyGenerator', { ticketId: selectedTicket.id });
      await api.functions.invoke('sentimentAnalyzer', { ticketId: selectedTicket.id });
      await api.functions.invoke('kbSuggester', { ticketId: selectedTicket.id });
      
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
      console.error(error);
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleApplySuggestion = (suggestion) => {
    setReplyDraft(suggestion.content);
  };

  const sentimentColor = (score) => {
    if (!score) return 'bg-gray-500/20 text-gray-400';
    if (score > 0.3) return 'bg-green-500/20 text-green-400';
    if (score > -0.3) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Mail className="w-8 h-8 text-[#f4d35e]" />
          Support <span className="text-[#f4d35e]">Inbox</span>
        </h1>
        <p className="text-white/70 mt-1">AI-powered customer support</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <div className="space-y-3">
                <CardTitle className="text-white text-sm">Tickets ({filteredTickets.length})</CardTitle>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tickets, emails, subjects..."
                    className="pl-10 bg-white/5 border-[#f4d35e]/30 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-3 text-left rounded-lg border transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-[#f4d35e]/20 border-[#f4d35e]'
                      : 'bg-white/5 border-[#f4d35e]/10 hover:border-[#f4d35e]/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-white font-medium text-sm">{ticket.ticket_number}</span>
                    {ticket.sentiment_score !== null && (
                      <Badge className={`${sentimentColor(ticket.sentiment_score)} text-xs`}>
                        {ticket.emotion || 'neutral'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-white/80 text-sm truncate">{ticket.subject}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-xs ${
                      ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {ticket.priority}
                    </Badge>
                    <Badge className="bg-white/10 text-white/70 text-xs">
                      {ticket.status}
                    </Badge>
                  </div>
                </button>
              ))}

              {filteredTickets.length === 0 && (
                <p className="text-white/60 text-center py-8 text-sm">
                  {searchQuery ? 'No tickets match your search' : 'No tickets yet'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail & AI Suggestions */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedTicket ? (
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-12 text-center">
                <Mail className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Select a ticket to view details</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Ticket Content */}
              <Card className="bg-white/5 border-[#f4d35e]/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{selectedTicket.subject}</CardTitle>
                    <Button
                      onClick={handleGenerateSuggestions}
                      disabled={generatingSuggestions}
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                    >
                      {generatingSuggestions ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Suggestions
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-white/60 text-sm">From: {selectedTicket.requester_name}</p>
                    <p className="text-white/60 text-sm">Email: {selectedTicket.requester_email}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-white">{selectedTicket.body}</p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <Card className="bg-white/5 border-[#f4d35e]/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-sm">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      AI Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {suggestions.filter(s => s.suggestion_type === 'reply').map((sug, idx) => (
                      <div key={sug.id} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            Option {idx + 1} • {(sug.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-white/80 text-sm mb-3">{sug.content}</p>
                        <Button
                          size="sm"
                          onClick={() => handleApplySuggestion(sug)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Apply to Draft
                        </Button>
                      </div>
                    ))}

                    {suggestions.filter(s => s.suggestion_type === 'kb_article').length > 0 && (
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-white/60 text-xs mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Relevant KB Articles
                        </p>
                        <div className="space-y-2">
                          {suggestions.filter(s => s.suggestion_type === 'kb_article').map((sug) => (
                            <div key={sug.id} className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-sm">
                              <p className="text-blue-400">{sug.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Reply Draft */}
              <Card className="bg-white/5 border-[#f4d35e]/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Reply</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder="Type your reply..."
                    rows={8}
                    className="bg-white/5 border-[#f4d35e]/30 text-white"
                  />
                  <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Powered by MrTechSys */}
      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#f4d35e]/90 to-[#f4d35e]/70 backdrop-blur border border-[#f4d35e]/50 shadow-lg">
          <div className="flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/4f2a625b6_MrTechSys-Naked-Logo.png"
              alt="MrTechSys"
              className="w-4 h-4 object-contain"
            />
            <span className="text-[#0a1929] font-bold text-xs">Powered by MrTechSys</span>
            <Sparkles className="w-3 h-3 text-[#0a1929]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
