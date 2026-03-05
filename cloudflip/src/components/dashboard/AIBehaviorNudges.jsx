
import React from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  AlertTriangle,
  Lightbulb,
  TrendingDown,
  Zap,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIBehaviorNudges() {
  const { data, isLoading } = useQuery({
    queryKey: ['behavior-anomalies'],
    queryFn: async () => {
      const response = await api.functions.invoke('detectBehaviorAnomalies', {});
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000 // Every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const safeNudges = Array.isArray(data?.nudges) ? data.nudges : [];
  
  if (!data?.success || safeNudges.length === 0) {
    return null;
  }

  const healthScore = data.health_score || 75;
  
  const getHealthColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
    if (score >= 60) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
  };

  const healthColors = getHealthColor(healthScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI Behavior Analysis
            </CardTitle>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${healthColors.bg} border ${healthColors.border}`}>
              <div className={`w-2 h-2 rounded-full ${healthColors.text.replace('text-', 'bg-')} animate-pulse`} />
              <span className={`${healthColors.text} font-medium text-sm`}>
                Health: {healthScore}%
              </span>
            </div>
          </div>
          {data.health_summary && (
            <p className="text-white/60 text-sm mt-2">{data.health_summary}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3">
          {safeNudges.map((nudge, idx) => {
            const getIcon = (type) => {
              if (type === 'anomaly' || type === 'warning') return AlertTriangle;
              if (type === 'opportunity') return Lightbulb;
              return Brain;
            };

            const getColors = (impact) => {
              if (impact === 'critical' || impact === 'high') 
                return { bg: 'from-red-500/10 to-orange-500/10', border: 'border-red-500/30', icon: 'text-red-400' };
              if (impact === 'medium')
                return { bg: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-500/30', icon: 'text-amber-400' };
              return { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/30', icon: 'text-blue-400' };
            };

            const Icon = getIcon(nudge?.type);
            const colors = getColors(nudge?.impact_level);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 bg-gradient-to-br ${colors.bg} rounded-lg border ${colors.border}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${colors.icon} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-white font-medium text-sm">{nudge?.title || 'Behavior Insight'}</h4>
                      <Badge className={`${colors.bg} ${colors.icon} text-xs shrink-0`}>
                        {nudge?.impact_level || 'low'}
                      </Badge>
                    </div>
                    <p className="text-white/70 text-xs mb-2">{nudge?.description || ''}</p>
                    
                    {nudge?.data_supporting && (
                      <p className="text-white/50 text-xs italic mb-3">{nudge.data_supporting}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                      <p className="text-amber-400 text-xs font-medium">{nudge?.recommended_action || 'Review recommended'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
