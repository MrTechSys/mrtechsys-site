import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, TrendingUp, Cpu, Database, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AIPerformanceInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: predictions = [] } = useQuery({
    queryKey: ['predicted-incidents'],
    queryFn: () => api.entities.PredictedIncident.filter({ status: 'active' }, '-probability', 10)
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['multivariate-anomalies'],
    queryFn: () => api.entities.MultiVariateAnomaly.filter({ status: 'detected' }, '-severity_score', 10)
  });

  const { data: forecasts = [] } = useQuery({
    queryKey: ['capacity-forecasts'],
    queryFn: () => api.entities.CapacityForecast.list('-generated_at', 5)
  });

  useEffect(() => {
    generateInsights();
  }, [predictions, anomalies, forecasts]);

  const generateInsights = async () => {
    if (predictions.length === 0 && anomalies.length === 0) return;

    setLoading(true);
    try {
      const { data } = await api.functions.invoke('sreAutomationEngine', {
        action: 'performance_insights',
        predictions: predictions,
        anomalies: anomalies
      });
      
      setInsights(data);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoRemediate = async (anomalyId) => {
    try {
      await api.functions.invoke('autoRemediationEngine', {
        anomaly_id: anomalyId
      });
      toast.success("Auto-remediation initiated!");
    } catch (error) {
      toast.error("Remediation failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Predictions */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Performance Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <p className="text-white/60 text-sm text-center py-4">
              ✨ All systems running optimally. No incidents predicted.
            </p>
          ) : (
            <div className="space-y-3">
              {predictions.map((pred, idx) => (
                <motion.div
                  key={pred.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-white/5 rounded-lg border border-purple-500/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium capitalize">
                        {pred.incident_type.replace(/_/g, ' ')}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={`${
                          pred.probability > 0.8 ? 'bg-red-500/20 text-red-400' :
                          pred.probability > 0.6 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {(pred.probability * 100).toFixed(0)}% probability
                        </Badge>
                        <span className="text-white/60 text-sm">
                          ETA: {pred.time_to_incident}h
                        </span>
                      </div>
                    </div>
                  </div>

                  {pred.predicted_impact && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded mb-3">
                      <p className="text-red-400 text-xs font-medium mb-1">⚠️ Predicted Impact:</p>
                      <ul className="text-white/70 text-xs space-y-1">
                        {pred.predicted_impact.affected_users && (
                          <li>👥 {pred.predicted_impact.affected_users} users affected</li>
                        )}
                        {pred.predicted_impact.estimated_downtime_minutes && (
                          <li>⏱️ {pred.predicted_impact.estimated_downtime_minutes} min downtime</li>
                        )}
                        {pred.predicted_impact.sla_breach_risk && (
                          <li>🚨 SLA breach risk</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {pred.remediation_steps && pred.remediation_steps.length > 0 && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                      <p className="text-green-400 text-xs font-medium mb-2">💡 Recommended Actions:</p>
                      <ul className="space-y-1">
                        {pred.remediation_steps.slice(0, 3).map((step, i) => (
                          <li key={i} className="text-white/70 text-xs flex items-start gap-2">
                            <span className="text-green-400">•</span>
                            {step.step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multivariate Anomalies */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Performance Anomalies Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <p className="text-white/60 text-sm text-center py-4">
              No anomalies detected
            </p>
          ) : (
            <div className="space-y-3">
              {anomalies.map((anomaly, idx) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-white/5 rounded-lg border border-amber-500/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium capitalize mb-2">
                        {anomaly.pattern_type.replace(/_/g, ' ')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {anomaly.correlated_metrics?.slice(0, 4).map((metric, i) => (
                          <div key={i} className="text-xs">
                            <p className="text-white/50">{metric.metric}</p>
                            <p className="text-amber-400 font-semibold">
                              {metric.deviation_pct > 0 ? '+' : ''}{metric.deviation_pct.toFixed(1)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Badge className={`${
                      anomaly.severity_score > 80 ? 'bg-red-500/20 text-red-400' :
                      anomaly.severity_score > 60 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {anomaly.severity_score.toFixed(0)} severity
                    </Badge>
                  </div>

                  {anomaly.ai_hypothesis && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded mb-3">
                      <p className="text-blue-400 text-xs font-medium mb-1">🤖 AI Analysis:</p>
                      <p className="text-white/70 text-xs">{anomaly.ai_hypothesis.root_cause}</p>
                      {anomaly.ai_hypothesis.recommendation && (
                        <p className="text-white/60 text-xs mt-2">
                          💡 {anomaly.ai_hypothesis.recommendation}
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    size="sm"
                    onClick={() => handleAutoRemediate(anomaly.id)}
                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    Auto-Remediate
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Optimization */}
      {forecasts.length > 0 && (
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Resource Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecasts.map((forecast, idx) => (
                <div key={idx} className="p-4 bg-white/5 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium capitalize">{forecast.metric.replace(/_/g, ' ')}</h4>
                    <Badge className={`${
                      forecast.recommendation === 'scale_up' ? 'bg-orange-500/20 text-orange-400' :
                      forecast.recommendation === 'scale_down' ? 'bg-green-500/20 text-green-400' :
                      forecast.recommendation === 'optimize' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {forecast.recommendation.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-white/50">Current</p>
                      <p className="text-white font-semibold">{forecast.current_capacity?.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Projected</p>
                      <p className="text-cyan-400 font-semibold">{forecast.projected_usage?.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Headroom</p>
                      <p className={`font-semibold ${
                        forecast.headroom_pct < 20 ? 'text-red-400' :
                        forecast.headroom_pct < 40 ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        {forecast.headroom_pct?.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}