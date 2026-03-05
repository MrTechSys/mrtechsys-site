import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Loader2,
  FileText,
  Clock,
  BarChart3,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const quickActions = [
  { label: "Draft a quote for a 3-room carpet cleaning", icon: FileText },
  { label: "Summarize this week's jobs and revenue", icon: BarChart3 },
  { label: "Remind me to follow up with Maria next Thursday", icon: Clock },
];

export default function AIAdminAssistant({ compact = false }) {
  const [task, setTask] = useState("");
  const [conversation, setConversation] = useState([]);
  const queryClient = useQueryClient();

  const assistantMutation = useMutation({
    mutationFn: async (userTask) => {
      const response = await api.functions.invoke('aiAdminAssistant', {
        task: userTask,
        context: {}
      });
      return response.data;
    },
    onSuccess: (data) => {
      setConversation(prev => [...prev, {
        type: 'response',
        taskType: data.task_type,
        result: data.result,
        timestamp: new Date()
      }]);
      setTask("");
    },
    onError: (error) => {
      toast.error(`Assistant error: ${error.message}`);
    }
  });

  const handleSubmit = (userTask = task) => {
    if (!userTask.trim()) return;

    setConversation(prev => [...prev, {
      type: 'user',
      message: userTask,
      timestamp: new Date()
    }]);

    assistantMutation.mutate(userTask);
  };

  const handleQuickAction = (action) => {
    setTask(action);
    handleSubmit(action);
  };

  const handleCreateQuote = async (quoteData) => {
    try {
      const user = await api.auth.me();
      await api.entities.Quote.create({
        org_id: user.current_org_id,
        ...quoteData,
        status: 'draft'
      });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success("Quote draft created!");
    } catch (error) {
      toast.error("Failed to create quote");
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const user = await api.auth.me();
      await api.entities.Task.create({
        org_id: user.current_org_id,
        title: taskData.action,
        description: taskData.notes,
        due_date: taskData.due_date,
        priority: taskData.priority || 'medium',
        status: 'todo'
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Reminder created!");
    } catch (error) {
      toast.error("Failed to create reminder");
    }
  };

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">AI Assistant</h3>
              <p className="text-white/60 text-xs">Ask me anything</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="What can I help with?"
              className="bg-white/5 border-purple-500/30 text-white text-sm"
            />
            <Button
              onClick={() => handleSubmit()}
              disabled={assistantMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white"
            >
              {assistantMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Button
                  key={idx}
                  onClick={() => handleQuickAction(action.label)}
                  variant="outline"
                  className="h-auto py-3 px-4 border-purple-500/30 text-white hover:bg-purple-500/10 justify-start text-left"
                >
                  <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Ask me anything... e.g., 'Create a quote for lawn mowing' or 'What were my sales this week?'"
              className="bg-white/5 border-purple-500/30 text-white"
            />
            <Button
              onClick={() => handleSubmit()}
              disabled={assistantMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
            >
              {assistantMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Ask
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversation */}
      <AnimatePresence>
        {conversation.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {msg.type === 'user' ? (
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <p className="text-white">{msg.message}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
                <CardContent className="p-6">
                  {/* Quote Response */}
                  {msg.taskType === 'quote' && msg.result.quote_title && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1">{msg.result.quote_title}</h3>
                          <p className="text-white/70 text-sm mb-4">{msg.result.description}</p>

                          <div className="space-y-2 mb-4">
                            {(msg.result.line_items || []).map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded">
                                <div>
                                  <p className="text-white text-sm font-medium">{item.name}</p>
                                  <p className="text-white/60 text-xs">{item.description}</p>
                                </div>
                                <p className="text-white font-bold">
                                  ${(item.quantity * item.unit_price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/70">Subtotal</span>
                              <span className="text-white">${msg.result.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/70">Tax</span>
                              <span className="text-white">${msg.result.tax?.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <span className="text-white font-bold">Total</span>
                              <span className="text-green-400 font-bold text-xl">${msg.result.total?.toFixed(2)}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleCreateQuote(msg.result)}
                            className="mt-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold w-full"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Create Quote Draft
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reminder Response */}
                  {msg.taskType === 'reminder' && msg.result.person_name && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold mb-3">Reminder Created</h3>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                              <p className="text-white/60 text-xs mb-1">Person</p>
                              <p className="text-white font-medium">{msg.result.person_name}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                              <p className="text-white/60 text-xs mb-1">Due Date</p>
                              <p className="text-white font-medium">{msg.result.due_date}</p>
                            </div>
                          </div>

                          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-4">
                            <p className="text-blue-400 text-sm font-medium mb-1">Action:</p>
                            <p className="text-white/80">{msg.result.action}</p>
                          </div>

                          <Button
                            onClick={() => handleCreateTask(msg.result)}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold w-full"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Add to Tasks
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary Response */}
                  {msg.taskType === 'summary' && msg.result.summary && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-3">Business Summary</h3>
                          
                          <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
                            <p className="text-white/90 leading-relaxed">{msg.result.summary}</p>
                          </div>

                          {msg.result.key_metrics && (
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                                <p className="text-2xl font-bold text-white">{msg.result.key_metrics.jobs_completed || 0}</p>
                                <p className="text-white/60 text-xs">Jobs</p>
                              </div>
                              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                                <p className="text-2xl font-bold text-white">${(msg.result.key_metrics.revenue || 0).toLocaleString()}</p>
                                <p className="text-white/60 text-xs">Revenue</p>
                              </div>
                              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-center">
                                <p className="text-2xl font-bold text-white">{msg.result.key_metrics.new_clients || 0}</p>
                                <p className="text-white/60 text-xs">New Clients</p>
                              </div>
                            </div>
                          )}

                          {(msg.result.insights || []).length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-white/70 font-medium text-sm mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                Key Insights
                              </h4>
                              <div className="space-y-2">
                                {msg.result.insights.map((insight, i) => (
                                  <div key={i} className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                    <p className="text-white/80 text-sm flex items-start gap-2">
                                      <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                      {insight}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(msg.result.recommendations || []).length > 0 && (
                            <div>
                              <h4 className="text-white/70 font-medium text-sm mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-400" />
                                Recommendations
                              </h4>
                              <div className="space-y-2">
                                {msg.result.recommendations.map((rec, i) => (
                                  <div key={i} className="p-2 bg-amber-500/10 rounded border border-amber-500/20">
                                    <p className="text-white/80 text-sm flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                      {rec}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General Response */}
                  {msg.taskType === 'general' && msg.result.response && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-400 mt-1" />
                        <p className="text-white/90 flex-1">{msg.result.response}</p>
                      </div>

                      {(msg.result.suggested_actions || []).length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-white/70 text-sm font-medium">Suggested Actions:</p>
                          {msg.result.suggested_actions.map((action, i) => (
                            <div key={i} className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                              <p className="text-white/80 text-sm">• {action}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}