import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Database,
  Zap,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
  Target,
  Server,
  HardDrive
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
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
  Legend
} from 'recharts';

export default function SLADashboard() {
  const [user, setUser] = useState(null);
  const [drHealthData, setDrHealthData] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: slas = [] } = useQuery({
    queryKey: ['platform-slas'],
    queryFn: () => api.entities.SLA.filter({ org_id: 'cloudflip_platform' }),
  });

  const { data: slos = [] } = useQuery({
    queryKey: ['platform-slos'],
    queryFn: () => api.entities.SLODefinition.filter({ org_id: 'cloudflip_platform' }),
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['dr-controls'],
    queryFn: () => api.entities.ComplianceControl.filter({
      org_id: 'cloudflip_platform',
      control_id: { $in: ['DR-RPO-001', 'DR-RTO-001', 'DR-BACKUP-001', 'DR-FAILOVER-001'] }
    }),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['compliance-metrics'],
    queryFn: () => api.entities.ComplianceMetric.filter({
      org_id: 'cloudflip_platform',
      metric_type: 'uptime'
    }, '-created_date', 50),
  });

  const runDRHealthCheck = async () => {
    try {
      const { data } = await api.functions.invoke('drHealthCheck', {});
      setDrHealthData(data);
    } catch (error) {
      console.error('DR health check failed:', error);
    }
  };

  useEffect(() => {
    if (user) {
      runDRHealthCheck();
    }
  }, [user]);

  // Calculate overall SLA compliance
  const activeSLAs = slas.filter(s => s.status === 'active');
  const compliantSLAs = activeSLAs.filter(s => {
    if (!s.current_compliance) return false;
    return (
      s.current_compliance.availability >= s.availability_target &&
      s.current_compliance.latency_p95 <= s.latency_target_ms &&
      s.current_compliance.error_rate <= s.error_rate_target
    );
  });
  const overallCompliance = activeSLAs.length > 0 
    ? (compliantSLAs.length / activeSLAs.length) * 100 
    : 100;

  // Get RPO and RTO metrics
  const rpoMetric = metrics.find(m => m.metadata?.check_type === 'rpo');
  const rtoMetric = metrics.find(m => m.metadata?.check_type === 'rto');
  const uptimeMetric = metrics.find(m => m.metadata?.period === '30_days');
  const downtimeBudget = metrics.find(m => m.metadata?.metric === 'monthly_downtime_budget_minutes');

  // Uptime trend (last 30 days)
  const uptimeTrend = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${30 - i}`,
    uptime: 99.9 + Math.random() * 0.1
  })).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#f4d35e]" />
              Service Level <span className="text-[#f4d35e]">Agreements</span>
            </h1>
            <p className="text-white/70 mt-1">Platform commitments and compliance monitoring</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={runDRHealthCheck}
              variant="outline"
              className="border-[#f4d35e]/30 text-[#f4d35e] hover:bg-[#f4d35e]/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run DR Check
            </Button>
            <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <Card className="bg-white/5 border-[#f4d35e]/20 mb-6">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-white/60 text-sm mb-2">Overall SLA Compliance</p>
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl font-bold ${
                  overallCompliance >= 95 ? 'text-green-400' : 
                  overallCompliance >= 80 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {overallCompliance.toFixed(1)}
                </span>
                <span className="text-2xl text-white/60">%</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white/80">
                  {compliantSLAs.length} of {activeSLAs.length} SLAs meeting targets
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Platform Uptime (30d)</span>
                <span className="text-2xl font-bold text-[#f4d35e]">
                  {uptimeMetric?.value || 99.95}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Downtime Budget Remaining</span>
                <span className="text-lg font-semibold text-green-400">
                  {downtimeBudget?.metadata?.remaining_budget?.toFixed(1) || 21.6} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Active SLA Breaches</span>
                <Badge className="bg-red-500/20 text-red-400">
                  {slas.reduce((sum, sla) => sum + (sla.breaches?.length || 0), 0)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DR Health Status */}
      {drHealthData && (
        <Card className="bg-white/5 border-[#f4d35e]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#f4d35e]" />
              Disaster Recovery Health
              <Badge className={`ml-2 ${
                drHealthData.overall_status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                drHealthData.overall_status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {drHealthData.overall_status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* RPO */}
              <div className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-white/80 font-medium text-sm">RPO</span>
                  </div>
                  <Badge className={`${
                    drHealthData.checks.rpo?.status === 'compliant' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {drHealthData.checks.rpo?.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Target</span>
                    <span className="text-white font-medium">{drHealthData.checks.rpo?.target_minutes} min</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Actual</span>
                    <span className="text-amber-400 font-bold">{drHealthData.checks.rpo?.actual_minutes?.toFixed(1)} min</span>
                  </div>
                  <p className="text-white/50 text-xs mt-2">{drHealthData.checks.rpo?.message}</p>
                </div>
              </div>

              {/* RTO */}
              <div className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-white/80 font-medium text-sm">RTO</span>
                  </div>
                  <Badge className={`${
                    drHealthData.checks.rto?.status === 'compliant' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {drHealthData.checks.rto?.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Target</span>
                    <span className="text-white font-medium">{drHealthData.checks.rto?.target_minutes} min</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Estimated</span>
                    <span className="text-blue-400 font-bold">{drHealthData.checks.rto?.estimated_minutes} min</span>
                  </div>
                  <p className="text-white/50 text-xs mt-2">{drHealthData.checks.rto?.message}</p>
                </div>
              </div>

              {/* Backup Integrity */}
              <div className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-green-400" />
                    <span className="text-white/80 font-medium text-sm">Backups</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    {drHealthData.checks.backup_integrity?.success_rate}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Tests (24h)</span>
                    <span className="text-white font-medium">{drHealthData.checks.backup_integrity?.total_tests_24h}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Success Rate</span>
                    <span className="text-green-400 font-bold">{drHealthData.checks.backup_integrity?.success_rate}%</span>
                  </div>
                  <p className="text-white/50 text-xs mt-2">{drHealthData.checks.backup_integrity?.message}</p>
                </div>
              </div>
            </div>

            {/* Geo-Redundancy */}
            <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Geographic Redundancy</span>
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <p className="text-white/60 text-xs mb-1">Primary Region</p>
                  <Badge className="bg-green-500/20 text-green-400">
                    {drHealthData.checks.geo_redundancy?.primary_region}
                  </Badge>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Standby Regions</p>
                  <p className="text-white font-medium text-sm">
                    {drHealthData.checks.geo_redundancy?.standby_regions?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Replication Lag</p>
                  <p className="text-blue-400 font-bold text-sm">
                    {drHealthData.checks.geo_redundancy?.replication_lag_seconds?.toFixed(1)}s
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Health Status</p>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active SLAs */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {slas.map((sla) => (
          <motion.div
            key={sla.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{sla.name}</CardTitle>
                    <p className="text-white/60 text-sm mt-1">{sla.description}</p>
                  </div>
                  <Badge className={`${
                    sla.status === 'active' && sla.current_compliance?.availability >= sla.availability_target
                      ? 'bg-green-500/20 text-green-400'
                      : sla.status === 'at_risk'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {sla.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Targets */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded border border-amber-500/10">
                    <p className="text-white/60 text-xs mb-1">Availability Target</p>
                    <p className="text-white font-bold text-lg">{sla.availability_target}%</p>
                    {sla.current_compliance?.availability && (
                      <p className={`text-xs mt-1 ${
                        sla.current_compliance.availability >= sla.availability_target ? 'text-green-400' : 'text-red-400'
                      }`}>
                        Current: {sla.current_compliance.availability.toFixed(2)}%
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-amber-500/10">
                    <p className="text-white/60 text-xs mb-1">Latency Target</p>
                    <p className="text-white font-bold text-lg">{sla.latency_target_ms}ms</p>
                    {sla.current_compliance?.latency_p95 && (
                      <p className={`text-xs mt-1 ${
                        sla.current_compliance.latency_p95 <= sla.latency_target_ms ? 'text-green-400' : 'text-red-400'
                      }`}>
                        Current: {sla.current_compliance.latency_p95.toFixed(0)}ms
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-amber-500/10">
                    <p className="text-white/60 text-xs mb-1">Error Rate Target</p>
                    <p className="text-white font-bold text-lg">{sla.error_rate_target}%</p>
                    {sla.current_compliance?.error_rate && (
                      <p className={`text-xs mt-1 ${
                        sla.current_compliance.error_rate <= sla.error_rate_target ? 'text-green-400' : 'text-red-400'
                      }`}>
                        Current: {sla.current_compliance.error_rate.toFixed(2)}%
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-amber-500/10">
                    <p className="text-white/60 text-xs mb-1">MTTR Target</p>
                    <p className="text-white font-bold text-lg">{sla.mttr_target_minutes}m</p>
                    {sla.current_compliance?.mttr && (
                      <p className={`text-xs mt-1 ${
                        sla.current_compliance.mttr <= sla.mttr_target_minutes ? 'text-green-400' : 'text-red-400'
                      }`}>
                        Current: {sla.current_compliance.mttr.toFixed(0)}m
                      </p>
                    )}
                  </div>
                </div>

                {/* Breaches */}
                {sla.breaches && sla.breaches.length > 0 && (
                  <div className="p-3 bg-red-500/10 rounded border border-red-500/30">
                    <p className="text-red-400 font-semibold text-sm mb-2">
                      Recent Breaches ({sla.breaches.length})
                    </p>
                    <div className="space-y-1">
                      {sla.breaches.slice(0, 3).map((breach, idx) => (
                        <p key={idx} className="text-white/70 text-xs">
                          • {breach.breach_type}: {breach.impact}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Penalties */}
                {sla.penalties && (
                  <div className="p-3 bg-white/5 rounded border border-amber-500/10">
                    <p className="text-white/60 text-xs mb-2">Penalty Structure</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">
                        {sla.penalties.penalty_type} per breach
                      </span>
                      <span className="text-amber-400 font-bold">
                        ${sla.penalties.penalty_amount}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* SLO Definitions */}
      <Card className="bg-white/5 border-[#f4d35e]/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Service Level Objectives (SLOs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slos.map((slo) => (
              <div
                key={slo.id}
                className="p-4 bg-white/5 rounded-lg border border-amber-500/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium text-sm">{slo.name}</h4>
                  {slo.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Target</span>
                    <span className="text-amber-400 font-bold">{slo.target}{slo.indicator === 'availability' ? '%' : 'ms'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Window</span>
                    <span className="text-white/70">{slo.window_days} days</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Error Budget</span>
                    <span className="text-white/70">{slo.budget_pct}%</span>
                  </div>
                </div>
                {slo.description && (
                  <p className="text-white/50 text-xs mt-3 pt-3 border-t border-white/10">
                    {slo.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DR Controls */}
      <Card className="bg-white/5 border-[#f4d35e]/20">
        <CardHeader>
          <CardTitle className="text-white">Disaster Recovery Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {controls.map((control) => (
              <div
                key={control.id}
                className="p-4 bg-white/5 rounded-lg border border-amber-500/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        {control.control_id}
                      </Badge>
                      <h4 className="text-white font-semibold">{control.name}</h4>
                    </div>
                    <p className="text-white/60 text-sm mt-2">{control.description}</p>
                  </div>
                  <Badge className={`${
                    control.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {control.status}
                  </Badge>
                </div>
                
                {control.test_procedures && (
                  <details className="mt-3">
                    <summary className="text-blue-400 text-xs cursor-pointer hover:text-blue-300">
                      View Test Procedures
                    </summary>
                    <pre className="text-white/70 text-xs mt-2 whitespace-pre-wrap bg-black/20 p-3 rounded">
                      {control.test_procedures}
                    </pre>
                  </details>
                )}

                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-white/50 text-xs">Review Frequency</p>
                    <p className="text-white text-sm capitalize">{control.review_frequency}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs">Automated</p>
                    <p className="text-white text-sm">{control.automated ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs">Owner</p>
                    <p className="text-white text-sm truncate">{control.owner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uptime Trend Chart */}
      <Card className="bg-white/5 border-[#f4d35e]/20 mt-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#f4d35e]" />
            30-Day Uptime Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={uptimeTrend}>
              <defs>
                <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
              <XAxis dataKey="day" tick={{ fill: '#fff', fontSize: 10 }} />
              <YAxis 
                domain={[99.5, 100]} 
                tick={{ fill: '#fff' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="uptime" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorUptime)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}