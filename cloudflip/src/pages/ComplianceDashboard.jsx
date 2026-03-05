
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  Target,
  Users,
  FileText,
  Globe,
  Database,
  Activity,
  Sparkles, // New import
  Zap,      // New import
  Loader2   // New import
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import AIAuditPanel from "../components/compliance/AIAuditPanel";

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  info: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const regulationColors = {
  gdpr: '#4ade80',
  hipaa: '#60a5fa',
  pci: '#f59e0b',
  ccpa: '#8b5cf6',
  sox: '#ec4899',
  data_residency: '#14b8a6'
};

export default function ComplianceDashboard() {
  const [user, setUser] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [showRemediationModal, setShowRemediationModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [riskPredictions, setRiskPredictions] = useState(null); // New state
  const [loadingPredictions, setLoadingPredictions] = useState(false); // New state
  const [generatingReport, setGeneratingReport] = useState(false); // New state
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: findings = [] } = useQuery({
    queryKey: ['compliance-findings', statusFilter, severityFilter],
    queryFn: async () => {
      let query = {};
      if (statusFilter !== 'all') query.status = statusFilter;
      if (severityFilter !== 'all') query.severity = severityFilter;
      return api.entities.ComplianceFinding.filter(query, '-detected_at', 100);
    },
    enabled: !!user
  });

  const { data: remediationTasks = [] } = useQuery({
    queryKey: ['remediation-tasks'],
    queryFn: () => api.entities.RemediationTask.list('-created_date', 50),
    enabled: !!user
  });

  // Load risk predictions
  useEffect(() => {
    if (user) {
      loadRiskPredictions();
    }
  }, [user]);

  const loadRiskPredictions = async () => {
    setLoadingPredictions(true);
    try {
      const { data } = await api.functions.invoke('complianceRiskPredictor', {});
      setRiskPredictions(data);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      toast.error('Failed to load AI predictions.');
    } finally {
      setLoadingPredictions(false);
    }
  };

  const handleAutoRemediate = async (findingId) => {
    toast.info('Attempting auto-remediation...');
    try {
      const { data } = await api.functions.invoke('autoRemediationEngine', {
        finding_id: findingId, // Use finding_id as expected by the backend
        auto_fix: true // Use auto_fix as expected by the backend
      });

      if (data && data.results) { // Check if data and results exist
        if (data.results.taskCreated) {
          toast.success('✅ Remediation task auto-created and assigned!');
          if (data.results.autoFixApplied) {
            toast.success('🤖 Automated fix applied!');
          }
          queryClient.invalidateQueries({ queryKey: ['compliance-findings'] });
          queryClient.invalidateQueries({ queryKey: ['remediation-tasks'] });
        } else {
          toast.info('Auto-remediation initiated, but no immediate fix applied or task created.');
        }
      } else {
        toast.error('Auto-remediation response malformed.');
      }
    } catch (error) {
      console.error('Auto-remediation failed:', error);
      toast.error('Auto-remediation failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleGenerateReport = async (regulation) => {
    setGeneratingReport(true);
    toast.info(`Generating ${regulation.toUpperCase()} report...`);
    try {
      const { data } = await api.functions.invoke('generateComplianceReport', {
        regulation,
        format: 'detailed'
      });

      if (data && data.success) { // Ensure data is not null and success is true
        // Download report as JSON
        const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${regulation}_compliance_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Report generated and downloaded!');
      } else {
        toast.error('Failed to generate report: ' + (data?.message || 'No report data received.'));
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report: ' + (error.message || 'Unknown error'));
    } finally {
      setGeneratingReport(false);
    }
  };

  const updateFindingMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.ComplianceFinding.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-findings'] });
      toast.success('Finding updated');
    }
  });

  const createRemediationMutation = useMutation({
    mutationFn: async (data) => api.entities.RemediationTask.create({
      ...data,
      org_id: user.current_org_id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remediation-tasks'] });
      setShowRemediationModal(false);
      setSelectedFinding(null);
      toast.success('Remediation task created!');
    }
  });

  const handleCreateRemediation = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    createRemediationMutation.mutate({
      finding_id: selectedFinding.id,
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      assigned_to: user.id,
      assigned_name: user.full_name,
      due_date: formData.get('due_date'),
      estimated_hours: parseFloat(formData.get('estimated_hours')) || 0
    });
  };

  // Calculate metrics
  const openFindings = findings.filter(f => f.status === 'open');
  const criticalFindings = findings.filter(f => f.severity === 'critical' && f.status === 'open');
  const resolvedFindings = findings.filter(f => f.status === 'resolved');
  const inProgressTasks = remediationTasks.filter(t => t.status === 'in_progress');

  const avgResolutionTime = resolvedFindings.length > 0
    ? resolvedFindings.reduce((sum, f) => {
        const detected = new Date(f.detected_at);
        const resolved = new Date(f.resolved_at);
        return sum + (resolved - detected) / (1000 * 60 * 60); // hours
      }, 0) / resolvedFindings.length
    : 0;

  // Findings by regulation
  const byRegulation = findings.reduce((acc, f) => {
    acc[f.regulation] = (acc[f.regulation] || 0) + 1;
    return acc;
  }, {});

  const regulationChartData = Object.entries(byRegulation).map(([reg, count]) => ({
    name: reg.toUpperCase(),
    value: count,
    color: regulationColors[reg]
  }));

  // Findings trend (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayFindings = findings.filter(f => 
      f.detected_at?.startsWith(dateStr)
    );
    
    return {
      date: dateStr.slice(5),
      critical: dayFindings.filter(f => f.severity === 'critical').length,
      high: dayFindings.filter(f => f.severity === 'high').length,
      medium: dayFindings.filter(f => f.severity === 'medium').length
    };
  });

  const resolutionRate = findings.length > 0
    ? (resolvedFindings.length / findings.length) * 100
    : 0;

  return (
    <div className="h-full bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8" style={{
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#f4d35e]" />
              Compliance <span className="text-[#f4d35e]">Dashboard</span>
            </h1>
            <p className="text-white/70 mt-1">Track findings, manage remediation, ensure regulatory compliance</p>
          </div>
          <Badge className={`text-lg px-4 py-2 ${
            criticalFindings.length === 0 ? 'bg-green-500/20 text-green-400' :
            criticalFindings.length <= 5 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {criticalFindings.length === 0 ? '✅ Compliant' : `⚠️ ${criticalFindings.length} Critical Issues`}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Open Findings</p>
                <p className="text-3xl font-bold text-white">{openFindings.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Critical Issues</p>
                <p className="text-3xl font-bold text-red-400">{criticalFindings.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Resolution Rate</p>
                <p className="text-3xl font-bold text-green-400">{resolutionRate.toFixed(0)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Avg Resolution</p>
                <p className="text-3xl font-bold text-blue-400">{avgResolutionTime.toFixed(1)}h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Compliance Audit Panel - NEW */}
      <div className="mb-6">
        <AIAuditPanel 
          orgId={user?.current_org_id}
          onAuditComplete={(data) => {
            queryClient.invalidateQueries({ queryKey: ['compliance-findings'] });
            queryClient.invalidateQueries({ queryKey: ['remediation-tasks'] });
          }}
        />
      </div>

      {/* AI Risk Predictions */}
      {riskPredictions && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Risk Predictions
              </CardTitle>
              {riskPredictions.risk_level && (
                <Badge className={`text-lg px-4 py-2 ${
                  riskPredictions.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                  riskPredictions.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  riskPredictions.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  Risk Score: {riskPredictions.risk_score}/100
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskPredictions.predictions && riskPredictions.predictions.length > 0 ? (
                riskPredictions.predictions.map((pred, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      pred.severity === 'high' || pred.severity === 'critical'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={severityColors[pred.severity]}>
                            {pred.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {pred.risk_type.replace(/_/g, ' ')}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            {(pred.confidence * 100).toFixed(0)}% confident
                          </Badge>
                        </div>
                        <h4 className="text-white font-semibold">{pred.message}</h4>
                        <p className="text-white/70 text-sm mt-2">{pred.recommendation}</p>

                        {pred.deployment_risks && pred.deployment_risks.length > 0 && (
                          <div className="mt-3 p-3 bg-orange-500/10 rounded border border-orange-500/30">
                            <p className="text-orange-400 font-semibold text-xs mb-2">
                              🚀 Risky Deployments Detected:
                            </p>
                            <div className="space-y-1">
                              {pred.deployment_risks.map((deploy, i) => (
                                <p key={i} className="text-white/70 text-xs">
                                  • {deploy.version} ({deploy.environment}): {deploy.findings_count} findings, {deploy.critical_count} critical
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {pred.predicted_impact && (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(pred.predicted_impact).map(([key, value]) => (
                              <div key={key} className="p-2 bg-white/5 rounded">
                                <p className="text-white/50 capitalize">{key.replace(/_/g, ' ')}</p>
                                <p className="text-white font-semibold">{typeof value === 'number' ? value : value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/60 text-center">No AI predictions available yet. Click 'Analyze' to generate.</p>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                onClick={loadRiskPredictions}
                disabled={loadingPredictions}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                {loadingPredictions ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Refresh Predictions
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-white/5 border-[#f4d35e]/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#f4d35e]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <Button
              onClick={() => handleGenerateReport('gdpr')}
              disabled={generatingReport}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              {generatingReport ? 'Generating...' : 'GDPR Report'}
            </Button>
            <Button
              onClick={() => handleGenerateReport('hipaa')}
              disabled={generatingReport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              {generatingReport ? 'Generating...' : 'HIPAA Report'}
            </Button>
            <Button
              onClick={() => handleGenerateReport('pci')}
              disabled={generatingReport}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              {generatingReport ? 'Generating...' : 'PCI-DSS Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Findings Trend */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#f4d35e]" />
              30-Day Findings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last30Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 10 }} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Regulation */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#f4d35e]" />
              Findings by Regulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={regulationChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regulationChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Findings Table */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-[#f4d35e]/20">
          <TabsTrigger value="all">All ({findings.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({openFindings.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({findings.filter(f => f.status === 'in_progress').length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedFindings.length})</TabsTrigger>
          <TabsTrigger value="accepted_risk">Accepted Risk ({findings.filter(f => f.status === 'accepted_risk').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Compliance Findings</CardTitle>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40 bg-white/5 border-[#f4d35e]/30 text-white">
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {findings.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-white/60">No compliance findings - you're all set! 🎉</p>
                  </div>
                ) : (
                  findings.map((finding) => (
                    <motion.div
                      key={finding.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${severityColors[finding.severity]}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-white/10 text-white text-xs uppercase">
                              {finding.regulation}
                            </Badge>
                            <Badge className={severityColors[finding.severity]}>
                              {finding.severity}
                            </Badge>
                            {finding.category === 'data_residency' && (
                              <Badge className="bg-teal-500/20 text-teal-400">
                                <Globe className="w-3 h-3 mr-1" />
                                Data Residency
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-white font-semibold text-lg">{finding.title}</h4>
                          <p className="text-white/70 text-sm mt-1">{finding.description}</p>
                          
                          {finding.affected_data_types && (
                            <div className="flex gap-1 mt-2">
                              {finding.affected_data_types.map(type => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {finding.affected_regions && finding.affected_regions.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-teal-400" />
                              <span className="text-white/60 text-sm">
                                Regions: {finding.affected_regions.join(', ')}
                              </span>
                            </div>
                          )}

                          {finding.recommendation && (
                            <div className="mt-3 p-3 bg-blue-500/10 rounded border border-blue-500/30">
                              <p className="text-blue-400 font-semibold text-xs mb-1">Recommendation:</p>
                              <p className="text-white/80 text-sm">{finding.recommendation}</p>
                            </div>
                          )}

                          {/* Documentation Links - NEW */}
                          {finding.documentation_links && finding.documentation_links.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-500/10 rounded border border-blue-500/30">
                              <p className="text-blue-400 font-semibold text-xs mb-2">📚 Documentation:</p>
                              <div className="space-y-1">
                                {finding.documentation_links.map((link, i) => (
                                  <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-300 hover:text-blue-200 text-xs underline"
                                  >
                                    {link.title} ({link.type})
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {finding.status === 'open' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAutoRemediate(finding.id)}
                                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Auto-Fix
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedFinding(finding);
                                  setShowRemediationModal(true);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Create Task
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  updateFindingMutation.mutate({
                                    id: finding.id,
                                    data: { 
                                      status: 'accepted_risk',
                                      resolution_notes: 'Risk accepted by team'
                                    }
                                  });
                                }}
                                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                              >
                                Accept Risk
                              </Button>
                            </>
                          )}
                          
                          {finding.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                updateFindingMutation.mutate({
                                  id: finding.id,
                                  data: { 
                                    status: 'resolved',
                                    resolved_at: new Date().toISOString()
                                  }
                                });
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
                        <span>ID: {finding.finding_id}</span>
                        <span>•</span>
                        <span>Detected: {new Date(finding.detected_at).toLocaleDateString()}</span>
                        {finding.endpoint && (
                          <>
                            <span>•</span>
                            <span>Endpoint: {finding.endpoint}</span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Remediation Tasks */}
      {remediationTasks.length > 0 && (
        <Card className="bg-white/5 border-[#f4d35e]/20 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#f4d35e]" />
              Active Remediation Tasks ({inProgressTasks.length} in progress)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {remediationTasks.slice(0, 10).map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-white/5 rounded-lg border border-amber-500/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{task.title}</h4>
                    <Badge className={
                      task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      task.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-white/60 text-sm mb-3">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className={severityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="text-white/50">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {task.assigned_name && (
                      <div className="flex items-center gap-1 text-white/60">
                        <Users className="w-3 h-3" />
                        {task.assigned_name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Remediation Modal */}
      <Dialog open={showRemediationModal} onOpenChange={setShowRemediationModal}>
        <DialogContent className="bg-[#0a1929] border-[#f4d35e]/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create Remediation Task</DialogTitle>
          </DialogHeader>
          {selectedFinding && (
            <form onSubmit={handleCreateRemediation}>
              <div className="space-y-4">
                <div className="p-3 bg-red-500/10 rounded border border-red-500/30">
                  <p className="text-red-400 font-semibold text-sm mb-1">Finding:</p>
                  <p className="text-white text-sm">{selectedFinding.title}</p>
                </div>

                <div>
                  <Label className="text-white">Task Title</Label>
                  <Input
                    name="title"
                    defaultValue={`Fix: ${selectedFinding.title}`}
                    required
                    className="bg-white/5 border-[#f4d35e]/30 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-white">Description & Steps</Label>
                  <Textarea
                    name="description"
                    defaultValue={selectedFinding.recommendation}
                    required
                    rows={4}
                    className="bg-white/5 border-[#f4d35e]/30 text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Priority</Label>
                    <Select name="priority" defaultValue={selectedFinding.severity === 'critical' ? 'critical' : 'high'}>
                      <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Due Date</Label>
                    <Input
                      type="date"
                      name="due_date"
                      required
                      className="bg-white/5 border-[#f4d35e]/30 text-white mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Estimated Hours</Label>
                  <Input
                    type="number"
                    name="estimated_hours"
                    defaultValue="4"
                    min="0"
                    step="0.5"
                    className="bg-white/5 border-[#f4d35e]/30 text-white mt-1"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRemediationModal(false)}
                  className="border-[#f4d35e]/30 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRemediationMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  Create Task
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
