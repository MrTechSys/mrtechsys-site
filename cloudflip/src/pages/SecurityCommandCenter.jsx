
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Shield,
  AlertTriangle,
  Activity,
  Lock, // Unused import
  Unlock, // Unused import
  Ban,
  Eye, // Unused import
  RefreshCw,
  TrendingUp, // Unused import
  Zap,
  Target,
  Bell
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, subHours } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom'; // Unused import
import { createPageUrl } from '@/utils'; // Unused import
import AIThreatPredictions from "../components/security/AIThreatPredictions"; // Unused import
import AIAuditPanel from "../components/compliance/AIAuditPanel";
import BehaviorAnomalyMonitor from "../components/security/BehaviorAnomalyMonitor";
import ThreatIntelligenceMonitor from "../components/security/ThreatIntelligenceMonitor";
import IncidentPlaybookManager from "../components/security/IncidentPlaybookManager";

const COLORS = ['#ef4444', '#f59e0b', '#06b6d4', '#10b981'];

const severityColors = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  info: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

const threatTypeColors = {
  suspicious_activity: "bg-amber-500/20 text-amber-400",
  rate_limit_exceeded: "bg-red-500/20 text-red-400",
  unauthorized_access: "bg-purple-500/20 text-purple-400",
  attack_detected: "bg-red-600/20 text-red-300",
  policy_violation: "bg-orange-500/20 text-orange-400",
  anomaly_detected: "bg-blue-500/20 text-blue-400"
};

export default function SecurityCommandCenter() {
  const [user, setUser] = useState(null);
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [activeSecurityTab, setActiveSecurityTab] = useState("overview");
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Real-time data fetching
  const { data: alerts = [] } = useQuery({
    queryKey: ['security-alerts-live', timeRange],
    queryFn: async () => {
      const hoursAgo = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      return api.entities.SecurityAlert.filter({
        detected_at: { $gte: subHours(new Date(), hoursAgo).toISOString() }
      }, '-detected_at', 100);
    },
    refetchInterval: 5000, // Real-time: refresh every 5s
    enabled: !!user
  });

  const { data: securityLogs = [] } = useQuery({
    queryKey: ['security-logs-live', timeRange],
    queryFn: async () => {
      const hoursAgo = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      return api.entities.SecurityLog.filter({
        timestamp: { $gte: subHours(new Date(), hoursAgo).toISOString() }
      }, '-timestamp', 500);
    },
    refetchInterval: 10000,
    enabled: !!user
  });

  const { data: rateLimits = [] } = useQuery({
    queryKey: ['rate-limits-live'],
    queryFn: () => api.entities.RateLimitLog.filter({ limit_exceeded: true }, '-last_request_at', 50),
    refetchInterval: 15000,
    enabled: !!user
  });

  // Auto-response mutation
  const blockIpMutation = useMutation({
    mutationFn: async ({ alertId, ipAddress }) => {
      return api.functions.invoke('securityAlertManager', {
        action: 'block_ip',
        alert_id: alertId,
        ip_address: ipAddress
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts-live'] });
      toast.success("IP blocked successfully!");
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: ({ id, status }) => api.entities.SecurityAlert.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts-live'] });
      toast.success("Alert updated!");
    }
  });

  // Calculate metrics
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const highRiskLogs = securityLogs.filter(l => l.risk_score > 70);
  const blockedIPs = new Set(rateLimits.map(r => r.identifier)).size;

  const avgRiskScore = securityLogs.length > 0
    ? (securityLogs.reduce((sum, l) => sum + (l.risk_score || 0), 0) / securityLogs.length).toFixed(1)
    : 0;

  // Alert severity distribution
  const severityDistribution = Object.entries(
    alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Threat type distribution
  const threatDistribution = Object.entries(
    alerts.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').toUpperCase(),
    value
  })).slice(0, 6);

  // Timeline data
  const timelineData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() - (23 - i));

    const hourAlerts = alerts.filter(a => {
      const alertHour = new Date(a.detected_at);
      return alertHour.getHours() === hour.getHours() &&
             alertHour.getDate() === hour.getDate();
    });

    return {
      time: format(hour, 'HH:00'),
      critical: hourAlerts.filter(a => a.severity === 'critical').length,
      high: hourAlerts.filter(a => a.severity === 'high').length,
      medium: hourAlerts.filter(a => a.severity === 'medium').length,
      low: hourAlerts.filter(a => a.severity === 'low').length
    };
  });

  // Risk score timeline
  const riskTimeline = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() - (23 - i));

    const hourLogs = securityLogs.filter(l => {
      const logHour = new Date(l.timestamp);
      return logHour.getHours() === hour.getHours() &&
             logHour.getDate() === hour.getDate();
    });

    const avgScore = hourLogs.length > 0
      ? hourLogs.reduce((sum, l) => sum + (l.risk_score || 0), 0) / hourLogs.length
      : 0;

    return {
      time: format(hour, 'HH:00'),
      risk: avgScore
    };
  });

  const handleAutoBlock = async (alert) => {
    if (!autoBlockEnabled) {
      toast.error("Auto-blocking is disabled");
      return;
    }

    const ipAddress = alert.threat_actor?.ip_address;
    if (!ipAddress) {
      toast.error("No IP address found");
      return;
    }

    blockIpMutation.mutate({ alertId: alert.alert_id, ipAddress });
  };

  const handleManualResolve = (alert, status) => {
    resolveAlertMutation.mutate({ id: alert.id, status });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            Security <span className="text-cyan-400">Command Center</span>
          </h1>
          <p className="text-white/70 mt-1">Real-time threat monitoring & response</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-cyan-500/20">
            <Label className="text-white text-sm">Auto-Block</Label>
            <Switch
              checked={autoBlockEnabled}
              onCheckedChange={setAutoBlockEnabled}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          <Button
            onClick={() => queryClient.invalidateQueries()}
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* New Security Tabs */}
      <Tabs value={activeSecurityTab} onValueChange={setActiveSecurityTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-cyan-500/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Behavior Anomalies</TabsTrigger>
          <TabsTrigger value="threats">Threat Intel</TabsTrigger>
          <TabsTrigger value="playbooks">Response Playbooks</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Live Threat Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge className="bg-red-500/30 text-red-300">LIVE</Badge>
                  </motion.div>
                </div>
                <p className="text-3xl font-bold text-red-400">{criticalAlerts.length}</p>
                <p className="text-xs text-white/60 mt-1">Critical Threats</p>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <Badge className="bg-amber-500/20 text-amber-400">Active</Badge>
                </div>
                <p className="text-3xl font-bold text-amber-400">{activeAlerts.length}</p>
                <p className="text-xs text-white/60 mt-1">Active Alerts</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <Badge className="bg-blue-500/20 text-blue-400">Risk</Badge>
                </div>
                <p className="text-3xl font-bold text-blue-400">{avgRiskScore}</p>
                <p className="text-xs text-white/60 mt-1">Avg Risk Score</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Ban className="w-5 h-5 text-purple-400" />
                  <Badge className="bg-purple-500/20 text-purple-400">Blocked</Badge>
                </div>
                <p className="text-3xl font-bold text-purple-400">{blockedIPs}</p>
                <p className="text-xs text-white/60 mt-1">Blocked IPs</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Compliance Audit Integration - NEW */}
          <div>
            <AIAuditPanel
              orgId={user?.current_org_id}
              onAuditComplete={(data) => {
                queryClient.invalidateQueries({ queryKey: ['security-alerts-live'] });
                queryClient.invalidateQueries({ queryKey: ['security-logs-live'] });
              }}
            />
          </div>

          {/* Real-Time Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">Threat Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#fff" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="url(#criticalGradient)" />
                    <Area type="monotone" dataKey="high" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">Risk Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riskTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="time" stroke="#fff" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#fff" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">Alert Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={severityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white">Threat Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={threatDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis type="number" stroke="#fff" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" stroke="#fff" tick={{ fontSize: 10 }} width={150} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                    />
                    <Bar dataKey="value" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <BehaviorAnomalyMonitor />
          {/* Anomaly Detection from original content */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Top Behavioral Anomalies Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highRiskLogs.slice(0, 5).map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/5 rounded-lg border border-purple-500/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {log.request_method} {log.request_path}
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                          IP: {log.ip_address} • {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </p>
                        {log.risk_factors && log.risk_factors.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {log.risk_factors.map((factor, i) => (
                              <Badge key={i} className="bg-red-500/20 text-red-400 text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-2xl font-bold text-red-400">{log.risk_score}</div>
                        <p className="text-xs text-white/50">Risk</p>
                      </div>
                    </div>
                  </div>
                ))}
                {highRiskLogs.length === 0 && (
                  <p className="text-white/60 text-center py-4">No high-risk anomalies detected recently.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats">
          <ThreatIntelligenceMonitor />
        </TabsContent>

        <TabsContent value="playbooks">
          <IncidentPlaybookManager />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Live Alerts Feed from original content */}
          <Card className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-400 animate-pulse" />
                  Live Threat Feed
                </CardTitle>
                <Badge className="bg-red-500/20 text-red-400">
                  {activeAlerts.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {alerts.slice(0, 20).map((alert, idx) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-lg border ${severityColors[alert.severity]}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{alert.title}</h4>
                            <Badge className={`${threatTypeColors[alert.alert_type]} text-xs`}>
                              {alert.alert_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-white/70 text-sm">{alert.description}</p>
                        </div>
                        <Badge className={`${severityColors[alert.severity]} ml-2 flex-shrink-0`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>

                      {alert.threat_actor && (
                        <div className="mt-3 p-2 bg-white/5 rounded text-xs text-white/60 space-y-1">
                          {alert.threat_actor.ip_address && (
                            <p>🌐 IP: <code className="text-amber-400">{alert.threat_actor.ip_address}</code></p>
                          )}
                          {alert.threat_actor.location && (
                            <p>📍 Location: {alert.threat_actor.location}</p>
                          )}
                          {alert.threat_actor.user_agent && (
                            <p className="truncate">🖥️ {alert.threat_actor.user_agent}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <span className="text-xs text-white/50">
                          {format(new Date(alert.detected_at), 'MMM d, HH:mm:ss')}
                        </span>
                        <div className="flex gap-2">
                          {alert.status === 'active' && alert.threat_actor?.ip_address && (
                            <Button
                              size="sm"
                              onClick={() => handleAutoBlock(alert)}
                              disabled={blockIpMutation.isPending || !autoBlockEnabled}
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 h-7 text-xs"
                            >
                              <Ban className="w-3 h-3 mr-1" />
                              Block IP
                            </Button>
                          )}
                          {alert.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleManualResolve(alert, 'investigating')}
                                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 h-7 text-xs"
                              >
                                Investigate
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleManualResolve(alert, 'false_positive')}
                                className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 h-7 text-xs"
                              >
                                False Positive
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {alert.auto_actions_taken && alert.auto_actions_taken.length > 0 && (
                        <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
                          <p className="text-xs text-green-400 font-medium mb-1">🤖 Automated Response:</p>
                          {alert.auto_actions_taken.map((action, i) => (
                            <p key={i} className="text-xs text-white/70">
                              ✓ {action.action} - {action.result}
                            </p>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {alerts.length === 0 && (
                    <p className="text-white/60 text-center py-4">No active alerts at this time.</p>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
