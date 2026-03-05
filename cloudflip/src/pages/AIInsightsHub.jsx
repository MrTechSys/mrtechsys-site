import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Users,
  DollarSign,
  Zap,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Lightbulb,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const insightTypeConfig = {
  revenue_opportunity: { icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  customer_behavior: { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  market_trend: { icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  operational_efficiency: { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  risk_alert: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  upsell_suggestion: { icon: Target, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  cross_sell_suggestion: { icon: Target, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/30" }
};

export default function AIInsightsHub() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch insights
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['ai-insights', user?.current_org_id, filter],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      
      const filterConditions = { org_id: user.current_org_id };
      if (filter !== 'all') {
        filterConditions.status = filter;
      }
      
      return await api.entities.AIInsight.filter(filterConditions, '-created_date', 100);
    },
    enabled: !!user?.current_org_id
  });

  // Update insight status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ insightId, status }) => {
      return await api.entities.AIInsight.update(insightId, {
        status,
        actioned_by: user.id,
        actioned_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-insights']);
      toast.success("Insight updated!");
    }
  });

  // Generate new insights (AI-powered)
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.functions.invoke('generateAIInsights', {
        orgId: user.current_org_id
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-insights']);
      toast.success("New insights generated!");
    }
  });

  const filteredInsights = insights.filter(insight => {
    if (filter === 'all') return true;
    return insight.status === filter;
  });

  // Group insights by type
  const insightsByType = filteredInsights.reduce((acc, insight) => {
    const type = insight.insight_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(insight);
    return acc;
  }, {});

  // Calculate total potential value
  const totalPotentialValue = filteredInsights.reduce((sum, insight) => 
    sum + (insight.estimated_value || 0), 0
  );

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white/60">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              AI <span className="text-purple-400">Insights Hub</span>
            </h1>
            <p className="text-white/60">Proactive intelligence to drive revenue and optimize operations</p>
          </div>
          <Button
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generateInsightsMutation.isPending ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase">Potential Value</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${(totalPotentialValue / 1000).toFixed(1)}K
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase">Active Insights</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {insights.filter(i => i.status === 'new').length}
                  </p>
                </div>
                <Lightbulb className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase">Actioned</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {insights.filter(i => i.status === 'actioned').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase">Avg Confidence</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {insights.length > 0 
                      ? Math.round((insights.reduce((sum, i) => sum + (i.confidence_score || 0), 0) / insights.length) * 100)
                      : 0}%
                  </p>
                </div>
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'new', 'viewed', 'actioned', 'dismissed'].map(status => (
            <Button
              key={status}
              onClick={() => setFilter(status)}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              className={filter === status ? '' : 'border-white/10 text-white/70 hover:bg-white/5'}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Insights Grid */}
        <div className="space-y-6">
          {Object.entries(insightsByType).map(([type, typeInsights]) => {
            const config = insightTypeConfig[type] || insightTypeConfig.operational_efficiency;
            const Icon = config.icon;

            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <h2 className="text-xl font-bold text-white">
                    {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h2>
                  <Badge className={`${config.bg} ${config.color} border-0`}>
                    {typeInsights.length}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {typeInsights.map(insight => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card className={`${config.bg} ${config.border} border hover:scale-105 transition-transform`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-white text-base mb-1">
                                  {insight.title}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-white/10 text-white text-xs">
                                    {Math.round((insight.confidence_score || 0) * 100)}% confidence
                                  </Badge>
                                  {insight.estimated_value > 0 && (
                                    <Badge className="bg-green-500/20 text-green-400 text-xs">
                                      +${(insight.estimated_value / 1000).toFixed(1)}K
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => updateStatusMutation.mutate({ insightId: insight.id, status: 'dismissed' })}
                                className="text-white/40 hover:text-white/70 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-white/70 text-sm mb-4 leading-relaxed">
                              {insight.description}
                            </p>

                            {insight.recommended_actions && insight.recommended_actions.length > 0 && (
                              <div className="space-y-2">
                                {insight.recommended_actions.slice(0, 2).map((action, idx) => (
                                  <div key={idx}>
                                    {action.page_route ? (
                                      <Link to={createPageUrl(action.page_route)}>
                                        <Button
                                          size="sm"
                                          className={`w-full ${config.bg} ${config.color} hover:brightness-110`}
                                          onClick={() => updateStatusMutation.mutate({ insightId: insight.id, status: 'actioned' })}
                                        >
                                          {action.action}
                                          <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                      </Link>
                                    ) : (
                                      <Button
                                        size="sm"
                                        className={`w-full ${config.bg} ${config.color}`}
                                        onClick={() => {
                                          updateStatusMutation.mutate({ insightId: insight.id, status: 'actioned' });
                                          toast.success("Action recorded!");
                                        }}
                                      >
                                        {action.action}
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                              <span className="text-white/40 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(insight.created_date).toLocaleDateString()}
                              </span>
                              {insight.impact_score && (
                                <Badge className="bg-white/10 text-white text-xs">
                                  Impact: {insight.impact_score}/10
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInsights.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">No insights yet</h3>
              <p className="text-white/60 mb-6">
                Click "Generate Insights" to let AI analyze your business data
              </p>
              <Button
                onClick={() => generateInsightsMutation.mutate()}
                disabled={generateInsightsMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}