import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Zap,
  TrendingUp,
  FileText,
  Clock,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

const severityColors = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30"
};

const statusColors = {
  compliant: "text-green-400",
  at_risk: "text-amber-400",
  non_compliant: "text-red-400"
};

export default function AIAuditPanel({ orgId, onAuditComplete }) {
  const [auditReport, setAuditReport] = useState(null);
  const [selectedGap, setSelectedGap] = useState(null);

  const auditMutation = useMutation({
    mutationFn: async () => {
      const user = await api.auth.me();
      return api.functions.invoke('aiComplianceAuditor', {
        orgId: user.current_org_id,
        regulationType: 'soc2',
        timeRangeHours: 168
      });
    },
    onSuccess: (data) => {
      setAuditReport(data?.audit_report || null);
      toast.success(`Audit complete! ${data?.remediation_tasks_created || 0} remediation tasks created.`);
      if (onAuditComplete) onAuditComplete(data);
    },
    onError: (error) => {
      toast.error(`Audit failed: ${error?.message || 'Unknown error'}`);
    }
  });

  const handleRunAudit = () => {
    setAuditReport(null);
    auditMutation.mutate();
  };

  const safeAuditReport = auditReport || {};
  const criticalGaps = Array.isArray(safeAuditReport.critical_gaps) ? safeAuditReport.critical_gaps : [];
  const recommendations = Array.isArray(safeAuditReport.recommendations) ? safeAuditReport.recommendations : [];
  const riskAssessment = safeAuditReport.risk_assessment || {};

  return (
    <div className="space-y-4">
      {/* Audit Trigger */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">AI Compliance Audit</h3>
                <p className="text-white/60 text-sm">Automated SOC 2 compliance review</p>
              </div>
            </div>
            <Button
              onClick={handleRunAudit}
              disabled={auditMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {auditMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Audit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Results */}
      <AnimatePresence>
        {auditReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Overall Score */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    Compliance Assessment
                  </span>
                  <Badge className={`${statusColors[safeAuditReport.compliance_status] || 'bg-gray-500/20 text-gray-400'} text-sm`}>
                    {(safeAuditReport.compliance_status || 'unknown').replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Compliance Score</span>
                  <span className="text-3xl font-bold text-cyan-400">
                    {safeAuditReport.compliance_score || 0}/100
                  </span>
                </div>
                <Progress value={safeAuditReport.compliance_score || 0} className="h-2" />
                
                {safeAuditReport.executive_summary && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-cyan-500/20">
                    <p className="text-white/80 text-sm">{safeAuditReport.executive_summary}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Critical Gaps</p>
                    <p className="text-xl font-bold text-red-400">
                      {criticalGaps.filter(g => g?.severity === 'critical').length}
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Next Audit</p>
                    <p className="text-sm font-medium text-white">
                      {safeAuditReport.next_audit_date ? format(new Date(safeAuditReport.next_audit_date), 'MMM d, yyyy') : 'TBD'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            {Object.keys(riskAssessment).length > 0 && (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(riskAssessment).map(([key, value]) => {
                      if (key === 'overall_risk_level') {
                        return (
                          <div key={key} className="col-span-2 p-3 bg-white/5 rounded-lg">
                            <p className="text-white/60 text-xs mb-1">Overall Risk</p>
                            <Badge className={`${severityColors[value] || 'bg-gray-500/20 text-gray-400'} text-sm`}>
                              {(value || 'unknown').toUpperCase()}
                            </Badge>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="p-3 bg-white/5 rounded-lg">
                          <p className="text-white/60 text-xs mb-1">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <Progress value={value || 0} className="h-1.5 mt-2" />
                          <p className="text-xs text-white/70 mt-1">{(value || 0).toFixed(0)}%</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Critical Gaps */}
            {criticalGaps.length > 0 && (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-red-400" />
                      Critical Gaps ({criticalGaps.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {criticalGaps.slice(0, 5).map((gap, idx) => {
                      const affectedControls = Array.isArray(gap?.affected_controls) ? gap.affected_controls : [];
                      const remediationSteps = Array.isArray(gap?.remediation_steps) ? gap.remediation_steps : [];
                      
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedGap === idx ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'
                          }`}
                          onClick={() => setSelectedGap(selectedGap === idx ? null : idx)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`${severityColors[gap?.severity] || severityColors.medium} text-xs`}>
                                  {(gap?.severity || 'medium').toUpperCase()}
                                </Badge>
                                <span className="text-xs text-white/50">{gap?.category || 'general'}</span>
                              </div>
                              <p className="text-white font-medium text-sm">{gap?.description || 'No description'}</p>
                            </div>
                          </div>

                          {selectedGap === idx && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 pt-3 border-t border-white/10 space-y-3"
                            >
                              {gap?.impact && (
                                <div>
                                  <p className="text-white/60 text-xs mb-1">Impact</p>
                                  <p className="text-white/80 text-sm">{gap.impact}</p>
                                </div>
                              )}
                              
                              {affectedControls.length > 0 && (
                                <div>
                                  <p className="text-white/60 text-xs mb-1">Affected Controls</p>
                                  <div className="flex flex-wrap gap-1">
                                    {affectedControls.map((ctrl, i) => (
                                      <Badge key={i} className="bg-blue-500/20 text-blue-400 text-xs">
                                        {ctrl}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {remediationSteps.length > 0 && (
                                <div>
                                  <p className="text-white/60 text-xs mb-2">Remediation Steps</p>
                                  <ol className="space-y-1">
                                    {remediationSteps.map((step, i) => (
                                      <li key={i} className="text-white/80 text-sm flex items-start gap-2">
                                        <span className="text-cyan-400">{i + 1}.</span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2">
                                <span className="text-xs text-white/50">
                                  Est. Effort: {gap?.estimated_effort_hours || 0}h
                                </span>
                                <Badge className="bg-green-500/20 text-green-400 text-xs">
                                  Priority: {gap?.priority || 1}
                                </Badge>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-lg border border-green-500/20">
                        <h4 className="text-white font-medium text-sm mb-1">{rec?.title || 'Recommendation'}</h4>
                        <p className="text-white/70 text-sm mb-2">{rec?.description || ''}</p>
                        {rec?.benefit && (
                          <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                            <p className="text-green-400 text-xs">✓ {rec.benefit}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}