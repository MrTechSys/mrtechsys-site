
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast'; // Assuming toast utility from shadcn/ui
import {
  Database,
  ArrowLeft,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Activity,
  Zap,
  Shield,
  Loader2 // Added Loader2 for loading spinner
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function OpsDeploys() {
  const [user, setUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedEnv, setSelectedEnv] = useState('all');
  const [includeDemoData, setIncludeDemoData] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [optimizationInsights, setOptimizationInsights] = useState(null);
  const [loadingOptimization, setLoadingOptimization] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: releases = [] } = useQuery({
    queryKey: ['releases', selectedProject, selectedEnv, includeDemoData, timeRange],
    queryFn: () => {
      const filters = { org_id: user.current_org_id };
      
      if (selectedProject !== 'all') {
        filters.pipeline_id = selectedProject;
      }
      
      if (selectedEnv !== 'all') {
        filters.environment = selectedEnv;
      }

      return api.entities.Release.filter(filters, '-started_at', 200);
    },
    enabled: !!user
  });

  const { data: pipelines = [] } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => api.entities.Pipeline.filter({ org_id: user.current_org_id }),
    enabled: !!user
  });

  const { data: slas = [] } = useQuery({
    queryKey: ['slas'],
    queryFn: () => api.entities.SLA.filter({ org_id: user.current_org_id }),
    enabled: !!user
  });

  const { data: pipelineRuns = [] } = useQuery({
    queryKey: ['pipeline-runs', selectedProject],
    queryFn: () => {
      const filters = { org_id: user.current_org_id };
      if (selectedProject !== 'all') {
        filters.pipeline_id = selectedProject;
      }
      return api.entities.PipelineRun.filter(filters, '-started_at', 100);
    },
    enabled: !!user
  });

  const { data: builds = [] } = useQuery({
    queryKey: ['builds'],
    queryFn: () => api.entities.Build.filter({
      org_id: user.current_org_id
    }, '-started_at', 100),
    enabled: !!user
  });

  const handleRunOptimization = async () => {
    setLoadingOptimization(true);
    try {
      const { data } = await api.functions.invoke('cicdOptimizer', {
        orgId: user.current_org_id,
        pipelineId: selectedProject !== 'all' ? selectedProject : null
      });
      setOptimizationInsights(data.analysis);
      toast.success({
        title: 'Analysis Complete',
        description: `${data.analysis.recommendations.length} recommendations generated.`
      });
    } catch (error) {
      toast.error({
        title: 'Optimization Analysis Failed',
        description: 'There was an error running the AI optimization. Please try again.'
      });
      console.error(error);
    } finally {
      setLoadingOptimization(false);
    }
  };

  // Calculate DORA metrics
  const calculateDORAMetrics = (releasesList) => {
    if (releasesList.length === 0) {
      return {
        deploymentFrequency: 0,
        leadTime: 0,
        changeFailureRate: 0,
        mttr: 0
      };
    }

    // Deployment Frequency (deploys per day)
    const daySpan = 30; // Based on timeRange
    const deploymentFrequency = releasesList.filter(r => r.status === 'success').length / daySpan;

    // Lead Time for Changes (average)
    const withLeadTime = releasesList.filter(r => r.dora_metrics?.lead_time_minutes);
    const leadTime = withLeadTime.length > 0
      ? withLeadTime.reduce((sum, r) => sum + r.dora_metrics.lead_time_minutes, 0) / withLeadTime.length
      : 0;

    // Change Failure Rate
    const totalDeploys = releasesList.length;
    const failedDeploys = releasesList.filter(r => r.status === 'failed').length;
    const changeFailureRate = totalDeploys > 0 ? (failedDeploys / totalDeploys) * 100 : 0;

    // MTTR (Mean Time to Restore) - calculated from incidents
    // For now, use average time from failed to rolled_back
    const failedToRolledBack = releasesList.filter(r => 
      r.status === 'rolled_back' && r.started_at && r.completed_at
    );
    const mttr = failedToRolledBack.length > 0
      ? failedToRolledBack.reduce((sum, r) => {
          const start = new Date(r.started_at);
          const end = new Date(r.completed_at);
          return sum + (end - start) / 60000; // Convert to minutes
        }, 0) / failedToRolledBack.length
      : 0;

    return { deploymentFrequency, leadTime, changeFailureRate, mttr };
  };

  const allMetrics = calculateDORAMetrics(releases);

  // SLA impact from DORA metrics
  const slaImpact = slas.map(sla => {
    let impacted = false;
    const reasons = [];

    if (sla.error_rate_target && allMetrics.changeFailureRate > sla.error_rate_target) {
      impacted = true;
      reasons.push(`Change failure rate ${allMetrics.changeFailureRate.toFixed(1)}% exceeds SLA target ${sla.error_rate_target}%`);
    }

    if (sla.mttr_target_minutes && allMetrics.mttr > sla.mttr_target_minutes) {
      impacted = true;
      reasons.push(`MTTR ${allMetrics.mttr.toFixed(0)}min exceeds SLA target ${sla.mttr_target_minutes}min`);
    }

    return { sla, impacted, reasons };
  }).filter(item => item.impacted);


  // DORA performance levels
  const getDeployFrequencyLevel = (freq) => {
    if (freq >= 1) return { label: 'Elite', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (freq >= 0.14) return { label: 'High', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (freq >= 0.03) return { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'Low', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getLeadTimeLevel = (minutes) => {
    if (minutes < 60) return { label: 'Elite', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (minutes < 1440) return { label: 'High', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (minutes < 10080) return { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'Low', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getChangeFailLevel = (rate) => {
    if (rate < 5) return { label: 'Elite', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (rate < 15) return { label: 'High', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (rate < 30) return { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'Low', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getMTTRLevel = (minutes) => {
    if (minutes < 60) return { label: 'Elite', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (minutes < 1440) return { label: 'High', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (minutes < 10080) return { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'Low', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  // CI/CD Performance Metrics
  const successfulPipelineRuns = pipelineRuns.filter(pr => pr.status === 'success');
  const failedPipelineRuns = pipelineRuns.filter(pr => pr.status === 'failed');
  const pipelineSuccessRate = pipelineRuns.length > 0 
    ? (successfulPipelineRuns.length / pipelineRuns.length) * 100 
    : 0;

  const avgPipelineDuration = pipelineRuns.filter(pr => pr.duration_seconds)
    .reduce((sum, pr) => sum + pr.duration_seconds, 0) / 
    Math.max(pipelineRuns.filter(pr => pr.duration_seconds).length, 1);

  const avgTestPassRate = builds.filter(b => b.unit_tests?.total)
    .reduce((sum, b) => {
      const passRate = (b.unit_tests.passed / b.unit_tests.total) * 100;
      return sum + passRate;
    }, 0) / Math.max(builds.filter(b => b.unit_tests?.total).length, 1);

  const avgCodeCoverage = builds.filter(b => b.code_quality?.coverage_pct)
    .reduce((sum, b) => sum + b.code_quality.coverage_pct, 0) / 
    Math.max(builds.filter(b => b.code_quality?.coverage_pct).length, 1);

  // Correlate pipeline failures with deployment failures
  const pipelineToDeployCorrelation = releases.filter(r => {
    const relatedRun = pipelineRuns.find(pr => pr.release_id === r.id);
    return relatedRun && relatedRun.status === 'failed' && r.status === 'failed';
  });

  // Trend data (last 30 days, grouped by day)
  const trendData = {};
  releases.forEach(release => {
    const day = new Date(release.started_at).toISOString().split('T')[0];
    if (!trendData[day]) {
      trendData[day] = { date: day, deploys: 0, failures: 0, avgLeadTime: [] };
    }
    if (release.status === 'success') {
      trendData[day].deploys += 1;
    }
    if (release.status === 'failed') {
      trendData[day].failures += 1;
    }
    if (release.dora_metrics?.lead_time_minutes) {
      trendData[day].avgLeadTime.push(release.dora_metrics.lead_time_minutes);
    }
  });

  const trendsArray = Object.values(trendData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30)
    .map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      deploys: d.deploys,
      failures: d.failures,
      changeFailRate: d.deploys > 0 ? (d.failures / (d.deploys + d.failures)) * 100 : 0,
      leadTime: d.avgLeadTime.length > 0 
        ? d.avgLeadTime.reduce((sum, v) => sum + v, 0) / d.avgLeadTime.length 
        : null
    }));

  const deployFreqLevel = getDeployFrequencyLevel(allMetrics.deploymentFrequency);
  const leadTimeLevel = getLeadTimeLevel(allMetrics.leadTime);
  const changeFailLevel = getChangeFailLevel(allMetrics.changeFailureRate);
  const mttrLevel = getMTTRLevel(allMetrics.mttr);

  const uniqueProjects = [...new Set(pipelines.map(p => p.project))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link to={createPageUrl("LaunchControlCenter")}>
          <button className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Launch Control
          </button>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Database className="w-8 h-8 text-[#f4d35e]" />
              Deployment <span className="text-[#f4d35e]">Metrics</span>
            </h1>
            <p className="text-white/70 mt-1">DORA metrics and CI/CD performance</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleRunOptimization}
              disabled={loadingOptimization || !user} // Disable if not authenticated
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
            >
              {loadingOptimization ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Optimization
                </>
              )}
            </Button>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-40 bg-white/5 border-[#f4d35e]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                <SelectItem value="all">All Projects</SelectItem>
                {uniqueProjects.map(proj => (
                  <SelectItem key={proj} value={proj}>{proj}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEnv} onValueChange={setSelectedEnv}>
              <SelectTrigger className="w-40 bg-white/5 border-[#f4d35e]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>

            {user?.role === 'admin' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-[#f4d35e]/20">
                <Label className="text-white text-sm">Include Demo</Label>
                <Switch
                  checked={includeDemoData}
                  onCheckedChange={setIncludeDemoData}
                  className="data-[state=checked]:bg-[#f4d35e]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Optimization Insights */}
      {optimizationInsights && (
        <Card className="bg-white/5 border-purple-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Optimization Recommendations
              <Badge className={`ml-2 ${
                optimizationInsights.optimization_score >= 80 ? 'bg-green-500/20 text-green-400' :
                optimizationInsights.optimization_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Score: {optimizationInsights.optimization_score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Root Causes */}
            {optimizationInsights.root_causes && optimizationInsights.root_causes.length > 0 && (
              <div>
                <h4 className="text-white/80 font-medium mb-2 text-sm">Root Causes Identified</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {optimizationInsights.root_causes.map((cause, idx) => (
                    <div key={idx} className="p-3 bg-red-500/10 rounded-lg border border-red-500/30 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className="bg-red-500/20 text-red-400 text-xs">
                          {cause.severity}
                        </Badge>
                        <span className="text-white/60 text-xs">{cause.frequency}x</span>
                      </div>
                      <p className="text-white/80">{cause.cause}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {optimizationInsights.recommendations && optimizationInsights.recommendations.length > 0 && (
              <div>
                <h4 className="text-white/80 font-medium mb-2 text-sm">Recommended Actions</h4>
                <div className="space-y-3">
                  {optimizationInsights.recommendations.slice(0, 5).map((rec, idx) => {
                    const priorityColors = {
                      critical: 'border-red-500/30 bg-red-500/10',
                      high: 'border-orange-500/30 bg-orange-500/10',
                      medium: 'border-yellow-500/30 bg-yellow-500/10',
                      low: 'border-blue-500/30 bg-blue-500/10'
                    };

                    return (
                      <div key={idx} className={`p-4 rounded-lg border ${priorityColors[rec.priority] || 'border-gray-500/30 bg-gray-500/10'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-white font-medium">{rec.title}</h5>
                          <Badge className="bg-white/10 text-white text-xs">
                            {rec.type ? rec.type.replace('_', ' ') : 'General'}
                          </Badge>
                        </div>
                        <p className="text-white/70 text-sm mb-3">{rec.description}</p>
                        
                        {rec.implementation_steps && rec.implementation_steps.length > 0 && (
                          <div className="mb-3">
                            <p className="text-white/60 text-xs mb-2">Implementation:</p>
                            <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
                              {rec.implementation_steps.slice(0, 3).map((step, sidx) => (
                                <li key={sidx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {rec.code_example && (
                          <pre className="bg-[#0a1929] p-3 rounded text-xs text-white/80 overflow-x-auto">
                            {rec.code_example}
                          </pre>
                        )}

                        <div className="flex items-center justify-between mt-3 text-xs">
                          <span className="text-white/50">Est. Effort: {rec.estimated_effort_hours}h</span>
                          <span className="text-green-400">{rec.expected_impact}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Predictive Alerts */}
            {optimizationInsights.predictive_alerts && optimizationInsights.predictive_alerts.length > 0 && (
              <div>
                <h4 className="text-white/80 font-medium mb-2 text-sm">Predictive Alerts</h4>
                <div className="space-y-2">
                  {optimizationInsights.predictive_alerts.map((alert, idx) => (
                    <div key={idx} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-400 font-medium">{alert.risk_type}</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                          {(alert.probability * 100).toFixed(0)}% probability
                        </Badge>
                      </div>
                      <p className="text-white/70 text-xs mb-2">
                        Indicators: {alert.indicators ? alert.indicators.join(', ') : 'N/A'}
                      </p>
                      <p className="text-white/80">{alert.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* No Insights message if all sections are empty */}
            {(!optimizationInsights.root_causes || optimizationInsights.root_causes.length === 0) &&
             (!optimizationInsights.recommendations || optimizationInsights.recommendations.length === 0) &&
             (!optimizationInsights.predictive_alerts || optimizationInsights.predictive_alerts.length === 0) && (
              <p className="text-white/60 text-center py-4">No specific optimization insights found for the selected filters.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* SLA Impact Alert */}
      {slaImpact.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">SLA Impact from DORA Metrics</h3>
              <div className="space-y-2">
                {slaImpact.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="text-red-400 font-medium">{item.sla.name}</p>
                    <ul className="text-white/70 text-xs ml-4 mt-1">
                      {item.reasons.map((reason, ridx) => (
                        <li key={ridx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CI/CD Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-[#3cf7d4]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Pipeline Success Rate</p>
                <p className={`text-3xl font-bold ${pipelineSuccessRate >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {pipelineSuccessRate.toFixed(1)}<span className="text-lg text-white/60">%</span>
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-[#3cf7d4]/50" />
            </div>
            <div className="text-xs text-white/50">
              {successfulPipelineRuns.length} / {pipelineRuns.length} runs
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#3cf7d4]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Avg Build Time</p>
                <p className="text-3xl font-bold text-white">
                  {(avgPipelineDuration / 60).toFixed(1)}<span className="text-lg text-white/60">min</span>
                </p>
              </div>
              <Clock className="w-8 h-8 text-[#3cf7d4]/50" />
            </div>
            <div className="text-xs text-white/50">
              {avgPipelineDuration > 1800 ? 'Optimization needed' : 'Efficient'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#3cf7d4]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Test Pass Rate</p>
                <p className={`text-3xl font-bold ${avgTestPassRate >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {avgTestPassRate.toFixed(1)}<span className="text-lg text-white/60">%</span>
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-[#3cf7d4]/50" />
            </div>
            <div className="text-xs text-white/50">
              Quality gate performance
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#3cf7d4]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Code Coverage</p>
                <p className={`text-3xl font-bold ${avgCodeCoverage >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {avgCodeCoverage.toFixed(1)}<span className="text-lg text-white/60">%</span>
                </p>
              </div>
              <Activity className="w-8 h-8 text-[#3cf7d4]/50" />
            </div>
            <div className="text-xs text-white/50">
              Average across builds
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline to Deploy Correlation */}
      {pipelineToDeployCorrelation.length > 0 && (
        <Card className="bg-white/5 border-yellow-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Pipeline-Deploy Correlation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 text-sm mb-3">
              {pipelineToDeployCorrelation.length} deployment failure(s) correlated with failed pipeline runs
            </p>
            <div className="space-y-2">
              {pipelineToDeployCorrelation.slice(0, 5).map((release) => {
                const relatedRun = pipelineRuns.find(pr => pr.release_id === release.id);
                return (
                  <div key={release.id} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{release.version}</span>
                      <Badge className="bg-red-500/20 text-red-400 text-xs">
                        Pipeline #{relatedRun?.run_number} Failed
                      </Badge>
                    </div>
                    {relatedRun?.error_message && (
                      <p className="text-white/60 text-xs mt-1">{relatedRun.error_message}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* DORA Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Deployment Frequency</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {allMetrics.deploymentFrequency.toFixed(1)}<span className="text-lg text-white/60">/day</span>
                </p>
              </div>
              <Activity className="w-8 h-8 text-[#f4d35e]/50" />
            </div>
            <Badge className={`${deployFreqLevel.bg} ${deployFreqLevel.color} border-0`}>
              {deployFreqLevel.label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Lead Time for Changes</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {allMetrics.leadTime.toFixed(0)}<span className="text-lg text-white/60">min</span>
                </p>
              </div>
              <Clock className="w-8 h-8 text-[#3cf7d4]/50" />
            </div>
            <Badge className={`${leadTimeLevel.bg} ${leadTimeLevel.color} border-0`}>
              {leadTimeLevel.label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Change Failure Rate</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {allMetrics.changeFailureRate.toFixed(1)}<span className="text-lg text-white/60">%</span>
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400/50" />
            </div>
            <Badge className={`${changeFailLevel.bg} ${changeFailLevel.color} border-0`}>
              {changeFailLevel.label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Mean Time to Restore</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {allMetrics.mttr.toFixed(0)}<span className="text-lg text-white/60">min</span>
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-400/50" />
            </div>
            <Badge className={`${mttrLevel.bg} ${mttrLevel.color} border-0`}>
              {mttrLevel.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Trends Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Deployment Frequency Trend */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Deployment Frequency Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendsArray}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="deploys" fill="#f4d35e" name="Successful Deploys" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Time Trend */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Lead Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendsArray.filter(d => d.leadTime !== null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="leadTime" stroke="#3cf7d4" strokeWidth={2} name="Lead Time (min)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Change Failure Rate Trend */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Change Failure Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendsArray}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="changeFailRate" stroke="#f59e0b" strokeWidth={2} name="Failure Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success vs Failures */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Deploy Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendsArray}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="deploys" fill="#10b981" name="Success" stackId="a" />
                <Bar dataKey="failures" fill="#ef4444" name="Failures" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deployments */}
      <Card className="bg-white/5 border-[#f4d35e]/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {releases.length === 0 ? (
              <p className="text-white/60 text-center py-8">No deployments found</p>
            ) : (
              releases.slice(0, 20).map((release) => (
                <div
                  key={release.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-[#f4d35e]/10"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {release.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : release.status === 'failed' ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-400" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{release.version}</p>
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          {release.environment}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-sm">
                        {new Date(release.started_at).toLocaleString()}
                        {release.dora_metrics?.lead_time_minutes && (
                          <span className="ml-2">• {release.dora_metrics.lead_time_minutes}min lead time</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      release.status === 'success'
                        ? 'bg-green-500/20 text-green-400'
                        : release.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {release.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
