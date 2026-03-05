import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Zap,
  Shield,
  TrendingUp,
  Target,
  Play,
  Pause,
  XCircle,
  FileText,
  ChevronRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

const severityColors = {
  sev1: "bg-red-100 text-red-800 border-red-500",
  sev2: "bg-orange-100 text-orange-800 border-orange-500",
  sev3: "bg-yellow-100 text-yellow-800 border-yellow-500",
  sev4: "bg-blue-100 text-blue-800 border-blue-500",
  info: "bg-gray-100 text-gray-800 border-gray-500",
  low: "bg-blue-100 text-blue-800 border-blue-500",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-500",
  high: "bg-orange-100 text-orange-800 border-orange-500",
  critical: "bg-red-100 text-red-800 border-red-500"
};

const statusColors = {
  active: "bg-yellow-100 text-yellow-800",
  prevented: "bg-green-100 text-green-800",
  occurred: "bg-red-100 text-red-800",
  false_positive: "bg-gray-100 text-gray-800",
  expired: "bg-gray-100 text-gray-800"
};

export default function SREAgent() {
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedRemediation, setSelectedRemediation] = useState(null);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: predictions = [] } = useQuery({
    queryKey: ['predicted-incidents'],
    queryFn: () => api.entities.PredictedIncident.filter({ status: 'active' }),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.entities.Incident.list('-opened_at', 20),
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['anomalies'],
    queryFn: () => api.entities.MultiVariateAnomaly.filter({ status: 'detected' }),
  });

  const executeRemediationMutation = useMutation({
    mutationFn: async ({ predictionId, actionIndex, approved }) => {
      return api.functions.invoke('sreAutomationEngine', {
        predictionId,
        actionIndex,
        approved,
        executedBy: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predicted-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setShowApprovalDialog(false);
      setSelectedRemediation(null);
      toast.success("Remediation action executed successfully!");
    },
    onError: (error) => {
      toast.error(`Remediation failed: ${error.message}`);
    }
  });

  const dismissPredictionMutation = useMutation({
    mutationFn: (predictionId) => 
      api.entities.PredictedIncident.update(predictionId, { status: 'false_positive' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predicted-incidents'] });
      toast.success("Prediction dismissed");
    }
  });

  const handleApproveRemediation = (prediction, actionIndex) => {
    setSelectedRemediation({ prediction, actionIndex });
    setShowApprovalDialog(true);
  };

  const handleExecute = () => {
    if (!selectedRemediation) return;
    
    executeRemediationMutation.mutate({
      predictionId: selectedRemediation.prediction.id,
      actionIndex: selectedRemediation.actionIndex,
      approved: true
    });
  };

  const activePredictions = predictions.filter(p => p.status === 'active');
  const highSeverityPredictions = activePredictions.filter(p => 
    p.predicted_severity === 'sev1' || p.predicted_severity === 'sev2'
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            AI SRE <span className="text-amber-400">Agent</span>
          </h1>
          <p className="text-white/70 mt-1">
            Predictive incident prevention and automated remediation
          </p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          <Sparkles className="w-3 h-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Active</Badge>
            </div>
            <p className="text-3xl font-bold text-white">{activePredictions.length}</p>
            <p className="text-white/60 text-xs mt-1">Predicted Incidents</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-400">Critical</Badge>
            </div>
            <p className="text-3xl font-bold text-orange-400">{highSeverityPredictions.length}</p>
            <p className="text-white/60 text-xs mt-1">High Severity</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Prevented</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {predictions.filter(p => p.status === 'prevented').length}
            </p>
            <p className="text-white/60 text-xs mt-1">This Month</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Auto</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {activePredictions.filter(p => 
                p.remediation_steps?.some(s => s.automation_available)
              ).length}
            </p>
            <p className="text-white/60 text-xs mt-1">Auto-Fixable</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="bg-white/5 border border-amber-500/20">
          <TabsTrigger value="predictions" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Predictions ({activePredictions.length})
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Activity className="w-4 h-4 mr-2" />
            Anomalies ({anomalies.length})
          </TabsTrigger>
          <TabsTrigger value="incidents" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Shield className="w-4 h-4 mr-2" />
            Incidents ({incidents.length})
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {activePredictions.length === 0 ? (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
              <p className="text-white/60">No predicted incidents at this time</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activePredictions.map((prediction) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:border-amber-500/40 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={severityColors[prediction.predicted_severity]}>
                              {prediction.predicted_severity?.toUpperCase()}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-400">
                              {Math.round((prediction.probability || 0) * 100)}% probability
                            </Badge>
                            <Badge variant="outline" className="text-white/60">
                              {prediction.time_to_incident || 0}h away
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {prediction.incident_type?.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          {prediction.service_id && (
                            <p className="text-white/60 text-sm">Service: {prediction.service_id}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissPredictionMutation.mutate(prediction.id)}
                          className="text-white/60 hover:text-white"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Predicted Impact */}
                      {prediction.predicted_impact && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            Predicted Impact
                          </h4>
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            {prediction.predicted_impact.affected_users > 0 && (
                              <div className="text-white/70">
                                <strong>{prediction.predicted_impact.affected_users}</strong> users affected
                              </div>
                            )}
                            {prediction.predicted_impact.estimated_downtime_minutes > 0 && (
                              <div className="text-white/70">
                                <strong>{prediction.predicted_impact.estimated_downtime_minutes}m</strong> downtime
                              </div>
                            )}
                            {prediction.predicted_impact.revenue_at_risk > 0 && (
                              <div className="text-white/70">
                                <strong>${prediction.predicted_impact.revenue_at_risk}</strong> at risk
                              </div>
                            )}
                            {prediction.predicted_impact.sla_breach_risk && (
                              <div className="text-red-400 font-medium">
                                ⚠️ SLA breach risk
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Triggering Signals */}
                      {prediction.triggering_signals?.length > 0 && (
                        <div>
                          <h4 className="text-white font-medium text-sm mb-2">Triggering Signals</h4>
                          <div className="space-y-2">
                            {prediction.triggering_signals.map((signal, idx) => (
                              <div key={idx} className="p-2 bg-white/5 rounded border border-amber-500/20 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/80">{signal.metric}</span>
                                  <Badge variant="outline" className="text-white/60">
                                    {signal.trend}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                                  <span>Current: <strong className="text-orange-400">{signal.current_value}</strong></span>
                                  <span>Threshold: <strong className="text-white/80">{signal.threshold}</strong></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Remediation Steps */}
                      {prediction.remediation_steps?.length > 0 && (
                        <div>
                          <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            Suggested Remediation
                          </h4>
                          <div className="space-y-2">
                            {prediction.remediation_steps.map((step, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-white/5 rounded-lg border border-amber-500/20"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                        Step {idx + 1}
                                      </Badge>
                                      <Badge className={`text-xs ${
                                        step.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                        step.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-blue-500/20 text-blue-400'
                                      }`}>
                                        {step.priority} priority
                                      </Badge>
                                      {step.automation_available && (
                                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                          <Zap className="w-3 h-3 mr-1" />
                                          Auto
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-white text-sm mb-1">{step.step}</p>
                                    {step.estimated_impact && (
                                      <p className="text-white/60 text-xs">
                                        Impact: {step.estimated_impact}
                                      </p>
                                    )}
                                  </div>
                                  {step.automation_available && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveRemediation(prediction, idx)}
                                      className="bg-gradient-to-r from-purple-600 to-purple-500"
                                    >
                                      <Play className="w-3 h-3 mr-1" />
                                      Execute
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Similar Incidents */}
                      {prediction.similar_incidents?.length > 0 && (
                        <details className="group">
                          <summary className="cursor-pointer text-white/70 text-sm hover:text-white flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                            Similar Past Incidents ({prediction.similar_incidents.length})
                          </summary>
                          <div className="mt-2 space-y-2">
                            {prediction.similar_incidents.map((inc, idx) => (
                              <div key={idx} className="p-2 bg-white/5 rounded border border-white/10 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-white/70">
                                    {inc.occurred_at && format(new Date(inc.occurred_at), 'MMM d, yyyy')}
                                  </span>
                                  <Badge className={severityColors[inc.actual_severity]}>
                                    {inc.actual_severity}
                                  </Badge>
                                </div>
                                {inc.resolution && (
                                  <p className="text-white/60 mt-1">{inc.resolution}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          {anomalies.length === 0 ? (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Anomalies Detected</h3>
              <p className="text-white/60">System metrics are within normal ranges</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <Card key={anomaly.id} className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="bg-orange-500/20 text-orange-400 mb-2">
                          {anomaly.pattern_type?.replace(/_/g, ' ')}
                        </Badge>
                        <h3 className="text-lg font-bold text-white">
                          Severity Score: {anomaly.severity_score}/100
                        </h3>
                        {anomaly.service_id && (
                          <p className="text-white/60 text-sm mt-1">Service: {anomaly.service_id}</p>
                        )}
                      </div>
                      <Badge className={statusColors[anomaly.status]}>
                        {anomaly.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Correlated Metrics */}
                    {anomaly.correlated_metrics?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white text-sm font-medium">Correlated Metrics</h4>
                        {anomaly.correlated_metrics.map((metric, idx) => (
                          <div key={idx} className="p-2 bg-white/5 rounded text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-white">{metric.metric}</span>
                              <span className={`font-bold ${
                                Math.abs(metric.deviation_pct || 0) > 50 ? 'text-red-400' :
                                Math.abs(metric.deviation_pct || 0) > 20 ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {metric.deviation_pct > 0 ? '+' : ''}{metric.deviation_pct?.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex gap-4 mt-1 text-xs text-white/60">
                              <span>Baseline: {metric.baseline}</span>
                              <span>Current: {metric.current}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Hypothesis */}
                    {anomaly.ai_hypothesis && (
                      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          AI Analysis
                        </h4>
                        {anomaly.ai_hypothesis.root_cause && (
                          <p className="text-white/80 text-sm mb-2">
                            <strong>Root Cause:</strong> {anomaly.ai_hypothesis.root_cause}
                          </p>
                        )}
                        {anomaly.ai_hypothesis.recommended_investigation?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-white/60 text-xs mb-1">Recommended Investigation:</p>
                            <ul className="list-disc list-inside text-white/70 text-xs space-y-1">
                              {anomaly.ai_hypothesis.recommended_investigation.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          {incidents.length === 0 ? (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 p-12 text-center">
              <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Active Incidents</h3>
              <p className="text-white/60">All systems operational</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <Card key={incident.id} className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={severityColors[incident.severity]}>
                            {incident.severity?.toUpperCase()}
                          </Badge>
                          <Badge className={statusColors[incident.status] || "bg-gray-100 text-gray-800"}>
                            {incident.status}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-white">{incident.title}</h3>
                        <p className="text-white/60 text-sm mt-1">{incident.summary}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/50 text-xs mb-1">Opened</p>
                        <p className="text-white text-sm">
                          {incident.opened_at && format(new Date(incident.opened_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      {incident.closed_at && (
                        <div>
                          <p className="text-white/50 text-xs mb-1">Closed</p>
                          <p className="text-white text-sm">
                            {format(new Date(incident.closed_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      )}
                    </div>

                    {incident.root_cause && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h4 className="text-white font-medium text-sm mb-1">Root Cause</h4>
                        <p className="text-white/70 text-sm">{incident.root_cause}</p>
                      </div>
                    )}

                    {incident.mitigation && (
                      <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <h4 className="text-white font-medium text-sm mb-1">Mitigation</h4>
                        <p className="text-white/70 text-sm">{incident.mitigation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Approve Remediation Action
            </DialogTitle>
          </DialogHeader>

          {selectedRemediation && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm mb-1">
                      You're about to execute an automated remediation action
                    </p>
                    <p className="text-white/70 text-xs">
                      This action will be logged and can be rolled back if needed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
                <h4 className="text-white font-medium text-sm mb-2">Action Details</h4>
                <p className="text-white/80 text-sm mb-2">
                  {selectedRemediation.prediction.remediation_steps[selectedRemediation.actionIndex]?.step}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/50">Priority:</span>
                    <span className="text-white ml-2">
                      {selectedRemediation.prediction.remediation_steps[selectedRemediation.actionIndex]?.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Impact:</span>
                    <span className="text-white ml-2">
                      {selectedRemediation.prediction.remediation_steps[selectedRemediation.actionIndex]?.estimated_impact}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-white font-medium text-sm mb-1">Predicted Incident</h4>
                <p className="text-white/70 text-sm">
                  {selectedRemediation.prediction.incident_type?.replace(/_/g, ' ')}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {Math.round((selectedRemediation.prediction.probability || 0) * 100)}% probability • 
                  {selectedRemediation.prediction.time_to_incident}h away
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecute}
              disabled={executeRemediationMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
            >
              {executeRemediationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Execute
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}