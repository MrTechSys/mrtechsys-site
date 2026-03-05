import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  AlertTriangle,
  Brain,
  BarChart3,
  Sparkles,
  RefreshCw,
  Download,
  FileText
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdvancedAnalyticsDashboard({ orgId }) {
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [auditReadiness, setAuditReadiness] = useState(null);
  const [anomalies, setAnomalies] = useState(null);

  const { data: metrics = [] } = useQuery({
    queryKey: ['compliance-metrics-analytics', orgId],
    queryFn: () => api.entities.ComplianceMetric.filter({ org_id: orgId }, '-timestamp', 90),
    enabled: !!orgId
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings-analytics', orgId],
    queryFn: () => api.entities.ComplianceFinding.filter({ org_id: orgId }),
    enabled: !!orgId
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls-analytics', orgId],
    queryFn: () => api.entities.ComplianceControl.filter({ org_id: orgId }),
    enabled: !!orgId
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('soc2AnalyticsEngine', {
        action: 'generate_executive_summary',
        orgId
      });
      return data;
    },
    onSuccess: (data) => {
      setExecutiveSummary(data.summary);
      toast.success("Executive summary generated!");
    }
  });

  const predictReadinessMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('soc2AnalyticsEngine', {
        action: 'predict_audit_readiness',
        orgId
      });
      return data;
    },
    onSuccess: (data) => {
      setAuditReadiness(data.prediction);
      toast.success("Audit readiness predicted!");
    }
  });

  const detectAnomaliesMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('soc2AnalyticsEngine', {
        action: 'detect_anomalies',
        orgId,
        timeframe: 30
      });
      return data;
    },
    onSuccess: (data) => {
      setAnomalies(data);
      if (data.anomalies?.length > 0) {
        toast.warning(`Detected ${data.anomalies.length} anomalies`);
      } else {
        toast.success("No anomalies detected");
      }
    }
  });

  // Finding velocity (new findings over time)
  const findingVelocity = findings.reduce((acc, f) => {
    const date = format(new Date(f.detected_at || f.created_date), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const velocityData = Object.entries(findingVelocity)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, count]) => ({
      date: format(new Date(date), 'MMM d'),
      findings: count
    }));

  // Resolution time analysis
  const resolvedFindings = findings.filter(f => 
    f.status === 'resolved' && f.resolved_at && f.detected_at
  );

  const resolutionTimes = resolvedFindings.map(f => {
    const detected = new Date(f.detected_at);
    const resolved = new Date(f.resolved_at);
    const hours = (resolved - detected) / (1000 * 60 * 60);
    
    return {
      severity: f.severity,
      hours: Math.round(hours),
      title: f.title
    };
  });

  const avgResolutionBySeverity = ['critical', 'high', 'medium', 'low'].map(sev => ({
    severity: sev.toUpperCase(),
    avg_hours: resolutionTimes.filter(r => r.severity === sev).length > 0
      ? Math.round(resolutionTimes.filter(r => r.severity === sev)
          .reduce((sum, r) => sum + r.hours, 0) / resolutionTimes.filter(r => r.severity === sev).length)
      : 0
  }));

  // Control effectiveness scatter (evidence vs review frequency)
  const controlScatter = controls.map(c => ({
    name: c.control_id,
    evidence: c.evidence_count || 0,
    frequency: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'].indexOf(c.review_frequency) + 1,
    status: c.status
  }));

  return (
    <div className="space-y-6">
      {/* AI Insights Actions */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="text-white font-semibold">AI-Powered Analytics</h3>
                <p className="text-white/60 text-sm">Generate insights and predictions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => detectAnomaliesMutation.mutate()}
                disabled={detectAnomaliesMutation.isPending}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Detect Anomalies
              </Button>
              <Button
                onClick={() => predictReadinessMutation.mutate()}
                disabled={predictReadinessMutation.isPending}
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                size="sm"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Predict Readiness
              </Button>
              <Button
                onClick={() => generateSummaryMutation.mutate()}
                disabled={generateSummaryMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-purple-500"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Executive Summary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {executiveSummary && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 leading-relaxed">{executiveSummary.executive_summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Key Achievements
                </h4>
                <ul className="space-y-2">
                  {executiveSummary.achievements?.map((achievement, idx) => (
                    <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Areas of Concern
                </h4>
                <ul className="space-y-2">
                  {executiveSummary.concerns?.map((concern, idx) => (
                    <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-3">Recommended Actions</h4>
              <ol className="space-y-2">
                {executiveSummary.recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-blue-400 font-semibold">{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/50 text-xs mb-1">Audit Readiness</p>
                <p className="text-white font-semibold">{executiveSummary.audit_readiness}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/50 text-xs mb-1">30-Day Outlook</p>
                <p className="text-white font-semibold">{executiveSummary.outlook}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Readiness Prediction */}
      {auditReadiness && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              AI Audit Readiness Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-green-400">{auditReadiness.readiness_score}</p>
                <p className="text-white/60 text-sm mt-1">Readiness Score</p>
                <Badge className="mt-2 bg-green-500/20 text-green-400">
                  {auditReadiness.readiness_level?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-cyan-400">{auditReadiness.days_to_ready}</p>
                <p className="text-white/60 text-sm mt-1">Days to Audit-Ready</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-purple-400">
                  {Math.round(auditReadiness.confidence * 100)}%
                </p>
                <p className="text-white/60 text-sm mt-1">AI Confidence</p>
              </div>
            </div>

            {auditReadiness.blocking_issues?.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="text-red-400 font-semibold mb-3">Blocking Issues</h4>
                <ul className="space-y-2">
                  {auditReadiness.blocking_issues.map((issue, idx) => (
                    <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {auditReadiness.recommended_actions?.length > 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-400 font-semibold mb-3">Action Plan</h4>
                <div className="space-y-3">
                  {auditReadiness.recommended_actions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Badge className={
                        action.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        action.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }>
                        {action.priority}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{action.action}</p>
                        <p className="text-white/60 text-xs mt-1">Impact: {action.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Anomaly Detection Results */}
      {anomalies && anomalies.anomalies?.length > 0 && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Anomalies Detected ({anomalies.anomalies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white/50 text-xs">Mean Score</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {anomalies.statistics?.mean?.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white/50 text-xs">Std Deviation</p>
                <p className="text-2xl font-bold text-purple-400">
                  {anomalies.statistics?.stdDev?.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white/50 text-xs">Trend</p>
                <p className="text-xl font-bold text-amber-400 capitalize">
                  {anomalies.ai_analysis?.trend || 'Stable'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {anomalies.anomalies.map((anomaly, idx) => (
                <div key={idx} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={anomaly.severity === 'decline' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}>
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                    <span className="text-white/70 text-sm">
                      {format(new Date(anomaly.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-white/50 text-xs">Actual</p>
                      <p className="text-white font-bold">{anomaly.value}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Expected Range</p>
                      <p className="text-white font-bold">
                        {anomaly.expected_range[0].toFixed(0)}-{anomaly.expected_range[1].toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Z-Score</p>
                      <p className="text-red-400 font-bold">{anomaly.z_score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {anomalies.ai_analysis && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Analysis
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-white/60 mb-1">Root Causes:</p>
                    <ul className="space-y-1">
                      {anomalies.ai_analysis.root_causes?.map((cause, idx) => (
                        <li key={idx} className="text-white/80">• {cause}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-white/60 mb-1">Recommended Investigations:</p>
                    <ul className="space-y-1">
                      {anomalies.ai_analysis.investigations?.map((inv, idx) => (
                        <li key={idx} className="text-white/80">• {inv}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advanced Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Finding Velocity */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">Finding Velocity (14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#fff" tick={{ fontSize: 11 }} />
                <YAxis stroke="#fff" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }}
                />
                <Bar dataKey="findings" fill="#f59e0b" />
                <Line type="monotone" dataKey="findings" stroke="#ef4444" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Time by Severity */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">Avg Resolution Time by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={avgResolutionBySeverity} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" stroke="#fff" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="severity" stroke="#fff" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #10b981' }}
                />
                <Bar dataKey="avg_hours" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Control Effectiveness Scatter */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white text-sm">Control Effectiveness Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  type="number" 
                  dataKey="frequency" 
                  name="Review Frequency" 
                  stroke="#fff"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Review Frequency (1=Daily, 5=Annually)', position: 'insideBottom', offset: -5, fill: '#fff', fontSize: 10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="evidence" 
                  name="Evidence Count" 
                  stroke="#fff"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Evidence Count', angle: -90, position: 'insideLeft', fill: '#fff', fontSize: 10 }}
                />
                <ZAxis range={[60, 400]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #8b5cf6' }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter 
                  name="Controls" 
                  data={controlScatter} 
                  fill="#8b5cf6"
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-white/50 text-xs text-center mt-2">
              💡 Bubble size indicates control complexity
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}