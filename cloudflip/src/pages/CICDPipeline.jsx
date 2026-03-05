
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Play,
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RotateCcw,
  AlertTriangle,
  Terminal,
  Zap,
  Shield,
  TrendingUp,
  FileText,
  Code,
  Settings as SettingsIcon,
  Activity, // Added
  Target, // Added
  Sparkles as SparklesIcon // Added
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors = {
  queued: 'bg-gray-500/20 text-gray-400',
  running: 'bg-blue-500/20 text-blue-400',
  building: 'bg-purple-500/20 text-purple-400',
  testing: 'bg-amber-500/20 text-amber-400',
  success: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400'
};

const statusIcons = {
  queued: Clock,
  running: Loader2,
  building: Code,
  testing: Shield,
  success: CheckCircle,
  failed: XCircle,
  cancelled: XCircle
};

export default function CICDPipeline() {
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [runningPipeline, setRunningPipeline] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: pipelines = [] } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => api.entities.Pipeline.list('-created_date'),
    enabled: !!user
  });

  const { data: pipelineRuns = [] } = useQuery({
    queryKey: ['pipeline-runs'],
    queryFn: () => api.entities.PipelineRun.list('-started_at', 50),
    refetchInterval: 10000,
    enabled: !!user
  });

  const { data: builds = [] } = useQuery({
    queryKey: ['builds'],
    queryFn: () => api.entities.Build.list('-started_at', 50),
    refetchInterval: 10000,
    enabled: !!user
  });

  const { data: releases = [] } = useQuery({
    queryKey: ['releases'],
    queryFn: () => api.entities.Release.list('-started_at', 30),
    enabled: !!user
  });

  // NEW: Canary Deployments Query
  const { data: canaryDeployments = [] } = useQuery({
    queryKey: ['canary-deployments'],
    queryFn: () => api.entities.CanaryDeployment.list('-started_at', 20),
    refetchInterval: 10000,
    enabled: !!user
  });

  // NEW: Performance Benchmarks Query
  const { data: benchmarks = [] } = useQuery({
    queryKey: ['performance-benchmarks'],
    queryFn: () => api.entities.PerformanceBenchmark.list('-created_date', 20),
    refetchInterval: 30000,
    enabled: !!user
  });

  const createPipelineMutation = useMutation({
    mutationFn: async (data) => {
      return api.entities.Pipeline.create({
        ...data,
        org_id: user.current_org_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setShowCreateModal(false);
      toast.success('Pipeline created!');
    }
  });

  const triggerPipelineMutation = useMutation({
    mutationFn: async ({ pipelineId, branch = 'main' }) => {
      const { data } = await api.functions.invoke('cicdRunner', {
        pipeline_id: pipelineId,
        git_branch: branch,
        triggered_by: user.id,
        trigger_type: 'manual'
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-runs'] });
      setRunningPipeline(data.run_id);
      toast.success('Pipeline started!');
    }
  });

  const rollbackMutation = useMutation({
    mutationFn: async (releaseId) => {
      return api.entities.Release.update(releaseId, { status: 'rolled_back' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      toast.success('Rollback initiated!');
    }
  });

  // NEW: Run Benchmark Mutation
  const runBenchmarkMutation = useMutation({
    mutationFn: async (releaseId) => {
      const { data } = await api.functions.invoke('performanceBenchmarker', {
        releaseId,
        testType: 'load_test',
        testConfig: {
          virtual_users: 100,
          duration_seconds: 60,
          ramp_up_seconds: 10,
          target_rps: 50
        }
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['performance-benchmarks'] });
      toast.success(`Benchmark complete: ${data.production_readiness}`);
    }
  });

  // NEW: Start Canary Mutation
  const startCanaryMutation = useMutation({
    mutationFn: async (releaseId) => {
      const { data } = await api.functions.invoke('canaryDeploymentManager', {
        action: 'start_canary',
        releaseId,
        trafficSplit: { canary_pct: 10, baseline_pct: 90 }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canary-deployments'] });
      toast.success('Canary deployment started!');
    }
  });

  const handleCreatePipeline = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    createPipelineMutation.mutate({
      project: formData.get('project'),
      repo_url: formData.get('repo_url'),
      branches: [formData.get('branch') || 'main'],
      stages: ['build', 'test', 'security_scan', 'deploy'],
      environments: {
        dev: { auto_deploy: true },
        staging: { auto_deploy: false },
        production: { auto_deploy: false }
      }
    });
  };

  const handleTriggerPipeline = (pipelineId) => {
    triggerPipelineMutation.mutate({ pipelineId });
  };

  const handleRollback = (releaseId) => {
    if (confirm('Are you sure you want to rollback this release?')) {
      rollbackMutation.mutate(releaseId);
    }
  };

  // Calculate stats
  const totalRuns = pipelineRuns.length;
  const successfulRuns = pipelineRuns.filter(r => r.status === 'success').length;
  const failedRuns = pipelineRuns.filter(r => r.status === 'failed').length;
  const successRate = totalRuns > 0 ? (successfulRuns / totalRuns * 100).toFixed(1) : 0;

  const avgDuration = pipelineRuns
    .filter(r => r.duration_seconds)
    .reduce((sum, r) => sum + r.duration_seconds, 0) / pipelineRuns.filter(r => r.duration_seconds).length || 0;

  const recentBuilds = builds.slice(0, 10);
  const passedBuilds = recentBuilds.filter(b => b.status === 'success').length;
  const buildSuccessRate = recentBuilds.length > 0 ? (passedBuilds / recentBuilds.length * 100).toFixed(1) : 0;

  // DORA metrics
  const deploymentFrequency = releases.filter(r => 
    r.status === 'success' && 
    new Date(r.started_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length / 7;

  const avgLeadTime = releases
    .filter(r => r.dora_metrics?.lead_time_minutes)
    .reduce((sum, r) => sum + r.dora_metrics.lead_time_minutes, 0) / releases.length || 0;

  const changeFailRate = releases.length > 0 
    ? (releases.filter(r => r.status === 'failed').length / releases.length * 100).toFixed(1)
    : 0;

  // NEW: Derived state for new features
  const activeCanaries = canaryDeployments.filter(c => ['running', 'analyzing'].includes(c.status));
  const latestBenchmark = benchmarks[0];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-[#06162a] to-[#0b213d]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-cyan-400" />
            CI/CD <span className="text-cyan-400">Pipeline</span>
          </h1>
          <p className="text-white/70 mt-1">Automated testing, deployment, and rollback</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold"
        >
          <Play className="w-4 h-4 mr-2" />
          New Pipeline
        </Button>
      </div>

      {/* NEW: Active Canary Deployments Alert */}
      {activeCanaries.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
              <div className="flex-1">
                <p className="text-blue-400 font-semibold text-sm">
                  {activeCanaries.length} Active Canary Deployment{activeCanaries.length > 1 ? 's' : ''}
                </p>
                <p className="text-white/70 text-xs">
                  {activeCanaries[0].canary_version} → {activeCanaries[0].traffic_split.canary_pct}% traffic
                </p>
              </div>
              <Badge className="bg-blue-500/30 text-blue-300">
                {activeCanaries[0].status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NEW: Latest Benchmark Results */}
      {latestBenchmark && latestBenchmark.ai_analysis && (
        <Card className="bg-white/5 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              Latest Performance Benchmark
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Metrics */}
              <div className="space-y-3">
                <div>
                  <p className="text-white/60 text-xs mb-1">P95 Latency</p>
                  <p className="text-2xl font-bold text-white">
                    {latestBenchmark.results.p95_latency_ms?.toFixed(0)}ms
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Error Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {latestBenchmark.results.error_rate?.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Production Readiness</p>
                  <Badge className={
                    latestBenchmark.ai_analysis.production_readiness === 'ready' ? 'bg-green-500/20 text-green-400' :
                    latestBenchmark.ai_analysis.production_readiness === 'ready_with_concerns' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }>
                    {latestBenchmark.ai_analysis.production_readiness.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              {/* AI Bottlenecks */}
              <div>
                <p className="text-white/60 text-xs font-semibold mb-2">AI-Detected Bottlenecks:</p>
                {latestBenchmark.ai_analysis.bottlenecks?.length > 0 ? (
                  <div className="space-y-2">
                    {latestBenchmark.ai_analysis.bottlenecks.slice(0, 2).map((bottleneck, idx) => (
                      <div key={idx} className="p-2 bg-white/5 rounded border border-amber-500/20">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white text-xs font-semibold">{bottleneck.component}</p>
                          <Badge className={
                            bottleneck.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            bottleneck.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }>
                            {bottleneck.severity}
                          </Badge>
                        </div>
                        <p className="text-white/60 text-xs">{bottleneck.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    No bottlenecks detected
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DORA Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <p className="text-white/60 text-sm">Deploy Frequency</p>
            </div>
            <p className="text-3xl font-bold text-white">{deploymentFrequency.toFixed(1)}</p>
            <p className="text-xs text-white/60 mt-1">deploys/day</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <p className="text-white/60 text-sm">Lead Time</p>
            </div>
            <p className="text-3xl font-bold text-white">{avgLeadTime.toFixed(0)}</p>
            <p className="text-xs text-white/60 mt-1">minutes</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <p className="text-white/60 text-sm">Change Fail Rate</p>
            </div>
            <p className="text-3xl font-bold text-white">{changeFailRate}%</p>
            <p className="text-xs text-white/60 mt-1">of deployments</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-white/60 text-sm">Success Rate</p>
            </div>
            <p className="text-3xl font-bold text-white">{successRate}%</p>
            <p className="text-xs text-white/60 mt-1">pipeline runs</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Status */}
      <Tabs defaultValue="runs" className="mt-6">
        {/* Updated: TabsList to grid-cols-4 and added Canary Deploys */}
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-cyan-500/20 p-1">
          <TabsTrigger value="runs">Pipeline Runs</TabsTrigger>
          <TabsTrigger value="canary">
            Canary Deploys
            {activeCanaries.length > 0 && (
              <Badge className="ml-2 bg-blue-500/30 text-blue-300 text-xs">
                {activeCanaries.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="builds">Builds & Tests</TabsTrigger>
          <TabsTrigger value="releases">Releases</TabsTrigger>
        </TabsList>

        {/* Pipeline Runs */}
        <TabsContent value="runs" className="mt-6 space-y-4">
          {pipelines.length === 0 ? (
            <Card className="bg-white/5 border-cyan-500/20">
              <CardContent className="text-center py-12">
                <GitBranch className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
                <p className="text-white/60 mb-4">No pipelines configured yet</p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-cyan-600 hover:bg-cyan-700">
                  Create Your First Pipeline
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Active Pipelines */}
              <div className="grid md:grid-cols-2 gap-4">
                {pipelines.map((pipeline) => {
                  const pipelineRun = pipelineRuns.find(r => r.pipeline_id === pipeline.id);
                  const isRunning = pipelineRun && ['queued', 'running', 'building', 'testing'].includes(pipelineRun.status);

                  return (
                    <Card key={pipeline.id} className="bg-white/5 border-cyan-500/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-lg">{pipeline.project}</CardTitle>
                          {isRunning && (
                            <Badge className="bg-blue-500/20 text-blue-400 animate-pulse">
                              Running
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <GitBranch className="w-4 h-4" />
                            {pipeline.branches?.join(', ') || 'main'}
                          </div>
                          <div className="flex items-center gap-2">
                            {pipeline.stages?.map((stage, idx) => (
                              <Badge key={idx} className="bg-cyan-500/20 text-cyan-400 text-xs">
                                {stage}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            onClick={() => handleTriggerPipeline(pipeline.id)}
                            disabled={triggerPipelineMutation.isPending || isRunning}
                            className="w-full bg-cyan-600 hover:bg-cyan-700"
                          >
                            {isRunning ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Running...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Trigger Build
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Runs */}
              <Card className="bg-white/5 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Pipeline Runs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pipelineRuns.slice(0, 10).map((run) => {
                      const StatusIcon = statusIcons[run.status] || Clock;
                      const pipeline = pipelines.find(p => p.id === run.pipeline_id);

                      return (
                        <motion.div
                          key={run.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-white/5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition-all"
                          onClick={() => setSelectedRun(run)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <StatusIcon className={`w-4 h-4 ${
                                  run.status === 'running' ? 'animate-spin' : ''
                                } ${
                                  run.status === 'success' ? 'text-green-400' :
                                  run.status === 'failed' ? 'text-red-400' :
                                  'text-cyan-400'
                                }`} />
                                <span className="text-white font-medium">
                                  {pipeline?.project || 'Unknown'} #{run.run_number}
                                </span>
                                <Badge className={statusColors[run.status]}>
                                  {run.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-white/60">
                                <span>📦 {run.git_branch}</span>
                                <span>💾 {run.git_sha?.slice(0, 7)}</span>
                                {run.duration_seconds && (
                                  <span>⏱️ {run.duration_seconds}s</span>
                                )}
                              </div>
                              <p className="text-white/70 text-xs mt-2 truncate">
                                {run.git_message || 'No commit message'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* NEW: Canary Deployments Tab */}
        <TabsContent value="canary" className="mt-6 space-y-4">
          <Card className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Canary Deployments</CardTitle>
                <Badge className="bg-purple-500/20 text-purple-400">
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  AI-Analyzed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {canaryDeployments.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
                  <p className="text-white/60">No canary deployments yet</p>
                  <p className="text-white/40 text-sm mt-1">Canaries auto-start with new releases</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {canaryDeployments.map((canary) => (
                    <div key={canary.id} className="p-4 bg-white/5 rounded-lg border border-cyan-500/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={statusColors[canary.status]}>
                              {canary.status}
                            </Badge>
                            <span className="text-white font-medium">{canary.canary_version}</span>
                          </div>
                          <p className="text-white/60 text-xs">
                            Traffic: {canary.traffic_split?.canary_pct}% canary, {canary.traffic_split?.baseline_pct}% baseline
                          </p>
                        </div>
                      </div>

                      {/* Performance Comparison */}
                      {canary.performance_metrics && (
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/10">
                          <div>
                            <p className="text-white/50 text-xs mb-2">Canary Metrics</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-white/60">P95 Latency:</span>
                                <span className="text-white font-semibold">
                                  {canary.performance_metrics.canary?.p95_latency_ms?.toFixed(0)}ms
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Error Rate:</span>
                                <span className="text-white font-semibold">
                                  {canary.performance_metrics.canary?.error_rate?.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-white/50 text-xs mb-2">Baseline (Prod)</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-white/60">P95 Latency:</span>
                                <span className="text-white font-semibold">
                                  {canary.performance_metrics.baseline?.p95_latency_ms?.toFixed(0)}ms
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Error Rate:</span>
                                <span className="text-white font-semibold">
                                  {canary.performance_metrics.baseline?.error_rate?.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Analysis */}
                      {canary.ai_analysis && (
                        <div className="mt-3 p-3 bg-purple-500/10 rounded border border-purple-500/30">
                          <p className="text-purple-400 text-xs font-semibold mb-2 flex items-center gap-2">
                            <SparklesIcon className="w-3 h-3" />
                            AI Recommendation: {canary.ai_analysis.recommendation}
                          </p>
                          {canary.ai_analysis.bottlenecks_detected?.length > 0 && (
                            <p className="text-white/70 text-xs">
                              ⚠️ {canary.ai_analysis.bottlenecks_detected.length} bottleneck(s) detected
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Builds & Tests */}
        <TabsContent value="builds" className="mt-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/5 border-cyan-500/20">
              <CardContent className="p-4">
                <p className="text-white/60 text-sm mb-1">Build Success Rate</p>
                <p className="text-3xl font-bold text-white">{buildSuccessRate}%</p>
                <p className="text-xs text-white/60 mt-1">Last 10 builds</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-cyan-500/20">
              <CardContent className="p-4">
                <p className="text-white/60 text-sm mb-1">Avg Build Time</p>
                <p className="text-3xl font-bold text-white">
                  {(builds.reduce((sum, b) => sum + (b.duration_seconds || 0), 0) / builds.length || 0).toFixed(0)}s
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-cyan-500/20">
              <CardContent className="p-4">
                <p className="text-white/60 text-sm mb-1">Tests Passed</p>
                <p className="text-3xl font-bold text-green-400">
                  {builds.reduce((sum, b) => sum + (b.unit_tests?.passed || 0), 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Builds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBuilds.map((build, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-lg border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[build.status]}>
                          {build.status}
                        </Badge>
                        <span className="text-white font-medium text-sm">Build #{build.build_number}</span>
                      </div>
                      {build.duration_seconds && (
                        <span className="text-white/60 text-xs">⏱️ {build.duration_seconds}s</span>
                      )}
                    </div>

                    {build.unit_tests && (
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-white/60">Unit Tests</p>
                          <p className="text-white font-semibold">
                            {build.unit_tests.passed}/{build.unit_tests.total}
                          </p>
                        </div>
                        {build.code_quality?.coverage_pct !== undefined && (
                          <div>
                            <p className="text-white/60">Coverage</p>
                            <p className="text-white font-semibold">{build.code_quality.coverage_pct}%</p>
                          </div>
                        )}
                        {build.code_quality?.security_issues !== undefined && (
                          <div>
                            <p className="text-white/60">Security Issues</p>
                            <p className={`font-semibold ${build.code_quality.security_issues > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {build.code_quality.security_issues}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {build.error_details && (
                      <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
                        <p className="text-red-400 text-xs font-mono">{build.error_details}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Releases */}
        <TabsContent value="releases" className="mt-6 space-y-4">
          <Card className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">Production Releases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {releases.filter(r => r.environment === 'production').slice(0, 15).map((release, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-lg border border-cyan-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={statusColors[release.status]}>
                            {release.status}
                          </Badge>
                          <span className="text-white font-medium">v{release.version}</span>
                          <span className="text-white/60 text-xs">({release.git_sha?.slice(0, 7)})</span>
                        </div>
                        <p className="text-white/60 text-xs">
                          {format(new Date(release.started_at), 'MMM d, yyyy HH:mm')}
                        </p>
                        {release.deployed_by && (
                          <p className="text-white/50 text-xs mt-1">
                            by {release.deployed_by}
                          </p>
                        )}
                      </div>
                      {release.status === 'success' && (
                        <Button
                          onClick={() => handleRollback(release.id)}
                          size="sm"
                          variant="outline"
                          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Rollback
                        </Button>
                      )}
                    </div>

                    {release.dora_metrics && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-white/60">Lead Time</p>
                          <p className="text-white font-semibold">{release.dora_metrics.lead_time_minutes}m</p>
                        </div>
                        {release.dora_metrics.mttr_minutes && (
                          <div>
                            <p className="text-white/60">MTTR</p>
                            <p className="text-white font-semibold">{release.dora_metrics.mttr_minutes}m</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Pipeline Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#0a1929] border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Create CI/CD Pipeline</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePipeline}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project" className="text-white">Project Name</Label>
                <Input
                  id="project"
                  name="project"
                  placeholder="my-app"
                  required
                  className="bg-white/5 border-cyan-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="repo_url" className="text-white">Repository URL</Label>
                <Input
                  id="repo_url"
                  name="repo_url"
                  placeholder="https://github.com/user/repo"
                  required
                  className="bg-white/5 border-cyan-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="branch" className="text-white">Branch</Label>
                <Input
                  id="branch"
                  name="branch"
                  placeholder="main"
                  defaultValue="main"
                  className="bg-white/5 border-cyan-500/30 text-white"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="border-cyan-500/30 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPipelineMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Create Pipeline
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Run Details Dialog */}
      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="bg-[#0a1929] border-cyan-500/30 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Pipeline Run #{selectedRun?.run_number}
            </DialogTitle>
          </DialogHeader>
          {selectedRun && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/60 text-xs">Status</Label>
                  <Badge className={`${statusColors[selectedRun.status]} mt-1`}>
                    {selectedRun.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Duration</Label>
                  <p className="text-white mt-1">{selectedRun.duration_seconds || 0}s</p>
                </div>
              </div>

              {selectedRun.stages && (
                <div>
                  <Label className="text-white mb-2 block">Pipeline Stages</Label>
                  <div className="space-y-2">
                    {selectedRun.stages.map((stage, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-lg border border-cyan-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-medium capitalize">{stage.name}</span>
                          <Badge className={statusColors[stage.status]}>
                            {stage.status}
                          </Badge>
                        </div>
                        {stage.duration_seconds && (
                          <p className="text-white/60 text-xs">Duration: {stage.duration_seconds}s</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRun.test_results && (
                <div>
                  <Label className="text-white mb-2 block">Test Results</Label>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                      <p className="text-white/60 text-xs mb-1">Total</p>
                      <p className="text-white font-bold">{selectedRun.test_results.total}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg text-center">
                      <p className="text-green-400 text-xs mb-1">Passed</p>
                      <p className="text-white font-bold">{selectedRun.test_results.passed}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg text-center">
                      <p className="text-red-400 text-xs mb-1">Failed</p>
                      <p className="text-white font-bold">{selectedRun.test_results.failed}</p>
                    </div>
                    <div className="p-3 bg-gray-500/10 rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">Skipped</p>
                      <p className="text-white font-bold">{selectedRun.test_results.skipped}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
