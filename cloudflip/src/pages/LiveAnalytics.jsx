
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Activity,
  Users,
  Eye,
  MousePointer,
  Zap,
  Globe,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Map,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPollingInterval, getIntervalDescription } from '../components/utils/pollingConfig';

const COLORS = ['#f4d35e', '#3cf7d4', '#3b82f6', '#10b981', '#ef4444', '#a855f7', '#ec4899', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a1929] border border-amber-500/50 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LiveAnalytics() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      // Load subscription for polling config
      try {
        const subs = await api.entities.BillingSubscription.list();
        setSubscription(subs.length > 0 ? subs[0] : { plan: 'free' });
      } catch (error) {
        // console.error("Failed to load subscription:", error); // Optional: log error
        setSubscription({ plan: 'free' });
      }
    };
    loadUser();
  }, []);

  const plan = subscription?.plan || 'free';
  const realtimeInterval = getPollingInterval('realtime', plan);
  const isRealtimeAvailable = realtimeInterval !== false;

  const { data: liveMetrics = [], refetch: refetchMetrics } = useQuery({
    queryKey: ['live-metrics', timeRange],
    queryFn: async () => {
      const allMetrics = await api.entities.LiveMetric.list('-timestamp', 2000);
      return allMetrics.filter(m => m.org_id === user.current_org_id);
    },
    enabled: !!user && isRealtimeAvailable,
    refetchInterval: realtimeInterval
  });

  // Time filtering
  const now = new Date();
  const timeRangeMap = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000
  };
  const cutoffTime = new Date(now.getTime() - timeRangeMap[timeRange]);
  const filteredMetrics = liveMetrics.filter(m => new Date(m.timestamp) > cutoffTime);

  // Real-time stats
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const recentEvents = filteredMetrics.filter(e => new Date(e.timestamp) > fiveMinutesAgo);
  const activeSessions = new Set(recentEvents.map(e => e.session_id)).size;
  const activeUsers = new Set(recentEvents.map(e => e.user_id).filter(Boolean)).size;
  const hourlyPageViews = filteredMetrics.filter(e => e.event_type === 'page_view').length;

  // Time series data
  const intervalMinutes = timeRange === '1h' ? 1 : timeRange === '6h' ? 10 : timeRange === '24h' ? 60 : 360;
  const intervals = Math.floor(timeRangeMap[timeRange] / (intervalMinutes * 60 * 1000));
  
  const timeSeriesData = Array.from({ length: Math.min(intervals, 60) }, (_, i) => {
    const intervalTime = new Date(now.getTime() - (intervals - 1 - i) * intervalMinutes * 60 * 1000);
    const intervalEnd = new Date(intervalTime.getTime() + intervalMinutes * 60 * 1000);
    
    const intervalMetrics = filteredMetrics.filter(e => {
      const eventTime = new Date(e.timestamp);
      return eventTime >= intervalTime && eventTime < intervalEnd;
    });

    return {
      time: timeRange === '1h' 
        ? `${intervalTime.getHours()}:${intervalTime.getMinutes().toString().padStart(2, '0')}` 
        : intervalTime.toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit' }),
      events: intervalMetrics.length,
      pageViews: intervalMetrics.filter(e => e.event_type === 'page_view').length,
      clicks: intervalMetrics.filter(e => e.event_type === 'click').length,
      apiCalls: intervalMetrics.filter(e => e.event_type === 'api_call').length,
      errors: intervalMetrics.filter(e => e.event_type === 'error').length
    };
  });

  // Page distribution
  const pageDistribution = Object.entries(
    filteredMetrics.reduce((acc, e) => {
      const page = e.page || 'Unknown';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/^\//, '') || 'Home', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Device breakdown
  const deviceData = Object.entries(
    filteredMetrics.reduce((acc, e) => {
      const device = e.device?.type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Event types heatmap data
  const eventTypeData = Object.entries(
    filteredMetrics.reduce((acc, e) => {
      acc[e.event_type] = (acc[e.event_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ 
    name: name.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
    value 
  })).sort((a, b) => b.value - a.value);

  // Geographic distribution
  const geoData = Object.entries(
    filteredMetrics.reduce((acc, e) => {
      const country = e.geo?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {})
  ).map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Scatter plot data - Session duration vs Events
  const sessionAnalytics = Object.values(
    filteredMetrics.reduce((acc, e) => {
      if (!e.session_id) return acc;
      if (!acc[e.session_id]) {
        acc[e.session_id] = { 
          session: e.session_id, 
          events: 0, 
          duration: 0,
          firstEvent: new Date(e.timestamp),
          lastEvent: new Date(e.timestamp)
        };
      }
      acc[e.session_id].events++;
      const eventTime = new Date(e.timestamp);
      if (eventTime < acc[e.session_id].firstEvent) acc[e.session_id].firstEvent = eventTime;
      if (eventTime > acc[e.session_id].lastEvent) acc[e.session_id].lastEvent = eventTime;
      acc[e.session_id].duration = (acc[e.session_id].lastEvent - acc[e.session_id].firstEvent) / 1000 / 60;
      return acc;
    }, {})
  ).map(s => ({
    events: s.events,
    duration: Math.round(s.duration * 10) / 10,
    engagement: s.events * s.duration
  })).filter(s => s.duration > 0 && s.events > 1).slice(0, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-[#f4d35e]" />
          Traffic <span className="text-[#f4d35e]">Analytics</span>
        </h1>
        <p className="text-white/70 mt-1">Tableau-style interactive analytics with real-time telemetry</p>
        
        {!isRealtimeAvailable && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-sm">
              📊 Real-time analytics are available on Starter plans and above. 
              <Link to={createPageUrl("Billing")} className="underline ml-1">Upgrade now</Link>
            </p>
          </div>
        )}
        
        {isRealtimeAvailable && realtimeInterval > 60000 && ( // Assuming 60 seconds is a benchmark for "faster"
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              ⏱️ Current refresh rate: {getIntervalDescription(realtimeInterval)}. 
              <Link to={createPageUrl("Billing")} className="underline ml-1">Upgrade for faster updates</Link>
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white/5 border-amber-500/30 text-white">
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-amber-500/30">
                  <SelectItem value="1h" className="text-white hover:bg-white/10">Last Hour</SelectItem>
                  <SelectItem value="6h" className="text-white hover:bg-white/10">Last 6 Hours</SelectItem>
                  <SelectItem value="24h" className="text-white hover:bg-white/10">Last 24 Hours</SelectItem>
                  <SelectItem value="7d" className="text-white hover:bg-white/10">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a1929] border-amber-500/50">
              <p className="text-white">Select time range for analysis</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => refetchMetrics()}
                variant="outline"
                className="border-amber-500/30 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a1929] border-amber-500/50">
              <p className="text-white">Manually refresh data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline"
                className="border-amber-500/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a1929] border-amber-500/50">
              <p className="text-white">Export analytics data to CSV</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Real-Time KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/5 border-[#f4d35e]/20 hover:border-[#f4d35e]/40 transition-all cursor-help">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Active Sessions</p>
                      <p className="text-4xl font-bold text-[#f4d35e]">{activeSessions}</p>
                      <p className="text-white/50 text-xs mt-1">Last 5 minutes</p>
                    </div>
                    <Users className="w-10 h-10 text-[#f4d35e]/50" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a1929] border-amber-500/50">
              <p className="text-white font-semibold mb-1">Active Sessions</p>
              <p className="text-white/70 text-sm">Unique sessions in the last 5 minutes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/5 border-[#3cf7d4]/20 hover:border-[#3cf7d4]/40 transition-all cursor-help">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Active Users</p>
                      <p className="text-4xl font-bold text-[#3cf7d4]">{activeUsers}</p>
                      <p className="text-white/50 text-xs mt-1">Currently online</p>
                    </div>
                    <Activity className="w-10 h-10 text-[#3cf7d4]/50" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a1929] border-amber-500/50">
              <p className="text-white font-semibold mb-1">Active Users</p>
              <p className="text-white/70 text-sm">Authenticated users currently active</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/5 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-help">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Page Views</p>
                      <p className="text-4xl font-bold text-blue-400">{hourlyPageViews}</p>
                      <p className="text-white/50 text-xs mt-1">{timeRange === '1h' ? 'Last hour' : `Last ${timeRange}`}</p>
                    </div>
                    <Eye className="w-10 h-10 text-blue-400/50" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a1929] border-amber-500/50">
              <p className="text-white font-semibold mb-1">Page Views</p>
              <p className="text-white/70 text-sm">Total page navigation events</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white/5 border-green-500/20 hover:border-green-500/40 transition-all cursor-help">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Events</p>
                      <p className="text-4xl font-bold text-green-400">{filteredMetrics.length}</p>
                      <p className="text-white/50 text-xs mt-1">In time range</p>
                    </div>
                    <Zap className="w-10 h-10 text-green-400/50" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a1929] border-amber-500/50">
              <p className="text-white font-semibold mb-1">Total Events</p>
              <p className="text-white/70 text-sm">All telemetry events captured</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main Visualization Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-white/5">
          <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 text-white">
            <BarChart3 className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-blue-500/20 text-white">
            <TrendingUp className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="geography" className="data-[state=active]:bg-green-500/20 text-white">
            <Map className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Geography</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="data-[state=active]:bg-purple-500/20 text-white">
            <Users className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Behavior</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-cyan-500/20 text-white">
            <Zap className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Performance</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Multi-line Time Series */}
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Events Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fill: '#fff', fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fill: '#fff', fontSize: 12 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="events" stroke="#f4d35e" strokeWidth={2} name="Total Events" />
                    <Line type="monotone" dataKey="pageViews" stroke="#3cf7d4" strokeWidth={2} name="Page Views" />
                    <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} name="Clicks" />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stacked Area Chart */}
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Event Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3cf7d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3cf7d4" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis dataKey="time" tick={{ fill: '#fff', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#fff', fontSize: 12 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="pageViews" stackId="1" stroke="#3cf7d4" fill="url(#colorPageViews)" name="Page Views" />
                    <Area type="monotone" dataKey="clicks" stackId="1" stroke="#3b82f6" fill="url(#colorClicks)" name="Clicks" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Page and Event Distribution */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={pageDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis type="number" tick={{ fill: '#fff', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#fff', fontSize: 11 }} width={120} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#f4d35e" name="Visits" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Event Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Session Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionAnalytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                      <XAxis 
                        type="number" 
                        dataKey="events" 
                        name="Events" 
                        tick={{ fill: '#fff', fontSize: 12 }}
                        label={{ value: 'Events per Session', position: 'insideBottom', offset: -5, fill: '#fff' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="duration" 
                        name="Duration (min)" 
                        tick={{ fill: '#fff', fontSize: 12 }}
                        label={{ value: 'Duration (minutes)', angle: -90, position: 'insideLeft', fill: '#fff' }}
                      />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Sessions" data={sessionAnalytics} fill="#a855f7" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-20 text-white/60">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No session data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography">
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#3cf7d4]" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {geoData.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={geoData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                      <XAxis dataKey="region" tick={{ fill: '#fff', fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                      <YAxis tick={{ fill: '#fff', fontSize: 12 }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#3cf7d4" name="Events" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    <p className="text-white font-semibold mb-4">Top Regions</p>
                    {geoData.map((geo, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          >
                            {idx + 1}
                          </div>
                          <span className="text-white font-medium">{geo.region}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full"
                              style={{ 
                                width: `${(geo.count / geoData[0].count) * 100}%`,
                                backgroundColor: COLORS[idx % COLORS.length]
                              }}
                            />
                          </div>
                          <Badge className="bg-white/10 text-white">{geo.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-white/60">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No geographic data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white">User Behavior Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#fff', fontSize: 12 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Count">
                    {eventTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white">API Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-white/60">
                <Zap className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="mb-2">Performance monitoring coming soon</p>
                <p className="text-sm text-white/40">Track API latency, error rates, and throughput</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
