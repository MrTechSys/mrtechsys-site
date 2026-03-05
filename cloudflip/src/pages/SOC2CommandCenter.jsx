import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  FileText,
  Users,
  Lock,
  Eye,
  Database,
  Zap,
  Target,
  BarChart3,
  Clock,
  XCircle,
  RefreshCw,
  PlayCircle,
  MapPin,
  Thermometer
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { format } from "date-fns";
import ControlsHeatmap from "../components/soc2/ControlsHeatmap";
import FindingsTimeline from "../components/soc2/FindingsTimeline";
import EvidenceTracker from "../components/soc2/EvidenceTracker";
import ComplianceTrendChart from "../components/soc2/ComplianceTrendChart";
import ControlTestSchedule from "../components/soc2/ControlTestSchedule";
import RiskMatrix from "../components/soc2/RiskMatrix";
import AdvancedAnalyticsDashboard from "../components/soc2/AdvancedAnalyticsDashboard";

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const categoryIcons = {
  security: Shield,
  availability: Activity,
  confidentiality: Lock,
  privacy: Eye,
  integrity: Database
};

const categoryColors = {
  security: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  availability: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  confidentiality: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  privacy: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  integrity: 'from-red-500/20 to-rose-500/20 border-red-500/30'
};

export default function SOC2CommandCenter() {
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: controls = [] } = useQuery({
    queryKey: ['compliance-controls', user?.current_org_id],
    queryFn: () => api.entities.ComplianceControl.filter({ 
      org_id: user?.current_org_id 
    }),
    enabled: !!user?.current_org_id
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['compliance-findings', user?.current_org_id],
    queryFn: () => api.entities.ComplianceFinding.filter({ 
      org_id: user?.current_org_id 
    }),
    enabled: !!user?.current_org_id
  });

  const { data: evidence = [] } = useQuery({
    queryKey: ['evidence-items', user?.current_org_id],
    queryFn: () => api.entities.EvidenceItem.filter({ 
      org_id: user?.current_org_id 
    }),
    enabled: !!user?.current_org_id
  });

  const { data: remediationTasks = [] } = useQuery({
    queryKey: ['remediation-tasks', user?.current_org_id],
    queryFn: () => api.entities.RemediationTask.filter({ 
      org_id: user?.current_org_id 
    }),
    enabled: !!user?.current_org_id
  });

  const { data: complianceMetrics = [] } = useQuery({
    queryKey: ['compliance-metrics', user?.current_org_id],
    queryFn: () => api.entities.ComplianceMetric.filter({ 
      org_id: user?.current_org_id 
    }, '-timestamp', 30),
    enabled: !!user?.current_org_id
  });

  const runAllControlsMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('soc2ControlMonitor', {
        action: 'run_all_controls',
        orgId: user?.current_org_id
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-controls'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-findings'] });
      toast.success(`Tested ${data.totalControls} controls: ${data.passed} passed, ${data.failed} failed`);
    },
    onError: (error) => {
      toast.error("Control testing failed");
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('soc2ControlMonitor', {
        action: 'generate_report',
        orgId: user?.current_org_id
      });
      return data;
    }
  });

  // Analytics calculations
  const totalControls = controls.length;
  const activeControls = controls.filter(c => c.status === 'active').length;
  const failedControls = controls.filter(c => c.status === 'failed').length;
  const inProgressControls = controls.filter(c => c.status === 'in_progress').length;

  const openFindings = findings.filter(f => f.status === 'open');
  const criticalFindings = openFindings.filter(f => f.severity === 'critical');
  const highFindings = openFindings.filter(f => f.severity === 'high');

  const totalEvidence = evidence.length;
  const approvedEvidence = evidence.filter(e => e.status === 'approved').length;
  const pendingEvidence = evidence.filter(e => e.status === 'pending').length;

  const openTasks = remediationTasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
  const overdueTasks = openTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());

  // Category breakdown
  const categoryStats = ['security', 'availability', 'confidentiality', 'privacy', 'integrity'].map(cat => {
    const catControls = controls.filter(c => c.category === cat);
    const catActive = catControls.filter(c => c.status === 'active').length;
    const catEvidence = catControls.reduce((sum, c) => sum + (c.evidence_count || 0), 0);
    
    return {
      category: cat,
      total: catControls.length,
      active: catActive,
      compliance: catControls.length > 0 ? (catActive / catControls.length) * 100 : 0,
      evidence: catEvidence
    };
  });

  // Findings by category
  const findingsByCategory = ['security', 'availability', 'confidentiality', 'privacy', 'integrity'].map(cat => ({
    category: cat.toUpperCase(),
    critical: findings.filter(f => f.category === cat && f.severity === 'critical' && f.status === 'open').length,
    high: findings.filter(f => f.category === cat && f.severity === 'high' && f.status === 'open').length,
    medium: findings.filter(f => f.category === cat && f.severity === 'medium' && f.status === 'open').length,
    low: findings.filter(f => f.category === cat && f.severity === 'low' && f.status === 'open').length
  }));

  // Compliance trend data
  const trendData = complianceMetrics.slice(0, 14).reverse().map(m => ({
    date: format(new Date(m.timestamp), 'MMM d'),
    score: m.value,
    status: m.status
  }));

  // Overall compliance score
  const latestScore = complianceMetrics.length > 0 ? complianceMetrics[0].value : 0;
  const complianceLevel = latestScore >= 90 ? 'excellent' : 
                          latestScore >= 75 ? 'good' : 
                          latestScore >= 60 ? 'needs_improvement' : 'critical';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            SOC 2 <span className="text-amber-400">Command Center</span>
          </h1>
          <p className="text-white/70 mt-1">
            Real-time compliance monitoring & security operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => runAllControlsMutation.mutate()}
            disabled={runAllControlsMutation.isPending}
            className="bg-gradient-to-r from-cyan-600 to-blue-600"
          >
            {runAllControlsMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6 items-center">
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-32 h-32">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="56" 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="8"
                    strokeDasharray={`${(latestScore / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-cyan-400">{Math.round(latestScore)}</span>
                  <span className="text-white/60 text-xs">/ 100</span>
                </div>
              </div>
              <Badge className={`mt-3 ${
                complianceLevel === 'excellent' ? 'bg-green-500/20 text-green-400' :
                complianceLevel === 'good' ? 'bg-blue-500/20 text-blue-400' :
                complianceLevel === 'needs_improvement' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {complianceLevel.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="md:col-span-3 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{activeControls}</p>
                  <p className="text-white/60 text-sm">Active Controls</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{openFindings.length}</p>
                  <p className="text-white/60 text-sm">Open Findings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{approvedEvidence}</p>
                  <p className="text-white/60 text-sm">Evidence Approved</p>
                </div>
              </div>

              <div className="space-y-2">
                {categoryStats.map(stat => {
                  const Icon = categoryIcons[stat.category];
                  return (
                    <div key={stat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm capitalize flex items-center gap-2">
                          <Icon className="w-4 h-4 text-cyan-400" />
                          {stat.category}
                        </span>
                        <span className="text-white/70 text-sm">
                          {stat.active}/{stat.total} • {Math.round(stat.compliance)}%
                        </span>
                      </div>
                      <Progress value={stat.compliance} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Metrics Row */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Critical</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{criticalFindings.length}</p>
            <p className="text-white/60 text-xs mt-1">Critical findings</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-400">Failed</Badge>
            </div>
            <p className="text-3xl font-bold text-orange-400">{failedControls}</p>
            <p className="text-white/60 text-xs mt-1">Failed controls</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <Badge className="bg-yellow-500/20 text-yellow-400">Overdue</Badge>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{overdueTasks.length}</p>
            <p className="text-white/60 text-xs mt-1">Overdue tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Pending</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">{pendingEvidence}</p>
            <p className="text-white/60 text-xs mt-1">Evidence pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6 bg-white/5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Compliance Trend */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Compliance Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="date" stroke="#fff" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#fff" tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#06b6d4" 
                        fill="url(#colorScore)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white/60 text-center py-12">No trend data available</p>
                )}
              </CardContent>
            </Card>

            {/* Category Radar */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Trust Service Criteria Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={categoryStats}>
                    <PolarGrid stroke="#ffffff20" />
                    <PolarAngleAxis dataKey="category" stroke="#fff" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#fff" tick={{ fontSize: 10 }} />
                    <Radar 
                      name="Compliance %" 
                      dataKey="compliance" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.6} 
                    />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #8b5cf6' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Controls Heatmap */}
          <ControlsHeatmap controls={controls} />

          {/* Risk Matrix */}
          <RiskMatrix findings={findings} />

          {/* Findings Timeline */}
          <FindingsTimeline findings={findings.slice(0, 20)} />
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-6">
          <div className="grid gap-4">
            {categoryStats.map(stat => {
              const Icon = categoryIcons[stat.category];
              const catControls = controls.filter(c => c.category === stat.category);

              return (
                <Card key={stat.category} className={`bg-gradient-to-br ${categoryColors[stat.category]}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2 capitalize">
                        <Icon className="w-5 h-5" />
                        {stat.category} Controls
                      </CardTitle>
                      <Badge className="bg-white/20 text-white">
                        {stat.active}/{stat.total} Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {catControls.map(ctrl => (
                        <div key={ctrl.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-white/80">
                                  {ctrl.control_id}
                                </Badge>
                                <Badge className={
                                  ctrl.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                  ctrl.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                  ctrl.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }>
                                  {ctrl.status}
                                </Badge>
                              </div>
                              <h4 className="text-white font-medium">{ctrl.name}</h4>
                              {ctrl.description && (
                                <p className="text-white/60 text-sm mt-1">{ctrl.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-white/50 text-xs">Evidence</p>
                              <p className="text-xl font-bold text-cyan-400">{ctrl.evidence_count || 0}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs text-white/70 mt-3 pt-3 border-t border-white/10">
                            <div>
                              <span className="text-white/50">Owner:</span>
                              <p className="text-white truncate">{ctrl.owner || 'Unassigned'}</p>
                            </div>
                            <div>
                              <span className="text-white/50">Frequency:</span>
                              <p className="text-white capitalize">{ctrl.review_frequency}</p>
                            </div>
                            <div>
                              <span className="text-white/50">Last Review:</span>
                              <p className="text-white">
                                {ctrl.last_reviewed ? format(new Date(ctrl.last_reviewed), 'MMM d') : 'Never'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {catControls.length === 0 && (
                        <p className="text-white/60 text-center py-6">No controls in this category</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Control Test Schedule */}
          <ControlTestSchedule controls={controls} />
        </TabsContent>

        {/* Findings Tab */}
        <TabsContent value="findings" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Findings by Severity */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  Findings by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={findingsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="category" stroke="#fff" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#fff" tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                    <Bar dataKey="high" stackId="a" fill="#f59e0b" name="High" />
                    <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                    <Bar dataKey="low" stackId="a" fill="#06b6d4" name="Low" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Findings Status */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Finding Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Open', value: findings.filter(f => f.status === 'open').length },
                        { name: 'In Progress', value: findings.filter(f => f.status === 'in_progress').length },
                        { name: 'Resolved', value: findings.filter(f => f.status === 'resolved').length },
                        { name: 'Accepted Risk', value: findings.filter(f => f.status === 'accepted_risk').length }
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2, 3].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #10b981' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Critical Findings */}
          <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Critical & High Priority Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...criticalFindings, ...highFindings].slice(0, 10).map(finding => (
                  <div key={finding.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            finding.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            'bg-orange-500/20 text-orange-400'
                          }>
                            {finding.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-white/70 capitalize">
                            {finding.category}
                          </Badge>
                          <Badge className={
                            finding.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                            finding.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }>
                            {finding.status}
                          </Badge>
                        </div>
                        <h4 className="text-white font-semibold">{finding.title}</h4>
                        <p className="text-white/70 text-sm mt-1">{finding.description}</p>
                        {finding.recommendation && (
                          <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                            <p className="text-blue-400 text-xs">
                              💡 {finding.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                      {finding.risk_score && (
                        <div className="text-center ml-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            finding.risk_score >= 75 ? 'bg-red-500/20' :
                            finding.risk_score >= 50 ? 'bg-orange-500/20' :
                            'bg-yellow-500/20'
                          }`}>
                            <span className={`text-2xl font-bold ${
                              finding.risk_score >= 75 ? 'text-red-400' :
                              finding.risk_score >= 50 ? 'text-orange-400' :
                              'text-yellow-400'
                            }`}>
                              {finding.risk_score}
                            </span>
                          </div>
                          <p className="text-white/50 text-xs mt-1">Risk</p>
                        </div>
                      )}
                    </div>
                    {finding.assigned_to && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/50 text-xs">
                          Assigned to: <span className="text-white">{finding.assigned_to}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {criticalFindings.length === 0 && highFindings.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-white font-semibold">No Critical or High Findings</p>
                    <p className="text-white/60 text-sm mt-1">Security posture is strong</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remediation Tasks */}
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Active Remediation Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {openTasks.slice(0, 10).map(task => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                  
                  return (
                    <div key={task.id} className={`p-3 rounded-lg border ${
                      isOverdue ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={
                              task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }>
                              {task.priority}
                            </Badge>
                            <Badge className={
                              task.status === 'todo' ? 'bg-gray-500/20 text-gray-400' :
                              task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-green-500/20 text-green-400'
                            }>
                              {task.status}
                            </Badge>
                            {isOverdue && (
                              <Badge className="bg-red-500/20 text-red-400">
                                <Clock className="w-3 h-3 mr-1" />
                                OVERDUE
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-white font-medium">{task.title}</h4>
                          <p className="text-white/60 text-sm mt-1">{task.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          {task.due_date && (
                            <>
                              <p className="text-white/50 text-xs">Due</p>
                              <p className={`text-sm font-semibold ${
                                isOverdue ? 'text-red-400' : 'text-white'
                              }`}>
                                {format(new Date(task.due_date), 'MMM d')}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {openTasks.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-white/70">All remediation tasks completed!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-6">
          <EvidenceTracker 
            evidence={evidence} 
            controls={controls}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <ComplianceTrendChart metrics={complianceMetrics} />
          
          <AdvancedAnalyticsDashboard orgId={user?.current_org_id} />

          {/* Advanced Analytics Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Evidence Coverage by Control */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Evidence Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="category" stroke="#fff" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#fff" tick={{ fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                    />
                    <Bar dataKey="evidence" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Control Automation Rate */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Automation Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryStats.map(stat => {
                    const catControls = controls.filter(c => c.category === stat.category);
                    const automated = catControls.filter(c => c.automated).length;
                    const automationRate = catControls.length > 0 ? (automated / catControls.length) * 100 : 0;

                    return (
                      <div key={stat.category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-xs capitalize">{stat.category}</span>
                          <span className="text-white/70 text-xs">{Math.round(automationRate)}%</span>
                        </div>
                        <Progress value={automationRate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Health Gauge */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Compliance Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Active Controls</span>
                    <span className="text-green-400 font-bold">
                      {activeControls}/{totalControls}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Open Findings</span>
                    <span className="text-red-400 font-bold">{openFindings.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Evidence Rate</span>
                    <span className="text-purple-400 font-bold">
                      {totalEvidence > 0 ? Math.round((approvedEvidence / totalEvidence) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Overdue Tasks</span>
                    <span className="text-amber-400 font-bold">{overdueTasks.length}</span>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm">Overall Health</span>
                      <Thermometer className={`w-5 h-5 ${
                        latestScore >= 90 ? 'text-green-400' :
                        latestScore >= 75 ? 'text-blue-400' :
                        latestScore >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`} />
                    </div>
                    <Progress value={latestScore} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}