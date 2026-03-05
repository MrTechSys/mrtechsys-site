import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Send,
  Plus,
  Hash,
  Users,
  FileText,
  Upload,
  CheckCheck,
  Check,
  Smile,
  Pin,
  MoreVertical,
  Search,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function TeamCollaboration() {
  const [user, setUser] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ['team-channels', user?.current_org_id],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      return await api.entities.TeamChannel.filter({
        org_id: user.current_org_id
      });
    },
    enabled: !!user?.current_org_id
  });

  // Fetch messages for selected channel
  const { data: messages = [] } = useQuery({
    queryKey: ['team-messages', selectedChannel?.id],
    queryFn: async () => {
      if (!selectedChannel?.id) return [];
      return await api.entities.TeamMessage.filter({
        channel_id: selectedChannel.id
      }, '-created_date', 100);
    },
    enabled: !!selectedChannel?.id,
    refetchInterval: 3000 // Real-time-ish updates
  });

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (channelData) => {
      return await api.entities.TeamChannel.create({
        org_id: user.current_org_id,
        members: [user.id],
        admins: [user.id],
        ...channelData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-channels']);
      toast.success("Channel created!");
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      return await api.entities.TeamMessage.create({
        org_id: user.current_org_id,
        channel_id: selectedChannel.id,
        sender_id: user.id,
        sender_name: user.full_name,
        content,
        read_by: [user.id]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-messages']);
      setMessageInput("");
    }
  });

  // React to message mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }) => {
      const message = messages.find(m => m.id === messageId);
      const reactions = message.reactions || [];
      const existingReaction = reactions.find(r => r.user_id === user.id && r.emoji === emoji);
      
      if (existingReaction) {
        // Remove reaction
        return await api.entities.TeamMessage.update(messageId, {
          reactions: reactions.filter(r => !(r.user_id === user.id && r.emoji === emoji))
        });
      } else {
        // Add reaction
        return await api.entities.TeamMessage.update(messageId, {
          reactions: [...reactions, { emoji, user_id: user.id, user_name: user.full_name }]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-messages']);
    }
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChannel) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleCreateChannel = () => {
    const channelName = prompt("Enter channel name:");
    if (!channelName) return;
    
    createChannelMutation.mutate({
      name: channelName.startsWith('#') ? channelName : `#${channelName}`,
      type: 'public'
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a1929]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-cyan-400" />
              Team <span className="text-cyan-400">Collaboration</span>
            </h1>
            <p className="text-white/60 text-sm">Chat, share files, and collaborate in real-time</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar - Channels */}
        <div className="w-64 border-r border-white/10 bg-[#0a1929] overflow-y-auto">
          <div className="p-4 space-y-4">
            <Button
              onClick={handleCreateChannel}
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Channel
            </Button>

            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Channels</p>
              <div className="space-y-1">
                {channels.filter(c => c.type === 'public').map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedChannel?.id === channel.id
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      <span className="text-sm">{channel.name.replace('#', '')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Direct Messages</p>
              <div className="space-y-1">
                {channels.filter(c => c.type === 'dm').map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedChannel?.id === channel.id
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">{channel.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Channel Header */}
              <div className="flex-shrink-0 border-b border-white/10 p-4 bg-[#0f1f3a]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      {selectedChannel.name.replace('#', '')}
                    </h2>
                    <p className="text-white/60 text-sm">{selectedChannel.description || 'Team channel'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                      {selectedChannel.members?.length || 0} members
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {msg.sender_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{msg.sender_name}</span>
                          <span className="text-white/40 text-xs">
                            {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.is_edited && (
                            <Badge className="bg-white/5 text-white/40 text-xs">edited</Badge>
                          )}
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{msg.content}</p>
                        
                        {/* Reactions */}
                        <div className="flex items-center gap-2 mt-2">
                          {(msg.reactions || []).reduce((acc, reaction) => {
                            const existing = acc.find(r => r.emoji === reaction.emoji);
                            if (existing) {
                              existing.count++;
                              existing.users.push(reaction.user_name);
                            } else {
                              acc.push({ emoji: reaction.emoji, count: 1, users: [reaction.user_name] });
                            }
                            return acc;
                          }, []).map((reaction, idx) => (
                            <button
                              key={idx}
                              onClick={() => addReactionMutation.mutate({ messageId: msg.id, emoji: reaction.emoji })}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs transition-all"
                              title={reaction.users.join(', ')}
                            >
                              {reaction.emoji} {reaction.count}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              const emoji = prompt("Enter emoji (e.g., 👍, ❤️, 🎉):");
                              if (emoji) addReactionMutation.mutate({ messageId: msg.id, emoji });
                            }}
                            className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
                          >
                            <Smile className="w-3 h-3 text-white/60" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex-shrink-0 border-t border-white/10 p-4 bg-[#0f1f3a]">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder={`Message #${selectedChannel.name.replace('#', '')}`}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-r from-cyan-600 to-cyan-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Select a channel to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}