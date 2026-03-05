import React from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  Brain,
  Target,
  Lock,
  Zap,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function AIThreatPredictions() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['threat-predictions'],
    queryFn: async () => {
      const response = await api.functions.invoke('predictSecurityThreats', {});
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-red-500/30 backdrop-blur">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.success) {
    return null;
  }

  const predictions = data.predictions;
  const vulnerability = predictions.vulnerability_assessment;

  return (
    <div className="space-y-6">
      {/* Threat Predictions */}
      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur border-2 border-red-500/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-red-400" />
              AI Threat Predictions
              <Badge className="bg-red-500/20 text-red-400 ml-2">Next 72hrs</Badge>
            </CardTitle>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/80 text-sm leading-relaxed">
              {predictions.threat_landscape_summary}
            </p>
          </div>

          {predictions.predicted_threats?.map((threat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-white/5 rounded-lg border border-red-500/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium flex items-center gap-2">
                    {threat.threat_type}
                    <Badge className={`text-xs ${
                      threat.severity === 'critical' ? 'bg-red-500/30 text-red-300' :
                      threat.severity === 'high' ? 'bg-orange-500/30 text-orange-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {threat.severity}
                    </Badge>
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/50 mb-1">Probability</div>
                  <div className="text-white font-bold">{(threat.probability * 100).toFixed(0)}%</div>
                </div>
              </div>

              <p className="text-white/70 text-sm mb-3">{threat.description}</p>

              {threat.indicators?.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-white/50 mb-1">Indicators:</div>
                  <div className="flex flex-wrap gap-1">
                    {threat.indicators.map((indicator, i) => (
                      <Badge key={i} className="bg-red-500/20 text-red-400 text-xs">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                <Lock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-amber-400 text-xs">{threat.mitigation}</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Vulnerability Assessment */}
      <Card className="bg-white/5 border-amber-500/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Vulnerability Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">Overall Risk Score</span>
              <span className="text-2xl font-bold text-amber-400">
                {vulnerability?.risk_score || 0}/100
              </span>
            </div>
            <Progress value={vulnerability?.risk_score || 0} className="h-2" />
          </div>

          {vulnerability?.exposed_endpoints?.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-xs mb-2">Exposed Endpoints</h4>
              <div className="space-y-1">
                {vulnerability.exposed_endpoints.map((endpoint, idx) => (
                  <div key={idx} className="p-2 bg-red-500/10 rounded border border-red-500/20 font-mono text-xs text-red-400">
                    {endpoint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {vulnerability?.weak_points?.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-xs mb-2">Security Weak Points</h4>
              <div className="space-y-2">
                {vulnerability.weak_points.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-white/5 rounded">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 text-xs">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {predictions?.proactive_measures?.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-xs mb-2">Recommended Actions</h4>
              <div className="space-y-2">
                {predictions.proactive_measures.slice(0, 3).map((measure, idx) => (
                  <div key={idx} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">{measure.measure}</span>
                      <Badge className="bg-white/10 text-white text-xs">{measure.priority}</Badge>
                    </div>
                    <p className="text-white/60 text-xs">{measure.implementation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emerging Threats */}
      {predictions?.emerging_threats?.length > 0 && (
        <Card className="bg-white/5 border-purple-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Emerging Threats
              <Badge className="bg-purple-500/20 text-purple-400 ml-auto">Global Intel</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {predictions.emerging_threats.map((threat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-2 p-2 bg-purple-500/10 rounded"
                >
                  <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{threat}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}