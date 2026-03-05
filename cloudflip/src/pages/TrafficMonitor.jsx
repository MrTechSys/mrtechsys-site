import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Globe,
  Activity,
  Ban,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  Zap,
  ChevronRight
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TrafficMonitor() {
  const [user, setUser] = useState(null);
  const [ipSearch, setIpSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: securityLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ['security-logs'],
    queryFn: async () => {
      try {
        if (!user?.current_org_id) return [];
        return await api.entities.SecurityLog.filter({
          org_id: user.current_org_id
        }, '-timestamp', 500);
      } catch (error) {
        console.error('Error loading security logs:', error);
        return [];
      }
    },
    enabled: !!user,
    refetchInterval: 30000,
    retry: 1
  });

  const { data: securityAlerts = [] } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async () => {
      try {
        if (!user?.current_org_id) return [];
        return await api.entities.SecurityAlert.filter({
          org_id: user.current_org_id,
          status: { $in: ['active', 'investigating'] }
        }, '-detected_at', 100);
      } catch (error) {
        console.error('Error loading security alerts:', error);
        return [];
      }
    },
    enabled: !!user,
    refetchInterval: 30000,
    retry: 1
  });

  const analyzeTrafficMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('sentinelHealthCheck', {
        action: 'analyze_traffic'
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Traffic analyzed: ${data.total_requests || 0} requests`);
      refetchLogs();
    },
    onError: () => {
      toast.error("Traffic analysis failed");
    }
  });

  // Calculate statistics
  const totalRequests = securityLogs.length;
  const suspiciousRequests = securityLogs.filter(log => log.is_suspicious).length;
  const blockedRequests = securityLogs.filter(log => log.is_blocked).length;
  const botRequests = securityLogs.filter(log => log.is_bot).length;

  // Group by IP
  const ipStats = securityLogs.reduce((acc, log) => {
    if (!acc[log.ip_address]) {
      acc[log.ip_address] = { count: 0, suspicious: 0, blocked: 0 };
    }
    acc[log.ip_address].count++;
    if (log.is_suspicious) acc[log.ip_address].suspicious++;
    if (log.is_blocked) acc[log.ip_address].blocked++;
    return acc;
  }, {});

  const topIPs = Object.entries(ipStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  // Traffic over time
  const trafficData = securityLogs
    .slice(0, 24)
    .reverse()
    .map((log, idx) => ({
      time: `${idx}h`,
      requests: 1,
      suspicious: log.is_suspicious ? 1 : 0,
      blocked: log.is_blocked ? 1 : 0
    }));

  const filteredLogs = ipSearch 
    ? securityLogs.filter(log => log.ip_address?.includes(ipSearch))
    : securityLogs;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            Traffic <span className="text-amber-400">Monitor</span>
          </h1>
          <p className="text-white/60">Real-time security monitoring and bot detection</p>
        </div>
        <Button
          onClick={() => analyzeTrafficMutation.mutate()}
          disabled={analyzeTrafficMutation.isPending}
          className="bg-gradient-to-r from-cyan-600 to-blue-600"
        >
          {analyzeTrafficMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Analyze Traffic
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Total Requests</p>
                <p className="text-2xl font-bold text-white">{totalRequests}</p>
              </div>
              <Activity className="w-8 h-8 text-cyan-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Suspicious</p>
                <p className="text-2xl font-bold text-yellow-400">{suspiciousRequests}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Blocked</p>
                <p className="text-2xl font-bold text-red-400">{blockedRequests}</p>
              </div>
              <Ban className="w-8 h-8 text-red-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Bot Traffic</p>
                <p className="text-2xl font-bold text-purple-400">{botRequests}</p>
              </div>
              <Globe className="w-8 h-8 text-purple-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white">Traffic Patterns (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {trafficData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 11 }} />
                <YAxis stroke="#fff" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={2} name="Requests" />
                <Line type="monotone" dataKey="suspicious" stroke="#f59e0b" strokeWidth={2} name="Suspicious" />
                <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} name="Blocked" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-white/40 py-8">No traffic data available</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="bg-white/5">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="ips">Top IPs</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {securityAlerts.length === 0 ? (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-white/60">No active security alerts</p>
              </CardContent>
            </Card>
          ) : (
            securityAlerts.map((alert) => (
              <Card key={alert.id} className="bg-[#0a1929]/60 backdrop-blur border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                          {alert.alert_type}
                        </Badge>
                      </div>
                      <h3 className="text-white font-semibold">{alert.title}</h3>
                      <p className="text-white/60 text-sm mt-1">{alert.description}</p>
                    </div>
                  </div>

                  {alert.threat_actor && (
                    <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white/50 text-xs">IP Address</p>
                        <p className="text-white text-sm font-mono">{alert.threat_actor.ip_address}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Location</p>
                        <p className="text-white text-sm">{alert.threat_actor.location || 'Unknown'}</p>
                      </div>
                    </div>
                  )}

                  {alert.suggested_actions && (
                    <div className="mt-3 space-y-1">
                      <p className="text-amber-400 text-xs font-semibold mb-2">Suggested Actions:</p>
                      {alert.suggested_actions.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-white/70">
                          <ChevronRight className="w-3 h-3 text-amber-400" />
                          {action.action}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ips">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-white">Top Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topIPs.map(([ip, stats]) => (
                  <div key={ip} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1">
                      <p className="text-white font-mono text-sm">{ip}</p>
                      <p className="text-white/40 text-xs mt-1">
                        {stats.count} requests
                        {stats.suspicious > 0 && ` • ${stats.suspicious} suspicious`}
                        {stats.blocked > 0 && ` • ${stats.blocked} blocked`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {stats.suspicious > 0 && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                          {stats.suspicious} suspicious
                        </Badge>
                      )}
                      {stats.blocked > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 text-xs">
                          {stats.blocked} blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-cyan-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Request Logs</CardTitle>
                <div className="flex gap-2">
                  <Input
                    value={ipSearch}
                    onChange={(e) => setIpSearch(e.target.value)}
                    placeholder="Search by IP..."
                    className="w-48 bg-white/5 border-cyan-500/30 text-white text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredLogs.slice(0, 50).map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border ${
                      log.is_blocked ? 'bg-red-500/10 border-red-500/30' :
                      log.is_suspicious ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                            {log.request_method}
                          </Badge>
                          <span className="text-white/70 font-mono text-xs">{log.ip_address}</span>
                          {log.is_bot && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">Bot</Badge>
                          )}
                          {log.is_suspicious && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Suspicious</Badge>
                          )}
                          {log.is_blocked && (
                            <Badge className="bg-red-500/20 text-red-400 text-xs">Blocked</Badge>
                          )}
                        </div>
                        <p className="text-white text-sm">{log.request_path}</p>
                        <p className="text-white/40 text-xs mt-1">
                          {log.timestamp && new Date(log.timestamp).toLocaleString()}
                          {log.geolocation?.country && ` • ${log.geolocation.country}`}
                          {log.response_time_ms && ` • ${log.response_time_ms}ms`}
                        </p>
                      </div>
                      <Badge className={
                        log.response_status >= 500 ? 'bg-red-500/20 text-red-400' :
                        log.response_status >= 400 ? 'bg-yellow-500/20 text-yellow-400' :
                        log.response_status >= 200 ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {log.response_status}
                      </Badge>
                    </div>

                    {log.risk_factors && log.risk_factors.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-red-400 text-xs font-semibold mb-1">Risk Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {log.risk_factors.map((factor, idx) => (
                            <span key={idx} className="text-xs text-white/60">• {factor}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bot Detection Notice */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-purple-400 font-semibold mb-1">AI Bot Verification</p>
              <p className="text-white/70 text-sm">
                Sentinel automatically verifies crawlers using reverse DNS lookups and blocks malicious bots.
                Legitimate search engine bots (Google, Bing) are whitelisted automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}