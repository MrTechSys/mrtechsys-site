
import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Target,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIDashboardSummary() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await api.functions.invoke('generateDashboardSummary', {});
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000 // Auto-refresh every 10 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-amber-500/30">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
          <p className="text-white/70">AI analyzing your business data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.success) {
    return null;
  }

  const summary = data.summary || {};
  const keyInsights = Array.isArray(summary.key_insights) ? summary.key_insights : [];
  const actionItems = Array.isArray(summary.action_items) ? summary.action_items : [];
  const trends = summary.trends || {};
  const improvingTrends = Array.isArray(trends.improving) ? trends.improving : [];
  const decliningTrends = Array.isArray(trends.declining) ? trends.declining : [];
  const stableTrends = Array.isArray(trends.stable) ? trends.stable : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-blue-500/30 relative overflow-hidden">
        {/* Animated glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-full blur-3xl" />
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              AI Executive Briefing
              <Badge className="bg-amber-500/20 text-amber-400 ml-2">Live</Badge>
            </CardTitle>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {/* Executive Summary */}
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-semibold">Summary</h3>
            </div>
            <p className="text-white/90 leading-relaxed">{summary.executive_summary || 'Analyzing your business performance...'}</p>
          </div>

          {/* Key Insights */}
          {keyInsights.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3">Key Insights</h4>
              <div className="space-y-2">
                {keyInsights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-white text-sm">{insight?.insight || 'Insight'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-[#3cf7d4]/20 text-[#3cf7d4] text-xs">
                            {insight?.metric || 'metric'}
                          </Badge>
                          <span className="text-white/50 text-xs">{insight?.impact || ''}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {actionItems.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Priority Actions
              </h4>
              <div className="space-y-2">
                {actionItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      item?.priority === 'high' || item?.priority === 'urgent'
                        ? 'bg-red-500/10 border-red-500/30'
                        : item?.priority === 'medium'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{item?.action || 'Action'}</p>
                        <p className="text-white/60 text-xs mt-1">{item?.expected_outcome || ''}</p>
                      </div>
                      <Badge className={`${
                        item?.priority === 'high' || item?.priority === 'urgent'
                          ? 'bg-red-500/20 text-red-400'
                          : item?.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      } text-xs shrink-0`}>
                        {item?.priority || 'low'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Trends */}
          <div>
            <h4 className="text-white/70 font-medium text-sm mb-3">Trend Analysis</h4>
            <div className="grid md:grid-cols-3 gap-3">
              {improvingTrends.length > 0 && (
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium text-xs">Improving</span>
                  </div>
                  <ul className="space-y-1">
                    {improvingTrends.map((trend, idx) => (
                      <li key={idx} className="text-white/80 text-xs">• {trend}</li>
                    ))}
                  </ul>
                </div>
              )}

              {decliningTrends.length > 0 && (
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-medium text-xs">Needs Attention</span>
                  </div>
                  <ul className="space-y-1">
                    {decliningTrends.map((trend, idx) => (
                      <li key={idx} className="text-white/80 text-xs">• {trend}</li>
                    ))}
                  </ul>
                </div>
              )}

              {stableTrends.length > 0 && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium text-xs">Stable</span>
                  </div>
                  <ul className="space-y-1">
                    {stableTrends.map((trend, idx) => (
                      <li key={idx} className="text-white/80 text-xs">• {trend}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Forecast */}
          {summary.weekly_forecast && (
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-medium text-sm">This Week's Forecast</span>
              </div>
              <p className="text-white/80 text-sm">{summary.weekly_forecast}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
