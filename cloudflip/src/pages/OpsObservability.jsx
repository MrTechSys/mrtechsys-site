
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Database,
  Sparkles,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#f4d35e', '#3cf7d4', '#3b82f6', '#10b981', '#ef4444'];

export default function OpsObservability() {
  const [user, setUser] = useState(null);
  const [includeDemoData, setIncludeDemoData] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [enablingTelemetry, setEnablingTelemetry] = useState(false);
  const [capturingBaseline, setCapturingBaseline] = useState(false);

  // Check user permissions
  const [userPermissions, setUserPermissions] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAdmin(currentUser.role === 'admin');

      // Load user role permissions
      const roles = await api.entities.UserRole.filter({
        org_id: currentUser.current_org_id,
        user_id: currentUser.id
      });

      if (roles.length > 0 && roles[0].permissions) {
        setUserPermissions(roles[0].permissions);
      } else if (currentUser.role === 'admin') {
        // Admin has all permissions by default if no specific UserRole is found
        setUserPermissions({
          can_manage_sla: true,
          can_manage_incidents: true,
          can_view_compliance: true,
          can_view_metrics: true
        });
      } else {
        // Default viewer permissions for non-admins without specific roles
        setUserPermissions({
          can_manage_sla: false,
          can_manage_incidents: false,
          can_view_compliance: true,
          can_view_metrics: true
        });
      }
    };
    loadUser();
  }, []);

  const { data: adminSettings = [] } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.entities.AdminSettings.filter({ org_id: user.current_org_id }),
    enabled: !!user && isAdmin
  });

  useEffect(() => {
    if (adminSettings.length > 0) {
      setDemoMode(adminSettings[0].demo_mode || false);
    }
  }, [adminSettings]);

  const { data: telemetryEvents = [] } = useQuery({
    queryKey: ['telemetry-events', includeDemoData],
    queryFn: () => api.entities.TelemetryEvent.filter({
      org_id: user.current_org_id,
      ...(includeDemoData ? {} : { demo: false })
    }, '-timestamp', 500),
    enabled: !!user
  });

  const { data: releases = [] } = useQuery({
    queryKey: ['releases'],
    queryFn: () => api.entities.Release.filter({ org_id: user.current_org_id }, '-created_date', 20),
    enabled: !!user
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: () => api.entities.AlertRule.filter({ org_id: user.current_org_id, is_active: true }),
    enabled: !!user
  });

  const { data: slas = [] } = useQuery({
    queryKey: ['slas'],
    queryFn: () => api.entities.SLA.filter({ org_id: user.current_org_id }),
    enabled: !!user && (userPermissions?.can_view_compliance || userPermissions?.can_manage_sla)
  });

  const { data: sloDefs = [] } = useQuery({
    queryKey: ['slo-definitions'],
    queryFn: () => api.entities.SLODefinition.filter({ org_id: user.current_org_id }),
    enabled: !!user && (userPermissions?.can_view_compliance || userPermissions?.can_manage_sla)
  });

  const { data: sloBurns = [] } = useQuery({
    queryKey: ['slo-burns'],
    queryFn: () => api.entities.SLOBurn.filter({ org_id: user.current_org_id }),
    enabled: !!user && (userPermissions?.can_view_compliance || userPermissions?.can_manage_sla)
  });

  const handleToggleDemoMode = async () => {
    if (!isAdmin) return;

    try {
      if (adminSettings.length > 0) {
        await api.entities.AdminSettings.update(adminSettings[0].id, {
          demo_mode: !demoMode,
          last_toggled_by: user.id,
          last_toggled_at: new Date().toISOString()
        });
      } else {
        await api.entities.AdminSettings.create({
          org_id: user.current_org_id,
          demo_mode: !demoMode,
          last_toggled_by: user.id,
          last_toggled_at: new Date().toISOString()
        });
      }
      setDemoMode(!demoMode);
      toast.success(`Demo mode ${!demoMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle demo mode');
    }
  };

  const handlePurgeDemoData = async () => {
    if (!isAdmin || !confirm('Are you sure you want to purge all demo data? This cannot be undone.')) {
      return;
    }

    try {
      const { data } = await api.functions.invoke('purgeDemoData', {});
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed to purge demo data');
    }
  };

  const handleEnableTelemetry = async () => {
    setEnablingTelemetry(true);
    try {
      await api.functions.invoke('enableTelemetry', {
        orgId: user.current_org_id,
        enabled: true
      });
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Telemetry enabled successfully');
    } catch (error) {
      toast.error('Failed to enable telemetry');
      console.error(error);
    } finally {
      setEnablingTelemetry(false);
    }
  };

  const handleCaptureBaseline = async () => {
    setCapturingBaseline(true);
    try {
      const { data } = await api.functions.invoke('baselineManager', {
        orgId: user.current_org_id,
        snapshotType: 'manual',
        notes: 'Manual snapshot from Observability dashboard'
      });
      toast.success(`Baseline captured: ${data.summary.services} services, ${data.summary.system_health_pct}% health`);
    } catch (error) {
      toast.error('Failed to capture baseline');
      console.error(error);
    } finally {
      setCapturingBaseline(false);
    }
  };

  // Calculate metrics
  const totalSessions = new Set(telemetryEvents.map(e => e.session_id)).size;
  const uniqueUsers = new Set(telemetryEvents.map(e => e.user_id).filter(Boolean)).size;
  const totalEvents = telemetryEvents.length;
  const errorEvents = telemetryEvents.filter(e => 
    e.event?.includes('error') || e.event?.includes('exception')
  );
  const errorRate = totalEvents > 0 ? (errorEvents.length / totalEvents) * 100 : 0;

  // Module breakdown
  const moduleData = Object.entries(
    telemetryEvents.reduce((acc, e) => {
      acc[e.module] = (acc[e.module] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Traffic over time (last 24 hours)
  const trafficData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() - (23 - i));
    const hourStr = hour.getHours();
    const count = telemetryEvents.filter(e => {
      const eventHour = new Date(e.timestamp || e.created_date).getHours();
      return eventHour === hourStr;
    }).length;
    return { hour: `${hourStr}:00`, events: count };
  });

  // Funnel data
  const leadEvents = telemetryEvents.filter(e => e.event === 'lead_created').length;
  const quoteEvents = telemetryEvents.filter(e => e.event === 'quote_created').length;
  const invoiceEvents = telemetryEvents.filter(e => e.event === 'invoice_sent').length;
  const paymentEvents = telemetryEvents.filter(e => e.event === 'payment_received').length;

  const funnelData = [
    { stage: 'Leads', count: leadEvents, color: COLORS[0] },
    { stage: 'Quotes', count: quoteEvents, color: COLORS[1] },
    { stage: 'Invoices', count: invoiceEvents, color: COLORS[2] },
    { stage: 'Payments', count: paymentEvents, color: COLORS[3] }
  ];

  // Check permission before showing sensitive tabs
  const canViewSLA = userPermissions?.can_view_compliance || userPermissions?.can_manage_sla;
  const canManageSLA = userPermissions?.can_manage_sla; // Not directly used for tab visibility, but good to define.

  const telemetryEnabled = adminSettings.length > 0 ? adminSettings[0].telemetry_enabled : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#f4d35e]" />
            DevOps <span className="text-[#f4d35e]">Observability</span>
          </h1>
          <p className="text-white/70 mt-1">Real-time metrics, analytics, and insights</p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleCaptureBaseline}
              disabled={capturingBaseline}
              variant="outline"
              className="border-[#3cf7d4]/30 text-[#3cf7d4] hover:bg-[#3cf7d4]/10"
            >
              {capturingBaseline ? (
                <>Capturing...</>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Capture Baseline
                </>
              )}
            </Button>

            {!telemetryEnabled && (
              <Button
                onClick={handleEnableTelemetry}
                disabled={enablingTelemetry}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
              >
                {enablingTelemetry ? (
                  <>Enabling...</>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Enable Telemetry
                  </>
                )}
              </Button>
            )}

            {telemetryEnabled && (
              <Badge className="bg-green-500/20 text-green-400 py-2 px-3">
                <Activity className="w-3 h-3 mr-1" />
                Telemetry Active
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Admin Controls (existing demo mode toggle) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-[#f4d35e]/10 to-[#3cf7d4]/10 border border-[#f4d35e]/30 rounded-xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#f4d35e]" />
                Admin Controls
              </h3>
              <p className="text-white/60 text-sm mt-1">
                Demo mode: {demoMode ? 'ON - Generating synthetic events' : 'OFF - Real data only'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleToggleDemoMode}
                variant="outline"
                className="border-[#f4d35e]/30 text-[#f4d35e] hover:bg-[#f4d35e]/10"
              >
                {demoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'}
              </Button>
              {demoMode && (
                <Button
                  onClick={handlePurgeDemoData}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Purge Demo Data
                </Button>
              )}
               <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-[#f4d35e]/20">
                <Label className="text-white text-sm">Include Demo Data</Label>
                <Switch
                  checked={includeDemoData}
                  onCheckedChange={setIncludeDemoData}
                  className="data-[state=checked]:bg-[#f4d35e]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/5 border border-[#f4d35e]/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#f4d35e]/20 data-[state=active]:text-[#f4d35e]">
            Overview
          </TabsTrigger>
          {canViewSLA && (
            <>
              <TabsTrigger value="sla" className="data-[state=active]:bg-[#f4d35e]/20 data-[state=active]:text-[#f4d35e]">
                SLA Tracking
              </TabsTrigger>
              <TabsTrigger value="slo" className="data-[state=active]:bg-[#f4d35e]/20 data-[state=active]:text-[#f4d35e]">
                SLO Burn
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="telemetry" className="data-[state=active]:bg-[#f4d35e]/20 data-[state=active]:text-[#f4d35e]">
            Telemetry
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Sessions</p>
                    <p className="text-3xl font-bold text-[#f4d35e]">{totalSessions}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#f4d35e]/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Unique Users</p>
                    <p className="text-3xl font-bold text-[#3cf7d4]">{uniqueUsers}</p>
                  </div>
                  <Activity className="w-8 h-8 text-[#3cf7d4]/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Events</p>
                    <p className="text-3xl font-bold text-white">{totalEvents}</p>
                  </div>
                  <Zap className="w-8 h-8 text-white/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Error Rate</p>
                    <p className={`text-3xl font-bold ${errorRate > 3 ? 'text-red-400' : 'text-green-400'}`}>
                      {errorRate.toFixed(1)}%
                    </p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 ${errorRate > 3 ? 'text-red-400/50' : 'text-green-400/50'}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Traffic Over Time */}
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Traffic Overview (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                    <XAxis dataKey="hour" tick={{ fill: '#fff', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#fff' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="events" stroke="#f4d35e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Module Breakdown */}
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Events by Module</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={moduleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {moduleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Funnel */}
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.stage} className="text-center">
                    <div className="relative">
                      <div 
                        className="h-24 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${stage.color}20`, border: `2px solid ${stage.color}` }}
                      >
                        <div className="text-center">
                          <p className="text-3xl font-bold" style={{ color: stage.color }}>{stage.count}</p>
                          <p className="text-white/60 text-sm">{stage.stage}</p>
                        </div>
                      </div>
                      {index < funnelData.length - 1 && (
                        <div className="absolute -right-2 top-1/2 transform translate-x-full -translate-y-1/2">
                          <TrendingUp className="w-6 h-6 text-white/30" />
                        </div>
                      )}
                    </div>
                    {index < funnelData.length - 1 && (
                      <p className="text-white/40 text-xs mt-2">
                        {funnelData[index + 1].count > 0 
                          ? `${((funnelData[index + 1].count / stage.count) * 100).toFixed(0)}% →`
                          : '0% →'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Releases */}
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#3cf7d4]" />
                Recent Deployments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {releases.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No deployments yet</p>
                ) : (
                  releases.map((release) => (
                    <div key={release.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-[#f4d35e]/10">
                      <div className="flex items-center gap-3">
                        {release.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : release.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        )}
                        <div>
                          <p className="text-white font-medium">{release.version}</p>
                          <p className="text-white/60 text-sm">{release.environment}</p>
                        </div>
                      </div>
                      <Badge 
                        className={`${
                          release.status === 'success' ? 'bg-green-500/20 text-green-400' :
                          release.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
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
        </TabsContent>

        {/* SLA Tracking Tab */}
        {canViewSLA && (
          <TabsContent value="sla" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-[#f4d35e]/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">Active SLAs</p>
                    <p className="text-4xl font-bold text-white">{slas.filter(s => s.status === 'active').length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-[#f4d35e]/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">Breached</p>
                    <p className="text-4xl font-bold text-red-400">{slas.filter(s => s.status === 'breached').length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-[#f4d35e]/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">At Risk</p>
                    <p className="text-4xl font-bold text-yellow-400">{slas.filter(s => s.status === 'at_risk').length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SLA Details */}
            <div className="space-y-4">
              {slas.map((sla) => {
                const statusColors = {
                  active: 'border-green-500/30 bg-green-500/10',
                  breached: 'border-red-500/30 bg-red-500/10',
                  at_risk: 'border-yellow-500/30 bg-yellow-500/10',
                  expired: 'border-gray-500/30 bg-gray-500/10'
                };

                return (
                  <Card key={sla.id} className={`bg-white/5 border ${statusColors[sla.status] || statusColors.active}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">{sla.name}</CardTitle>
                          <p className="text-white/60 text-sm mt-1">{sla.description}</p>
                        </div>
                        <Badge className={`${
                          sla.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          sla.status === 'breached' ? 'bg-red-500/20 text-red-400' :
                          sla.status === 'at_risk' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        } border-0`}>
                          {sla.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        {sla.availability_target && (
                          <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-white/60 mb-1">Availability</p>
                            <p className={`text-2xl font-bold ${
                              (sla.current_compliance?.availability || 0) >= sla.availability_target 
                                ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {(sla.current_compliance?.availability || 0).toFixed(2)}%
                            </p>
                            <p className="text-xs text-white/50 mt-1">Target: {sla.availability_target}%</p>
                          </div>
                        )}

                        {sla.latency_target_ms && (
                          <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-white/60 mb-1">Latency P95</p>
                            <p className={`text-2xl font-bold ${
                              (sla.current_compliance?.latency_p95 || 0) <= sla.latency_target_ms 
                                ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {(sla.current_compliance?.latency_p95 || 0).toFixed(0)}ms
                            </p>
                            <p className="text-xs text-white/50 mt-1">Target: ≤{sla.latency_target_ms}ms</p>
                          </div>
                        )}

                        {sla.error_rate_target && (
                          <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-white/60 mb-1">Error Rate</p>
                            <p className={`text-2xl font-bold ${
                              (sla.current_compliance?.error_rate || 0) <= sla.error_rate_target 
                                ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {(sla.current_compliance?.error_rate || 0).toFixed(2)}%
                            </p>
                            <p className="text-xs text-white/50 mt-1">Target: ≤{sla.error_rate_target}%</p>
                          </div>
                        )}

                        {sla.mttr_target_minutes && (
                          <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-white/60 mb-1">MTTR</p>
                            <p className={`text-2xl font-bold ${
                              (sla.current_compliance?.mttr || 0) <= sla.mttr_target_minutes 
                                ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {(sla.current_compliance?.mttr || 0).toFixed(0)}min
                            </p>
                            <p className="text-xs text-white/50 mt-1">Target: ≤{sla.mttr_target_minutes}min</p>
                          </div>
                        )}
                      </div>

                      {/* Recent Breaches */}
                      {(sla.breaches || []).length > 0 && (
                        <div className="border-t border-white/10 pt-3">
                          <p className="text-white/60 text-xs font-semibold mb-2">
                            Recent Breaches ({sla.breaches.length} total)
                          </p>
                          <div className="space-y-2">
                            {(sla.breaches || []).slice(-5).reverse().map((breach, idx) => (
                              <div key={idx} className="p-2 bg-red-500/10 rounded text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-red-400 font-semibold uppercase">{breach.breach_type}</span>
                                  <span className="text-white/50">
                                    {new Date(breach.occurred_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-white/70">{breach.impact}</p>
                                {breach.resolved_at && (
                                  <p className="text-green-400 mt-1">
                                    ✓ Resolved {new Date(breach.resolved_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {slas.length === 0 && (
                <Card className="bg-white/5 border-[#f4d35e]/20">
                  <CardContent className="p-12 text-center">
                    <Shield className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No SLAs configured yet</p>
                    <p className="text-white/40 text-sm mt-2">Define SLAs to track compliance</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}

        {/* SLO Burn Tab */}
        {canViewSLA && (
          <TabsContent value="slo" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sloDefs.map((slo) => {
                const burn = sloBurns.find(b => b.slo_id === slo.id && b.window === '30d');
                const burnStatus = burn?.status || 'healthy';
                
                const statusColors = {
                  healthy: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
                  warning: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
                  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' }
                }[burnStatus];

                return (
                  <Card key={slo.id} className={`bg-white/5 border ${statusColors.border}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-base">{slo.name}</CardTitle>
                        <Badge className={`${statusColors.bg} ${statusColors.text} border-0 text-xs`}>
                          {burnStatus}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-xs">{slo.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/60">Target</span>
                            <span className="text-white font-semibold">{slo.target}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Indicator</span>
                            <span className="text-white/80">{slo.indicator?.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {burn && (
                          <>
                            <div className="border-t border-white/10 pt-3">
                              <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-white/60">Error Budget Remaining</span>
                                  <span className={statusColors.text}>
                                    {burn.remaining_budget_pct.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      burn.remaining_budget_pct > 50 ? 'bg-green-400' :
                                      burn.remaining_budget_pct > 20 ? 'bg-yellow-400' :
                                      'bg-red-400'
                                    }`}
                                    style={{ width: `${Math.max(0, burn.remaining_budget_pct)}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-white/60">Burn Rate</span>
                                  <span className="text-white">{burn.burn_rate.toFixed(3)}x</span>
                                </div>
                                {burn.projected_exhaust_ts && burn.remaining_budget_pct < 50 && (
                                  <div className="flex justify-between">
                                    <span className="text-white/60">Est. Exhaust</span>
                                    <span className="text-red-400">
                                      {new Date(burn.projected_exhaust_ts).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {sloDefs.length === 0 && (
                <div className="col-span-full">
                  <Card className="bg-white/5 border-[#f4d35e]/20">
                    <CardContent className="p-12 text-center">
                      <Activity className="w-16 h-16 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">No SLOs defined yet</p>
                      <p className="text-white/40 text-sm mt-2">Create SLOs to track service reliability</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Telemetry Tab */}
        <TabsContent value="telemetry" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Sessions</p>
                    <p className="text-3xl font-bold text-[#f4d35e]">{totalSessions}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#f4d35e]/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Unique Users</p>
                    <p className="text-3xl font-bold text-[#3cf7d4]">{uniqueUsers}</p>
                  </div>
                  <Activity className="w-8 h-8 text-[#3cf7d4]/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Events</p>
                    <p className="text-3xl font-bold text-white">{totalEvents}</p>
                  </div>
                  <Zap className="w-8 h-8 text-white/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Error Rate</p>
                    <p className={`text-3xl font-bold ${errorRate > 3 ? 'text-red-400' : 'text-green-400'}`}>
                      {errorRate.toFixed(1)}%
                    </p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 ${errorRate > 3 ? 'text-red-400/50' : 'text-green-400/50'}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Traffic Over Time */}
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Traffic Overview (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                    <XAxis dataKey="hour" tick={{ fill: '#fff', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#fff' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="events" stroke="#f4d35e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Module Breakdown */}
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <CardTitle className="text-white">Events by Module</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={moduleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {moduleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Funnel */}
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.stage} className="text-center">
                    <div className="relative">
                      <div 
                        className="h-24 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${stage.color}20`, border: `2px solid ${stage.color}` }}
                      >
                        <div className="text-center">
                          <p className="text-3xl font-bold" style={{ color: stage.color }}>{stage.count}</p>
                          <p className="text-white/60 text-sm">{stage.stage}</p>
                        </div>
                      </div>
                      {index < funnelData.length - 1 && (
                        <div className="absolute -right-2 top-1/2 transform translate-x-full -translate-y-1/2">
                          <TrendingUp className="w-6 h-6 text-white/30" />
                        </div>
                      )}
                    </div>
                    {index < funnelData.length - 1 && (
                      <p className="text-white/40 text-xs mt-2">
                        {funnelData[index + 1].count > 0 
                          ? `${((funnelData[index + 1].count / stage.count) * 100).toFixed(0)}% →`
                          : '0% →'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Releases */}
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#3cf7d4]" />
                Recent Deployments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {releases.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No deployments yet</p>
                ) : (
                  releases.map((release) => (
                    <div key={release.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-[#f4d35e]/10">
                      <div className="flex items-center gap-3">
                        {release.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : release.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        )}
                        <div>
                          <p className="text-white font-medium">{release.version}</p>
                          <p className="text-white/60 text-sm">{release.environment}</p>
                        </div>
                      </div>
                      <Badge 
                        className={`${
                          release.status === 'success' ? 'bg-green-500/20 text-green-400' :
                          release.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
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
        </TabsContent>
      </Tabs>

      {/* Permission warning if trying to access restricted tab */}
      {!canViewSLA && (activeTab === 'sla' || activeTab === 'slo') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-white">You don't have permission to view SLA/SLO data</p>
              <p className="text-white/60 text-sm mt-2">Contact your administrator for access</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
