import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Activity,
  Loader2,
  CheckCircle,
  XCircle,
  Play
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BehaviorAnomalyMonitor({ userId }) {
  const queryClient = useQueryClient();

  const { data: anomalies = [], isLoading, error } = useQuery({
    queryKey: ['behavior-anomalies', userId],
    queryFn: async () => {
      try {
        const currentUser = await api.auth.me();
        if (!currentUser?.current_org_id) return [];
        
        const allAnomalies = await api.entities.BehaviorAnomaly.list('-detected_at', 50);
        return allAnomalies.filter(a => {
          if (userId) {
            return a.user_id === userId;
          }
          return a.org_id === currentUser.current_org_id;
        });
      } catch (err) {
        console.error('Error fetching anomalies:', err);
        return [];
      }
    },
    retry: 1
  });

  const analyzeMutation = useMutation({
    mutationFn: async (targetUserId) => {
      const { data } = await api.functions.invoke('behaviorAnomalyDetector', {
        userId: targetUserId,
        action: 'analyze'
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Analysis complete: ${data.anomalies_found} anomalies detected`);
      queryClient.invalidateQueries({ queryKey: ['behavior-anomalies'] });
    },
    onError: (err) => {
      console.error('Analysis error:', err);
      toast.error("Analysis failed - check console for details");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ anomalyId, status }) => {
      await api.entities.BehaviorAnomaly.update(anomalyId, { 
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-anomalies'] });
      toast.success("Status updated");
    }
  });

  const severityConfig = {
    low: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
    high: { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
    critical: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' }
  };

  const activeAnomalies = anomalies.filter(a => a.status === 'active');
  const resolvedAnomalies = anomalies.filter(a => a.status === 'resolved');
  const criticalCount = activeAnomalies.filter(a => a.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Shield className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Total</Badge>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{anomalies.length}</p>
            <p className="text-white/60 text-xs">Anomalies Detected</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Active</Badge>
            </div>
            <p className="text-2xl font-bold text-red-400 mt-2">{activeAnomalies.length}</p>
            <p className="text-white/60 text-xs">Require Attention</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-400">Critical</Badge>
            </div>
            <p className="text-2xl font-bold text-orange-400 mt-2">{criticalCount}</p>
            <p className="text-white/60 text-xs">High Priority</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Resolved</Badge>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-2">{resolvedAnomalies.length}</p>
            <p className="text-white/60 text-xs">Cases Closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Run Analysis */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold mb-1">AI Behavior Analysis</p>
              <p className="text-white/60 text-sm">Scan user activity for suspicious patterns</p>
            </div>
            <Button
              onClick={() => analyzeMutation.mutate(userId)}
              disabled={analyzeMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies List */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Detected Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
              <p className="text-red-400">Error loading anomalies</p>
              <p className="text-white/40 text-sm mt-1">{error.message}</p>
            </div>
          ) : anomalies.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-green-400/40 mx-auto mb-3" />
              <p className="text-white/60">No anomalies detected</p>
              <p className="text-white/40 text-sm mt-1">System is monitoring user behavior patterns</p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.map((anomaly) => {
                const config = severityConfig[anomaly.severity] || severityConfig.medium;
                return (
                  <div
                    key={anomaly.id}
                    className={`p-4 rounded-lg border ${config.border} ${config.bg}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${config.bg} ${config.color}`}>
                            {anomaly.severity}
                          </Badge>
                          <Badge className="bg-white/10 text-white/70 text-xs">
                            {anomaly.anomaly_type.replace(/_/g, ' ')}
                          </Badge>
                          {anomaly.status === 'resolved' && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <p className={`font-semibold ${config.color} mb-1`}>
                          Anomaly Score: {anomaly.anomaly_score}/100
                        </p>
                        <p className="text-white/80 text-sm">
                          User: {anomaly.user_id}
                        </p>
                      </div>
                      <div className="text-right text-xs text-white/60">
                        {anomaly.detected_at && (
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(anomaly.detected_at), 'MMM d, h:mm a')}
                          </div>
                        )}
                      </div>
                    </div>

                    {anomaly.detected_behavior && (
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        {anomaly.detected_behavior.login_time !== null && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-white/40" />
                            <span className="text-white/70">Login: {anomaly.detected_behavior.login_time}:00</span>
                          </div>
                        )}
                        {anomaly.detected_behavior.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-white/40" />
                            <span className="text-white/70">{anomaly.detected_behavior.location}</span>
                          </div>
                        )}
                        {anomaly.detected_behavior.requests_count && (
                          <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-white/40" />
                            <span className="text-white/70">{anomaly.detected_behavior.requests_count} requests</span>
                          </div>
                        )}
                      </div>
                    )}

                    {anomaly.ai_analysis?.recommended_actions && (
                      <div className="bg-black/20 rounded p-3 mb-3">
                        <p className="text-white/60 text-xs mb-2">AI Recommendations:</p>
                        <ul className="space-y-1">
                          {anomaly.ai_analysis.recommended_actions.map((action, idx) => (
                            <li key={idx} className="text-white/80 text-xs flex items-start gap-2">
                              <span className="text-amber-400">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {anomaly.status === 'active' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateStatusMutation.mutate({ 
                            anomalyId: anomaly.id, 
                            status: 'resolved' 
                          })}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark Resolved
                        </Button>
                        <Button
                          onClick={() => updateStatusMutation.mutate({ 
                            anomalyId: anomaly.id, 
                            status: 'false_positive' 
                          })}
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          False Positive
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}