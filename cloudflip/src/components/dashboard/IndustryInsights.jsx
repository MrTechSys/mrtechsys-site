
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Lightbulb,
  Target,
  DollarSign,
  Users,
  Sparkles,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function IndustryInsights({ industry }) {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (industry) {
      fetchIndustryData();
    }
  }, [industry]);

  const fetchIndustryData = async () => {
    setLoading(true);
    try {
      const response = await api.functions.invoke('scrapeIndustryData', { industry });
      if (response.data?.success) {
        setLiveData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch industry data:', error);
      toast.error('Failed to load industry insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-[#0a1929]/60 to-[#1a2744]/60 backdrop-blur border-[#3cf7d4]/30">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#3cf7d4] animate-spin mb-4" />
          <p className="text-white/70 text-sm">Researching {industry} industry...</p>
        </CardContent>
      </Card>
    );
  }

  if (!liveData) {
    return null;
  }

  const keyMetrics = Array.isArray(liveData?.key_metrics) ? liveData.key_metrics : [];
  const strategicInsights = Array.isArray(liveData?.strategic_insights) ? liveData.strategic_insights : [];
  const recommendedActions = Array.isArray(liveData?.recommended_actions) ? liveData.recommended_actions : [];
  const techTrends = Array.isArray(liveData?.tech_trends) ? liveData.tech_trends : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-[#0a1929]/60 to-[#1a2744]/60 backdrop-blur border-[#3cf7d4]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#3cf7d4]" />
              Industry Insights
              <Badge className="bg-[#3cf7d4]/20 text-[#3cf7d4] ml-2">
                {liveData.industry_name || industry}
              </Badge>
            </CardTitle>
            <Button
              onClick={fetchIndustryData}
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {liveData.market_overview && (
            <div className="p-4 bg-[#3cf7d4]/10 rounded-lg border border-[#3cf7d4]/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#3cf7d4]" />
                <span className="text-[#3cf7d4] font-medium text-sm">Market Overview</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{liveData.market_overview}</p>
            </div>
          )}

          {liveData.seasonal_trends && (
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium text-sm">Seasonal Trends</span>
              </div>
              <p className="text-white/80 text-sm">{liveData.seasonal_trends}</p>
            </div>
          )}

          {keyMetrics.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3">Industry Benchmarks</h4>
              <div className="grid grid-cols-2 gap-3">
                {keyMetrics.slice(0, 4).map((metric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="p-3 bg-white/5 rounded-lg text-center"
                  >
                    <p className="text-white/60 text-xs mb-1">{metric?.metric_name || 'Metric'}</p>
                    <p className="text-xl font-bold text-[#f4d35e]">{metric?.average_value || 'N/A'}</p>
                    <p className="text-green-400 text-xs mt-1">{metric?.trend || ''}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {strategicInsights.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3">Strategic Insights</h4>
              <div className="space-y-2">
                {strategicInsights.slice(0, 4).map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-start gap-2 p-2 bg-white/5 rounded"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/80 text-sm">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {recommendedActions.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                {recommendedActions.slice(0, 3).map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm mb-1">{item?.action || 'Action'}</p>
                        <p className="text-white/60 text-xs">
                          Impact: {item?.impact || 'Medium'} • Difficulty: {item?.difficulty || 'Medium'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {techTrends.length > 0 && (
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-medium text-sm">Technology Trends</span>
              </div>
              <ul className="space-y-1">
                {techTrends.slice(0, 3).map((trend, idx) => (
                  <li key={idx} className="text-white/80 text-xs flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
