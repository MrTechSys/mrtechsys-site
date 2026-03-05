import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Cpu,
  HardDrive,
  Zap,
  Clock,
  Database,
  RefreshCw,
  Download,
  Loader2,
  Globe,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format, subHours, subDays } from 'date-fns';

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function SystemAnalytics() {
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);
  const [capacityForecast, setCapacityForecast] = useState(null);
  const [predictiveInsights, setPredictiveInsights] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    let start;
    switch (timeRange) {
      case '1h': start = subHours(end, 1); break;
      case '24h': start = subHours(end, 24); break;
      case '7d': start = subDays(end, 7); break;
      case '30d': start = subDays(end, 30); break;
      default: start = subHours(end, 24);
    }
    return { start, end };
  };

  const { start, end } = getDateRange();

  // Fetch metrics
  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics-timeseries', timeRange],
    queryFn: () => api.entities.MetricsTimeSeries.filter({
      timestamp: { $gte: start.toISOString() }
    }, '-timestamp', 1000),
    refetchInterval: 30000,
    enabled: !!user
  });

  const { data: systemHealth = [] } = useQuery({
    queryKey: ['system-health-analytics', timeRange],
    queryFn: () => api.entities.SystemHealth.filter({
      timestamp: { $gte: start.toISOString() }
    }, '-timestamp', 500),
    refetchInterval: 30000,
    enabled: !!user
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs-analytics', timeRange],
    queryFn: () => api.entities.LogEntry.filter({
      timestamp: { $gte: start.toISOString() }
    }, '-timestamp', 1000),
    enabled: !!user
  });

  const { data: traces = [] } = useQuery({
    queryKey: ['traces-analytics', timeRange],
    queryFn: () => api.entities.DistributedTrace.filter({
      start_time: { $gte: start.toISOString() }
    }, '-start_time', 500),
    enabled: !!user
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents-analytics'],
    queryFn: () => api.entities.Incident.list('-opened_at', 100),
    enabled: !!user
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions-analytics'],
    queryFn: () => api.entities.PredictedIncident.filter({
      predicted_at: { $gte: start.toISOString() }
    }),
    enabled: !!user
  });

  // Load capacity forecast
  useEffect(() => {
    const loadForecast = async () => {
      if (!user) return;
      try {
        const { data } = await api.functions.invoke('sreAutomationEngine', {
          action: 'capacity_forecast'
        });
        setCapacityForecast(data.tasks_completed[0]);
      } catch (error) {
        console.error('Failed to load capacity forecast:', error);
      }
    };
    loadForecast();
  }, [user, timeRange]);

  // Generate predictive insights
  useEffect(() => {
    const generateInsights = async () => {
      if (!user || metrics.length === 0) return;

      const latencyMetrics = metrics.filter(m => m.metric === 'latency_p95');
      const errorMetrics = metrics.filter(m => m.metric === 'error_rate');
      const requestMetrics = metrics.filter(m => m.metric === 'req_rate');

      const avgLatency = latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length;
      const avgErrorRate = errorMetrics.reduce((sum, m) => sum + m.value, 0) / errorMetrics.length;
      const avgRequestRate = requestMetrics.reduce((sum, m) => sum + m.value, 0) / requestMetrics.length;

      const latencyTrend = latencyMetrics.length > 2 
        ? latencyMetrics[0].value > latencyMetrics[latencyMetrics.length - 1].value ? 'increasing' : 'decreasing'
        : 'stable';

      const insights = [];

      if (avgLatency > 500) {
        insights.push({
          type: 'warning',
          category: 'performance',
          message: `Average P95 latency is ${avgLatency.toFixed(0)}ms - above 500ms threshold`,
          recommendation: 'Consider optimizing slow queries or scaling compute resources',
          impact: 'high'
        });
      }

      if (avgErrorRate > 1) {
        insights.push({
          type: 'critical',
          category: 'reliability',
          message: `Error rate at ${avgErrorRate.toFixed(2)}% - exceeding 1% threshold`,
          recommendation: 'Investigate recent deployments and error logs',
          impact: 'critical'
        });
      }

      if (latencyTrend === 'increasing') {
        insights.push({
          type: 'info',
          category: 'trend',
          message: 'Latency trending upward over time period',
          recommendation: 'Monitor for capacity constraints or inefficient queries',
          impact: 'medium'
        });
      }

      if (predictions.length > 0) {
        const highProbPredictions = predictions.filter(p => p.probability > 0.7);
        if (highProbPredictions.length > 0) {
          insights.push({
            type: 'warning',
            category: 'prediction',
            message: `${highProbPredictions.length} high-probability incidents predicted`,
            recommendation: 'Review AI predictions and take preventive action',
            impact: 'high'
          });
        }
      }

      setPredictiveInsights(insights);
    };

    generateInsights();
  }, [metrics, predictions, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['metrics-timeseries'] }),
        queryClient.invalidateQueries({ queryKey: ['system-health-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['logs-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['traces-analytics'] })
      ]);
      toast.success('Data refreshed!');
    } catch (error) {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  // Process metrics for charts
  const latencyData = metrics
    .filter(m => m.metric === 'latency_p95')
    .slice(-50)
    .map(m => ({
      time: format(new Date(m.timestamp), 'HH:mm'),
      latency: m.value,
      timestamp: m.timestamp
    }));

  const errorRateData = metrics
    .filter(m => m.metric === 'error_rate')
    .slice(-50)
    .map(m => ({
      time: format(new Date(m.timestamp), 'HH:mm'),
      errors: m.value
    }));

  const requestRateData = metrics
    .filter(m => m.metric === 'req_rate')
    .slice(-50)
    .map(m => ({
      time: format(new Date(m.timestamp), 'HH:mm'),
      requests: m.value
    }));

  const cpuData = metrics
    .filter(m => m.metric === 'cpu')
    .slice(-50)
    .map(m => ({
      time: format(new Date(m.timestamp), 'HH:mm'),
      cpu: m.value
    }));

  const memoryData = metrics
    .filter(m => m.metric === 'memory')
    .slice(-50)
    .map(m => ({
      time: format(new Date(m.timestamp), 'HH:mm'),
      memory: m.value
    }));

  // Aggregate by service
  const serviceMetrics = metrics.reduce((acc, m) => {
    const service = m.service_id || 'unknown';
    if (!acc[service]) acc[service] = { service, requests: 0, errors: 0, avgLatency: 0 };
    if (m.metric === 'req_rate') acc[service].requests += m.value;
    if (m.metric === 'error_rate') acc[service].errors += m.value;
    if (m.metric === 'latency_p95') acc[service].avgLatency = m.value;
    return acc;
  }, {});

  const serviceData = Object.values(serviceMetrics).slice(0, 6);

  // Log level distribution
  const logLevelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {});

  const logDistributionData = Object.entries(logLevelCounts).map(([level, count]) => ({
    name: level.toUpperCase(),
    value: count
  }));

  // Incident timeline
  const incidentTimeline = incidents.slice(0, 20).map(inc => ({
    date: format(new Date(inc.opened_at), 'MMM d'),
    sev1: inc.severity === 'sev1' ? 1 : 0,
    sev2: inc.severity === 'sev2' ? 1 : 0,
    sev3: inc.severity === 'sev3' ? 1 : 0
  }));

  // Current stats
  const currentLatency = latencyData.length > 0 ? latencyData[latencyData.length - 1].latency : 0;
  const currentErrorRate = errorRateData.length > 0 ? errorRateData[errorRateData.length - 1].errors : 0;
  const currentRequests = requestRateData.length > 0 ? requestRateData[requestRateData.length - 1].requests : 0;
  const currentCpu = cpuData.length > 0 ? cpuData[cpuData.length - 1].cpu : 0;
  const currentMemory = memoryData.length > 0 ? memoryData[memoryData.length - 1].memory : 0;

  const avgLatency = latencyData.reduce((sum, d) => sum + d.latency, 0) / latencyData.length || 0;
  const avgErrorRate = errorRateData.reduce((sum, d) => sum + d.errors, 0) / errorRateData.length || 0;

  const uptime = systemHealth.filter(h => h.status === 'healthy').length / systemHealth.length * 100 || 100;

  const exportData = () => {
    const exportObj = {
      exported_at: new Date().toISOString(),
      time_range: timeRange,
      summary: {
        avg_latency_ms: avgLatency.toFixed(2),
        avg_error_rate: avgErrorRate.toFixed(2),
        uptime_pct: uptime.toFixed(2),
        total_requests: requestRateData.reduce((sum, d) => sum + d.requests, 0),
        total_logs: logs.length,
        total_traces: traces.length,
        incidents: incidents.length,
        predictions: predictions.length
      },
      metrics: metrics,
      incidents: incidents,
      predictions: predictions
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-analytics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported!');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-[#06162a] to-[#0b213d]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            System <span className="text-cyan-400">Analytics</span>
          </h1>
          <p className="text-white/70 mt-1">Real-time metrics, insights, and capacity planning</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-white/5 border-cyan-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1929] border-cyan-500/20 text-white">
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={exportData}
            variant="outline"
            className="border-cyan-500/30 text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-400">P95</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{currentLatency.toFixed(0)}ms</p>
            <p className="text-xs text-white/60 mt-1">
              Avg: {avgLatency.toFixed(0)}ms
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Errors</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{currentErrorRate.toFixed(2)}%</p>
            <p className="text-xs text-white/60 mt-1">
              Avg: {avgErrorRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Uptime</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{uptime.toFixed(2)}%</p>
            <p className="text-xs text-white/60 mt-1">
              {systemHealth.filter(h => h.status === 'healthy').length}/{systemHealth.length} checks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400">CPU</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{currentCpu.toFixed(0)}%</p>
            <p className="text-xs text-white/60 mt-1">
              Current usage
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Memory</Badge>
            </div>
            <p className="text-2xl font-bold text-white">{currentMemory.toFixed(0)}%</p>
            <p className="text-xs text-white/60 mt-1">
              Current usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Insights */}
      {predictiveInsights && predictiveInsights.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              AI Predictive Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictiveInsights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      insight.type === 'critical' ? 'text-red-400' :
                      insight.type === 'warning' ? 'text-amber-400' :
                      'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm mb-1">{insight.message}</p>
                      <p className="text-white/70 text-xs mb-2">💡 {insight.recommendation}</p>
                      <Badge className={`text-xs ${
                        insight.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                        insight.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {insight.category} • {insight.impact} impact
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capacity Forecast */}
      {capacityForecast && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              30-Day Capacity Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Current Average RPS</p>
                <p className="text-2xl font-bold text-white">{capacityForecast.current_avg_rps?.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Projected Growth (30d)</p>
                <p className="text-2xl font-bold text-amber-400">{capacityForecast.projected_30d_growth?.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Utilization</p>
                <p className="text-2xl font-bold text-white">{capacityForecast.utilization_pct?.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-white font-medium text-sm">📊 Recommendation:</p>
              <p className="text-white/70 text-sm mt-1">{capacityForecast.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Tabs */}
      <Tabs defaultValue="performance" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/5 border border-cyan-500/20 p-1">
          <TabsTrigger value="performance" className="text-xs md:text-sm">Performance</TabsTrigger>
          <TabsTrigger value="reliability" className="text-xs md:text-sm">Reliability</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs md:text-sm">Resources</TabsTrigger>
          <TabsTrigger value="services" className="text-xs md:text-sm">Services</TabsTrigger>
          <TabsTrigger value="incidents" className="text-xs md:text-sm">Incidents</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">API Latency (P95)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={latencyData}>
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#fff" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="latency" stroke="#06b6d4" fillOpacity={1} fill="url(#latencyGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">Request Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={requestRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#fff" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }} />
                  <Bar dataKey="requests" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reliability Tab */}
        <TabsContent value="reliability" className="space-y-6 mt-6">
          <Card className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={errorRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#fff" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #ef4444' }} />
                  <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">Log Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={logDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {logDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">Uptime Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="relative inline-block">
                    <svg width="120" height="120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#ffffff10"
                        strokeWidth="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray={`${(uptime / 100) * 314} 314`}
                        strokeDashoffset="0"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-green-400">{uptime.toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mt-4">
                    {systemHealth.filter(h => h.status === 'healthy').length} healthy checks
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">CPU Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#fff" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }} />
                    <Area type="monotone" dataKey="cpu" stroke="#f59e0b" fillOpacity={1} fill="url(#cpuGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">Memory Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={memoryData}>
                    <defs>
                      <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#fff" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #8b5cf6' }} />
                    <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fillOpacity={1} fill="url(#memoryGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6 mt-6">
          <Card className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">Service Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serviceData.map((service, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-lg border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-400" />
                        <span className="text-white font-medium">{service.service}</span>
                      </div>
                      <Badge className="bg-cyan-500/20 text-cyan-400">
                        {service.avgLatency.toFixed(0)}ms
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/60">Requests</p>
                        <p className="text-white font-semibold">{service.requests.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-white/60">Error Rate</p>
                        <p className={`font-semibold ${service.errors > 1 ? 'text-red-400' : 'text-green-400'}`}>
                          {service.errors.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6 mt-6">
          <Card className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">Incident Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incidentTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#fff" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#fff" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }} />
                  <Legend />
                  <Bar dataKey="sev1" stackId="a" fill="#ef4444" name="SEV1" />
                  <Bar dataKey="sev2" stackId="a" fill="#f59e0b" name="SEV2" />
                  <Bar dataKey="sev3" stackId="a" fill="#06b6d4" name="SEV3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {incidents.slice(0, 10).map((inc, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${
                      inc.severity === 'sev1' ? 'bg-red-500/10 border-red-500/30' :
                      inc.severity === 'sev2' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-cyan-500/10 border-cyan-500/30'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-medium text-sm">{inc.title}</p>
                        <Badge className={`text-xs ${
                          inc.severity === 'sev1' ? 'bg-red-500/20 text-red-400' :
                          inc.severity === 'sev2' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {inc.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs">{inc.summary}</p>
                      <p className="text-white/50 text-xs mt-2">
                        {format(new Date(inc.opened_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">AI Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {predictions.slice(0, 10).map((pred, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-medium text-sm capitalize">
                          {pred.incident_type.replace(/_/g, ' ')}
                        </p>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          {(pred.probability * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span>🎯 Confidence: {(pred.confidence * 100).toFixed(0)}%</span>
                        <span>⏱️ ETA: {pred.time_to_incident}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}