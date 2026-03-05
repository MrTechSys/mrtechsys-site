
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Database,
  Globe,
  Send,
  Sparkles,
  Terminal,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import PredictionCard from '../components/sentinel/PredictionCard';
import DevOpsTeamPanel from '../components/sentinel/DevOpsTeamPanel';
import BehaviorAnomalyMonitor from "../components/security/BehaviorAnomalyMonitor";
import ThreatIntelligenceMonitor from "../components/security/ThreatIntelligenceMonitor";

const randomRadius = () => {
  const radiuses = ['rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl'];
  return radiuses[Math.floor(Math.random() * radiuses.length)];
};

export default function SentinelSRE() {
  const [user, setUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [healthCheckResults, setHealthCheckResults] = useState(null);
  const [runningHealthCheck, setRunningHealthCheck] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [selectedTraceId, setSelectedTraceId] = useState(null);
  const [aggregatedLogs, setAggregatedLogs] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const initConversation = async () => {
      if (!user) return;
      
      try {
        const conv = await api.agents.createConversation({
          agent_name: 'sentinelSRE',
          metadata: {
            name: 'Sentinel Console',
            user_id: user.id
          }
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    };
    
    initConversation();
  }, [user]);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = api.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const { data: systemHealth = [] } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.entities.SystemHealth.list('-timestamp', 100),
    refetchInterval: 30000,
    enabled: !!user
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.entities.Incident.filter({ status: { $ne: 'closed' } }),
    refetchInterval: 30000,
    enabled: !!user
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recent-logs', logLevel],
    queryFn: async () => {
      const filter = {};
      if (logLevel !== 'all') filter.level = logLevel;
      return api.entities.LogEntry.filter(filter, '-timestamp', 200);
    },
    refetchInterval: 30000,
    enabled: !!user
  });

  const { data: traces = [] } = useQuery({
    queryKey: ['distributed-traces'],
    queryFn: () => api.entities.DistributedTrace.list('-start_time', 100),
    refetchInterval: 30000,
    enabled: !!user
  });

  const { data: predictedIncidents = [] } = useQuery({
    queryKey: ['predicted-incidents'],
    queryFn: () => api.entities.PredictedIncident.filter({ status: 'active' }, '-predicted_at'),
    refetchInterval: 60000,
    enabled: !!user
  });

  const runHealthCheck = async () => {
    setRunningHealthCheck(true);
    try {
      const { data } = await api.functions.invoke('sentinelHealthCheck', {});
      setHealthCheckResults(data);
      queryClient.invalidateQueries({ queryKey: ['system-health'] });
      toast.success('Health check complete!');
    } catch (error) {
      toast.error('Health check failed');
    } finally {
      setRunningHealthCheck(false);
    }
  };

  const runPredictiveAnalysis = async () => {
    setLoadingPredictions(true);
    try {
      const { data } = await api.functions.invoke('predictiveIncidentAnalysis', {});
      setPredictions(data);
      queryClient.invalidateQueries({ queryKey: ['predicted-incidents'] });
      toast.success(`Analysis complete: ${data.predictions.length} prediction(s)`);
    } catch (error) {
      toast.error('Prediction analysis failed');
      console.error(error);
    } finally {
      setLoadingPredictions(false);
    }
  };

  const handleSearchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data } = await api.functions.invoke('logAggregator', {
        query: logSearch,
        level: logLevel !== 'all' ? logLevel : undefined,
        limit: 200
      });

      setAggregatedLogs(data);
      toast.success(`Found ${data.total_found} logs`);
    } catch (error) {
      toast.error('Log search failed');
    } finally {
      setLoadingLogs(false);
    }
  };

  const checkIntegrationStatus = async () => {
    try {
      const { data } = await api.functions.invoke('autoIncidentResponse', {
        predictionId: 'test',
        autoExecute: false
      });
      
      if (data.integration_status) {
        setIntegrationStatus(data.integration_status);
      }
    } catch (error) {
      // Ignore error, just checking status
    }
  };

  useEffect(() => {
    if (user) {
      runPredictiveAnalysis();
      checkIntegrationStatus();
    }
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const conversation = { id: conversationId, messages };
    
    setSending(true);
    try {
      await api.agents.addMessage(conversation, {
        role: 'user',
        content: input
      });
      setInput('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const quickCommands = [
    { label: '🏥 System Health', command: 'Check overall system health and show me any degraded services' },
    { label: '🔍 Dataflow Audit', command: 'Audit data flow integrity from Lead to Invoice and report any issues' },
    { label: '📊 Performance Report', command: 'Generate a performance report for the last 24 hours' },
    { label: '🔮 Predict Incidents', command: 'Analyze current metrics and predict potential incidents' },
    { label: '📈 Capacity Forecast', command: 'Forecast capacity needs for the next 30 days' }
  ];

  const viewTrace = (traceId) => {
    setSelectedTraceId(traceId);
  };

  const healthyCount = systemHealth.filter(h => h.status === 'healthy').length;
  const degradedCount = systemHealth.filter(h => h.status === 'degraded').length;
  const downCount = systemHealth.filter(h => h.status === 'down').length;
  const overallStatus = downCount > 0 ? 'down' : degradedCount > 0 ? 'degraded' : 'healthy';

  const avgLatency = systemHealth.length > 0
    ? systemHealth.reduce((sum, h) => sum + (h.response_time_ms || 0), 0) / systemHealth.length
    : 0;

  const last24Hours = systemHealth.slice(0, 24).reverse();
  const performanceData = last24Hours.map((h, idx) => ({
    time: `${idx}h`,
    latency: h.response_time_ms || 0,
    errors: h.status === 'down' || h.status === 'degraded' ? 1 : 0
  }));

  const traceGroups = traces.reduce((acc, trace) => {
    if (!acc[trace.trace_id]) {
      acc[trace.trace_id] = [];
    }
    acc[trace.trace_id].push(trace);
    return acc;
  }, {});

  const highRiskPredictions = predictedIncidents.filter(p => p.probability > 0.7);
  const imminentPredictions = predictedIncidents.filter(p => p.time_to_incident < 2);

  return (
    <div className="bg-gradient-to-br from-[#06162a] to-[#0b213d] p-3 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-7 h-7 md:w-8 md:h-8 text-cyan-400" />
              Sentinel-SRE <span className="text-cyan-400">Console</span>
            </h1>
            <p className="text-white/70 mt-1 text-sm">AI-powered site reliability engineering & incident prevention</p>
          </div>
          <div className="flex gap-3">
            {integrationStatus && (
              <div className={`flex items-center gap-2 px-4 py-2 bg-white/5 ${randomRadius()} border border-cyan-500/30`}>
                <Bell className="w-4 h-4 text-cyan-400" />
                <div className="text-xs">
                  <p className="text-white/60">Integrations:</p>
                  <div className="flex gap-1 mt-1">
                    {integrationStatus.slack && <Badge className="bg-green-500/20 text-green-400 text-xs rounded-full">Slack</Badge>}
                    {integrationStatus.teams && <Badge className="bg-blue-500/20 text-blue-400 text-xs rounded-full">Teams</Badge>}
                    {integrationStatus.pagerduty && <Badge className="bg-orange-500/20 text-orange-400 text-xs rounded-full">PagerDuty</Badge>}
                    {integrationStatus.jira && <Badge className="bg-purple-500/20 text-purple-400 text-xs rounded-full">Jira</Badge>}
                    {!integrationStatus.slack && !integrationStatus.teams && !integrationStatus.pagerduty && !integrationStatus.jira && (
                      <Badge className="bg-gray-500/20 text-gray-400 text-xs rounded-full">None</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
            <Button
              onClick={runHealthCheck}
              disabled={runningHealthCheck}
              className={`bg-cyan-600 hover:bg-cyan-700 text-white ${randomRadius()}`}
            >
              {runningHealthCheck ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Run Health Check
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* DevOps Team Panel - NEW */}
      <div className="mb-6">
        <DevOpsTeamPanel activeIncidents={incidents} />
      </div>

      {/* High Priority: AI Prediction Alerts */}
      {highRiskPredictions.length > 0 && (
        <Card className={`bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/40 mb-6 ${randomRadius()}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                <Sparkles className="w-5 h-5 text-orange-400" />
                🚨 AI Incident Predictions ({highRiskPredictions.length})
              </CardTitle>
              <Button
                onClick={runPredictiveAnalysis}
                disabled={loadingPredictions}
                size="sm"
                variant="outline"
                className={`border-orange-500/30 text-orange-400 hover:bg-orange-500/10 ${randomRadius()}`}
              >
                {loadingPredictions ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highRiskPredictions.slice(0, 3).map((pred) => (
                <PredictionCard
                  key={pred.id}
                  prediction={pred}
                  onActionComplete={() => {
                    queryClient.invalidateQueries({ queryKey: ['predicted-incidents'] });
                    toast.success('Incident response executed!');
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card className={`bg-white/5 border-cyan-500/20 ${randomRadius()}`}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">System Status</p>
                <p className={`text-xl md:text-2xl font-bold ${
                  overallStatus === 'healthy' ? 'text-green-400' :
                  overallStatus === 'degraded' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {overallStatus === 'healthy' ? '✅ Healthy' :
                   overallStatus === 'degraded' ? '⚠️ Degraded' :
                   '🔴 Down'}
                </p>
              </div>
              <Activity className={`w-6 h-6 md:w-8 md:h-8 ${
                overallStatus === 'healthy' ? 'text-green-400' :
                overallStatus === 'degraded' ? 'text-yellow-400' :
                'text-red-400'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/5 border-cyan-500/20 ${randomRadius()}`}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Avg Latency</p>
                <p className="text-xl md:text-2xl font-bold text-cyan-400">{avgLatency.toFixed(0)}ms</p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/5 border-cyan-500/20 ${randomRadius()}`}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Open Incidents</p>
                <p className="text-xl md:text-2xl font-bold text-orange-400">{incidents.length}</p>
              </div>
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/5 border-cyan-500/20 ${randomRadius()}`}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">AI Predictions</p>
                <p className="text-xl md:text-2xl font-bold text-purple-400">{predictedIncidents.length}</p>
              </div>
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className={`bg-white/5 border-cyan-500/20 mb-6 ${randomRadius()}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base md:text-lg">24-Hour Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 10 }} />
              <YAxis stroke="#fff" tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a1929', 
                  border: '1px solid #06b6d4',
                  borderRadius: '12px'
                }}
              />
              <Line type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} />
              <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="console" className="mt-6">
        <TabsList className={`grid w-full grid-cols-2 md:grid-cols-4 bg-white/5 border border-cyan-500/20 p-1 ${randomRadius()}`}>
          <TabsTrigger value="console" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-cyan-500/20">
            AI Console
          </TabsTrigger>
          <TabsTrigger value="predictions" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-cyan-500/20">
            🔮 Predictions
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-cyan-500/20">
            Logs
          </TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs md:text-sm rounded-lg data-[state=active]:bg-cyan-500/20">
            Metrics
          </TabsTrigger>
        </TabsList>

        {/* AI Console Tab */}
        <TabsContent value="console" className="mt-4 md:mt-6">
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Chat Interface and Security Monitors */}
            <div className="lg:col-span-2 space-y-6">
              <Card className={`bg-white/5 border-cyan-500/20 ${randomRadius()}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                    <Terminal className="w-5 h-5 text-cyan-400" />
                    AI Chat Console
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`h-96 overflow-y-auto mb-4 space-y-3 p-4 bg-[#0a1929]/50 ${randomRadius()}`}>
                    {messages.length === 0 ? (
                      <div className="text-center text-white/60 py-12">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
                        <p>Ask Sentinel-SRE anything about system health, incidents, or performance</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-3 ${randomRadius()} ${
                            msg.role === 'user'
                              ? 'bg-cyan-600 text-white'
                              : 'bg-white/10 text-white/90 border border-cyan-500/30'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Ask Sentinel-SRE..."
                      className={`flex-1 bg-white/5 border-cyan-500/30 text-white ${randomRadius()}`}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={sending || !input.trim()}
                      className={`bg-cyan-600 hover:bg-cyan-700 ${randomRadius()}`}
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Behavior Monitoring */}
              <Card className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 ${randomRadius()}`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Behavior Anomaly Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BehaviorAnomalyMonitor />
                </CardContent>
              </Card>

              {/* Threat Intelligence */}
              <Card className={`bg-gradient-to-br from-red-900/20 to-orange-900/20 border-2 border-red-500/30 ${randomRadius()}`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    Threat Intelligence Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ThreatIntelligenceMonitor />
                </CardContent>
              </Card>
            </div>

            {/* Quick Commands */}
            <div className="space-y-3">
              <Card className={`bg-white/5 border-cyan-500/20 ${randomRadius()}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base md:text-lg">Quick Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quickCommands.map((cmd, idx) => (
                      <Button
                        key={idx}
                        onClick={() => setInput(cmd.command)}
                        variant="outline"
                        size="sm"
                        className={`w-full justify-start text-left text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 ${randomRadius()}`}
                      >
                        {cmd.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {healthCheckResults && (
                <Card className={`bg-white/5 border-green-500/20 ${randomRadius()}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base">Latest Check</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/60">Status</span>
                        <Badge className={`${randomRadius()} ${
                          healthCheckResults.overall_status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {healthCheckResults.overall_status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Checks</span>
                        <span className="text-white font-semibold">{healthCheckResults.checks_run}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Failures</span>
                        <span className="text-red-400 font-semibold">{healthCheckResults.failures}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-4 md:mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white">Predictive Incident Analysis</h2>
              <Button
                onClick={runPredictiveAnalysis}
                disabled={loadingPredictions}
                className={`bg-cyan-600 hover:bg-cyan-700 ${randomRadius()}`}
              >
                {loadingPredictions ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>

            {predictedIncidents.length === 0 ? (
              <Card className={`bg-white/5 border-cyan-500/20 ${randomRadius()}`}>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <p className="text-white/60">No incidents predicted - system is stable! 🎉</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {predictedIncidents.map((pred) => (
                  <PredictionCard
                    key={pred.id}
                    prediction={pred}
                    onActionComplete={() => {
                      queryClient.invalidateQueries({ queryKey: ['predicted-incidents'] });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Logs & Traces Tab */}
        <TabsContent value="logs" className="mt-4 md:mt-6">
          <div className="space-y-4 md:space-y-6">
            {/* Log Search */}
            <Card className={`bg-white/5 border-cyan-500/20 ${randomRadius()}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Distributed Log Search
                </CardTitle>
                <p className="text-white/60 text-xs md:text-sm mt-1">Search across Lambda, DynamoDB, and application logs</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-4">
                  <Input
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs..."
                    className={`flex-1 bg-white/5 border-cyan-500/30 text-white text-sm ${randomRadius()}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchLogs();
                    }}
                  />
                  <Select value={logLevel} onValueChange={setLogLevel}>
                    <SelectTrigger className={`w-full md:w-32 bg-white/5 border-cyan-500/30 text-white text-sm ${randomRadius()}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`bg-[#0a1929] border-cyan-500/20 text-white ${randomRadius()}`}>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warn</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="fatal">Fatal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleSearchLogs}
                    disabled={loadingLogs}
                    className={`w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 ${randomRadius()}`}
                  >
                    {loadingLogs ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                {/* Aggregation Summary */}
                {aggregatedLogs?.aggregations && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {aggregatedLogs.aggregations.lambda && (
                      <div className={`p-3 bg-blue-500/10 ${randomRadius()} border border-blue-500/30`}>
                        <p className="text-blue-400 text-xs font-semibold mb-1">Lambda</p>
                        <p className="text-white text-sm">{aggregatedLogs.aggregations.lambda.total_invocations}</p>
                        <p className="text-white/60 text-xs">{aggregatedLogs.aggregations.lambda.errors} errors</p>
                      </div>
                    )}
                    {aggregatedLogs.aggregations.dynamodb && (
                      <div className={`p-3 bg-purple-500/10 ${randomRadius()} border border-purple-500/30`}>
                        <p className="text-purple-400 text-xs font-semibold mb-1">DynamoDB</p>
                        <p className="text-white text-sm">
                          {aggregatedLogs.aggregations.dynamodb.read_operations + aggregatedLogs.aggregations.dynamodb.write_operations}
                        </p>
                        <p className="text-white/60 text-xs">{aggregatedLogs.aggregations.dynamodb.avg_latency_ms}ms avg</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Log Results */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(aggregatedLogs?.logs || recentLogs.filter(log => 
                    !logSearch || 
                    log.message?.toLowerCase().includes(logSearch.toLowerCase()) ||
                    log.trace_id?.includes(logSearch)
                  ).filter(log => logLevel === 'all' || log.level === logLevel)).map((log, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`p-3 ${randomRadius()} border ${
                        log.level === 'error' || log.level === 'fatal' ? 'bg-red-500/10 border-red-500/30' :
                        log.level === 'warn' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-white/5 border-cyan-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className={`text-xs rounded-full ${
                              log.level === 'error' || log.level === 'fatal' ? 'bg-red-500/20 text-red-400' :
                              log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                              log.level === 'info' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {log.level}
                            </Badge>
                            {log.trace_id && (
                              <button
                                onClick={() => viewTrace(log.trace_id)}
                                className="text-cyan-400 hover:text-cyan-300 text-xs underline"
                              >
                                🔗 {log.trace_id.slice(0, 8)}
                              </button>
                            )}
                            <span className="text-white/50 text-xs">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-white text-sm font-mono break-words">{log.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trace Waterfall */}
            {selectedTraceId && traceGroups[selectedTraceId] && (
              <Card className={`bg-white/5 border-cyan-500/20 mt-4 ${randomRadius()}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      Trace: {selectedTraceId.slice(0, 16)}...
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTraceId(null)}
                      className={`border-cyan-500/30 text-white hover:bg-white/10 ${randomRadius()}`}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {traceGroups[selectedTraceId]
                      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                      .map((span, idx) => {
                        const depth = span.parent_span_id ? 1 : 0;
                        const maxDuration = Math.max(...traceGroups[selectedTraceId].map(s => s.duration_ms));
                        const widthPct = (span.duration_ms / maxDuration) * 100;

                        return (
                          <div
                            key={idx}
                            className={`p-2 bg-white/5 ${randomRadius()}`}
                            style={{ marginLeft: `${depth * 20}px` }}
                          >
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge className={`bg-cyan-500/20 text-cyan-400 text-xs ${randomRadius()}`}>
                                {span.service_name}
                              </Badge>
                              <span className="text-white/70 text-xs flex-1 truncate">{span.operation_name}</span>
                              <Badge className={`text-xs ${randomRadius()} ${
                                span.status === 'ok' ? 'bg-green-500/20 text-green-400' :
                                span.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {span.duration_ms.toFixed(2)}ms
                              </Badge>
                            </div>
                            <div className={`relative h-4 bg-[#0a1929] ${randomRadius()} overflow-hidden`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${widthPct}%` }}
                                className={`h-full ${
                                  span.status === 'error' ? 'bg-red-500/60' : 'bg-cyan-500/60'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="mt-4 md:mt-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <Card className={`bg-white/5 border-cyan-500/20 ${randomRadius()}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base md:text-lg">Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {aggregatedLogs?.aggregations?.by_service ? (
                  <div className="space-y-2">
                    {Object.entries(aggregatedLogs.aggregations.by_service).map(([service, count]) => (
                      <div key={service} className="flex items-center justify-between">
                        <span className="text-white/70 text-sm truncate">{service}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-24 h-2 bg-white/10 ${randomRadius()} overflow-hidden`}>
                            <div 
                              className="h-full bg-cyan-500"
                              style={{ width: `${(count / aggregatedLogs.total_found) * 100}%` }}
                            />
                          </div>
                          <span className="text-white font-semibold text-sm">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-8 text-sm">Run log search to see metrics</p>
                )}
              </CardContent>
            </Card>

            {aggregatedLogs?.insights?.top_errors && (
              <Card className={`bg-red-500/10 border-red-500/30 ${randomRadius()}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Top Error Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {aggregatedLogs.insights.top_errors.map((error, idx) => (
                      <div key={idx} className={`p-2 bg-white/5 ${randomRadius()}`}>
                        <p className="text-white/70 text-sm font-mono truncate">{error.pattern}</p>
                        <p className="text-red-400 text-xs mt-1">{error.count} occurrences</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Integration Setup Notice */}
      <Card className={`mt-6 bg-blue-500/10 border-blue-500/30 ${randomRadius()}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <SettingsIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-blue-400 font-semibold text-sm mb-2">🔗 Integration Setup</p>
              <p className="text-white/70 text-sm mb-3">
                Connect external systems to enable automated incident response:
              </p>
              <ul className="space-y-1 text-white/60 text-xs md:text-sm">
                <li>• <strong className="text-white">Slack:</strong> Real-time team notifications</li>
                <li>• <strong className="text-white">Microsoft Teams:</strong> Incident alerts in channels</li>
                <li>• <strong className="text-white">PagerDuty:</strong> On-call engineer escalation</li>
                <li>• <strong className="text-white">Jira:</strong> Auto-create incident tickets</li>
              </ul>
              <p className="text-blue-400 text-xs mt-3">
                💡 Configure in Dashboard → Code → Functions → autoIncidentResponse → Environment Variables
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
