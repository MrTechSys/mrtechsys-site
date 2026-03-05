
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Zap,
  TrendingUp,
  Clock,
  Users,
  Globe,
  Sparkles,
  XCircle,
  Calendar,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { getPollingInterval } from '../components/utils/pollingConfig';

const statusColors = {
  healthy: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  degraded: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  down: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  unknown: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
};

const severityColors = {
  sev1: 'text-red-400',
  sev2: 'text-orange-400',
  sev3: 'text-yellow-400',
  sev4: 'text-blue-400'
};

export default function LaunchControlCenter() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      // Load subscription
      try {
        const subs = await api.entities.BillingSubscription.list();
        setSubscription(subs.length > 0 ? subs[0] : { plan: 'free' });
      } catch (error) {
        console.error("Failed to load subscription:", error);
        setSubscription({ plan: 'free' });
      }
    };
    loadUser();
  }, []);

  const plan = subscription?.plan || 'free';
  const operationalInterval = getPollingInterval('operational', plan);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.entities.Service.filter({ org_id: user.current_org_id }),
    enabled: !!user
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['active-incidents'],
    queryFn: () => api.entities.Incident.filter({
      org_id: user.current_org_id,
      status: { $in: ['investigating', 'identified', 'monitoring'] }
    }),
    enabled: !!user
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['recent-anomalies'],
    queryFn: () => api.entities.Anomaly.filter({
      org_id: user.current_org_id,
      status: 'detected'
    }, '-detected_at', 10),
    enabled: !!user
  });

  const { data: recentMetrics = [] } = useQuery({
    queryKey: ['recent-metrics', timeRange],
    queryFn: () => api.entities.MetricsTimeSeries.filter({
      org_id: user.current_org_id,
      demo: false
    }, '-timestamp', 100),
    enabled: !!user,
    refetchInterval: operationalInterval
  });

  const { data: capacityForecasts = [] } = useQuery({
    queryKey: ['capacity-forecasts'],
    queryFn: () => api.entities.CapacityForecast.filter({
      org_id: user.current_org_id,
      horizon_days: 30
    }, '-generated_at', 10),
    enabled: !!user
  });

  const { data: slas = [] } = useQuery({
    queryKey: ['slas'],
    queryFn: () => api.entities.SLA.filter({
      org_id: user.current_org_id,
      status: { $in: ['active', 'breached', 'at_risk'] }
    }),
    enabled: !!user
  });

  const handleScheduleReport = () => {
    window.location.href = createPageUrl("ScheduledReports") + "?type=devops_performance";
  };

  // Calculate system health
  const healthyServices = services.filter(s => s.health_status === 'healthy').length;
  const degradedServices = services.filter(s => s.health_status === 'degraded').length;
  const downServices = services.filter(s => s.health_status === 'down').length;
  const healthPercentage = services.length > 0 ? (healthyServices / services.length) * 100 : 100;

  // Aggregate metrics
  const avgErrorRate = recentMetrics.filter(m => m.metric === 'error_rate')
    .reduce((sum, m) => sum + m.value, 0) / Math.max(recentMetrics.filter(m => m.metric === 'error_rate').length, 1);
  
  const avgLatency = recentMetrics.filter(m => m.metric === 'latency_p95')
    .reduce((sum, m) => sum + m.value, 0) / Math.max(recentMetrics.filter(m => m.metric === 'latency_p95').length, 1);

  // Prepare chart data
  const metricsChartData = recentMetrics
    .filter(m => m.metric === 'req_rate')
    .slice(0, 20)
    .reverse()
    .map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString(),
      value: m.value
    }));

  // SLA compliance summary
  const activeSLAs = slas.filter(s => s.status === 'active' || s.status === 'breached' || s.status === 'at_risk').length;
  const breachedSLAs = slas.filter(s => s.status === 'breached').length;
  const atRiskSLAs = slas.filter(s => s.status === 'at_risk').length;
  const slaCompliancePercentage = activeSLAs > 0 ? ((activeSLAs - breachedSLAs) / activeSLAs) * 100 : 100;


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-[#f4d35e]" />
              Launch <span className="text-[#f4d35e]">Control</span> Center
            </h1>
            <p className="text-white/70 mt-1">Real-time platform observability & monitoring</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to={createPageUrl("OpsTraffic")}>
              <Button variant="outline" className="border-[#f4d35e]/30 text-[#f4d35e] hover:bg-[#f4d35e]/10">
                <Globe className="w-4 h-4 mr-2" />
                Traffic
              </Button>
            </Link>
            <Button
              onClick={handleScheduleReport}
              variant="outline"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
            <Link to={createPageUrl("OpsIncidents")}>
              <Button variant="outline" className="border-[#f4d35e]/30 text-[#f4d35e] hover:bg-[#f4d35e]/10">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Incidents
              </Button>
            </Link>
            <Link to={createPageUrl("OpsDeploys")}>
              <Button variant="outline" className="border-[#f4d35e]/30 text-[#f4d35e] hover:bg-[#f4d35e]/10">
                <Database className="w-4 h-4 mr-2" />
                Deploys
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* SLA Compliance Alert */}
      {breachedSLAs > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div className="flex-1">
              <h3 className="text-white font-semibold">SLA Breach Alert</h3>
              <p className="text-white/70 text-sm">
                {breachedSLAs} SLA{breachedSLAs > 1 ? 's are' : ' is'} currently breached. Immediate action required.
              </p>
            </div>
            <Link to={createPageUrl("OpsObservability") + "?tab=sla"}>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                View Details
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Global Health Ring and SLA Status */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <Card className="bg-white/5 border-[#f4d35e]/20 lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#f4d35e20"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={slaCompliancePercentage >= 95 ? '#10b981' : slaCompliancePercentage >= 80 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${(slaCompliancePercentage / 100) * 351.86} 351.86`}
                    transform="rotate(-90 64 64)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-3xl font-bold text-white">{slaCompliancePercentage.toFixed(1)}%</div>
                    <div className="text-xs text-white/60">SLA</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Compliant</span>
                  <span className="text-green-400 font-semibold">{activeSLAs - breachedSLAs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">At Risk</span>
                  <span className="text-yellow-400 font-semibold">{atRiskSLAs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Breached</span>
                  <span className="text-red-400 font-semibold">{breachedSLAs}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SLA Compliance Card (was health ring originally) */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">SLA Compliance</p>
                <p className={`text-3xl font-bold ${
                  breachedSLAs === 0 ? 'text-green-400' : 
                  breachedSLAs <= atRiskSLAs ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {activeSLAs - breachedSLAs}/{activeSLAs}
                </p>
              </div>
              <Shield className={`w-8 h-8 ${
                breachedSLAs === 0 ? 'text-green-400' : 'text-red-400'
              }/50`} />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-white/70">
                <span>Breached</span>
                <span className="text-red-400 font-semibold">{breachedSLAs}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>At Risk</span>
                <span className="text-yellow-400 font-semibold">{atRiskSLAs}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Error Rate</p>
                <p className={`text-3xl font-bold ${avgErrorRate > 3 ? 'text-red-400' : 'text-green-400'}`}>
                  {avgErrorRate.toFixed(2)}%
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${avgErrorRate > 3 ? 'text-red-400' : 'text-green-400'}/50`} />
            </div>
            <div className="text-xs text-white/50">
              {avgErrorRate > 3 ? 'Above threshold' : 'Within SLO'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Latency P95</p>
                <p className="text-3xl font-bold text-[#3cf7d4]">{avgLatency.toFixed(0)}ms</p>
              </div>
              <Clock className="w-8 h-8 text-[#3cf7d4]/50" />
            </div>
            <div className="text-xs text-white/50">
              {avgLatency < 500 ? 'Within SLO' : 'Above target'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">Active Incidents</p>
                <p className={`text-3xl font-bold ${incidents.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {incidents.length}
                </p>
              </div>
              {incidents.length > 0 ? (
                <XCircle className="w-8 h-8 text-red-400/50" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-400/50" />
              )}
            </div>
            <div className="text-xs text-white/50">
              {incidents.length > 0 ? 'Requires attention' : 'All clear'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Rate Chart */}
      {metricsChartData.length > 0 && (
        <Card className="bg-white/5 border-[#f4d35e]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Request Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metricsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                <XAxis dataKey="time" tick={{ fill: '#fff', fontSize: 12 }} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="value" stroke="#f4d35e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* SLA Status Table */}
      {slas.length > 0 && (
        <Card className="bg-white/5 border-[#f4d35e]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#f4d35e]" />
              Service Level Agreements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slas.map((sla) => {
                const statusConfig = {
                  active: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
                  breached: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
                  at_risk: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
                  expired: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' }
                }[sla.status];

                const recentBreaches = (sla.breaches || []).slice(-3);

                return (
                  <div
                    key={sla.id}
                    className={`p-4 rounded-lg border ${statusConfig.border} ${statusConfig.bg}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold">{sla.name}</h4>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 text-xs`}>
                            {sla.status}
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm">{sla.description}</p>
                        {sla.customer_name && (
                          <p className="text-white/50 text-xs mt-1">Customer: {sla.customer_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Current Compliance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {sla.availability_target && sla.current_compliance?.availability && (
                        <div className="text-center p-2 bg-white/5 rounded">
                          <p className="text-xs text-white/60">Availability</p>
                          <p className={`text-lg font-bold ${
                            sla.current_compliance.availability >= sla.availability_target 
                              ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {sla.current_compliance.availability.toFixed(2)}%
                          </p>
                          <p className="text-xs text-white/50">Target: {sla.availability_target}%</p>
                        </div>
                      )}

                      {sla.latency_target_ms && sla.current_compliance?.latency_p95 && (
                        <div className="text-center p-2 bg-white/5 rounded">
                          <p className="text-xs text-white/60">Latency P95</p>
                          <p className={`text-lg font-bold ${
                            sla.current_compliance.latency_p95 <= sla.latency_target_ms 
                              ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {sla.current_compliance.latency_p95.toFixed(0)}ms
                          </p>
                          <p className="text-xs text-white/50">Target: {sla.latency_target_ms}ms</p>
                        </div>
                      )}

                      {sla.error_rate_target && sla.current_compliance?.error_rate && (
                        <div className="text-center p-2 bg-white/5 rounded">
                          <p className="text-xs text-white/60">Error Rate</p>
                          <p className={`text-lg font-bold ${
                            sla.current_compliance.error_rate <= sla.error_rate_target 
                              ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {sla.current_compliance.error_rate.toFixed(2)}%
                          </p>
                          <p className="text-xs text-white/50">Target: ≤{sla.error_rate_target}%</p>
                        </div>
                      )}

                      {sla.mttr_target_minutes && sla.current_compliance?.mttr && (
                        <div className="text-center p-2 bg-white/5 rounded">
                          <p className="text-xs text-white/60">MTTR</p>
                          <p className={`text-lg font-bold ${
                            sla.current_compliance.mttr <= sla.mttr_target_minutes 
                              ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {sla.current_compliance.mttr.toFixed(0)}min
                          </p>
                          <p className="text-xs text-white/50">Target: ≤{sla.mttr_target_minutes}min</p>
                        </div>
                      )}
                    </div>

                    {/* Recent Breaches */}
                    {recentBreaches.length > 0 && (
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-white/60 text-xs mb-2">Recent Breaches:</p>
                        <div className="space-y-1">
                          {recentBreaches.map((breach, idx) => (
                            <div key={idx} className="text-xs text-red-400">
                              • {breach.breach_type}: {breach.impact}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services & Incidents Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {services.length === 0 ? (
                <p className="text-white/60 text-center py-8">No services configured</p>
              ) : (
                services.map((service) => {
                  const colors = statusColors[service.health_status] || statusColors.unknown;
                  return (
                    <div key={service.id} className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{service.name}</p>
                          <p className="text-xs text-white/60">{service.tier} tier</p>
                        </div>
                        <Badge className={`${colors.bg} ${colors.text} border-0`}>
                          {service.health_status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Active Incidents</span>
              <Badge className={incidents.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                {incidents.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {incidents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-white/60">No active incidents</p>
                  <p className="text-white/40 text-xs mt-1">All systems operational</p>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div key={incident.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 hover:border-red-500/50 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-semibold ${severityColors[incident.severity]}`}>
                            {incident.severity?.toUpperCase()}
                          </p>
                          <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                            {incident.status}
                          </Badge>
                        </div>
                        <p className="text-white font-medium text-sm">{incident.title}</p>
                        <p className="text-xs text-white/60 mt-1">{incident.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                      <div className="text-xs text-white/50">
                        Opened {incident.opened_at && new Date(incident.opened_at).toLocaleString()}
                      </div>
                      {incident.impacted_customers > 0 && (
                        <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                          {incident.impacted_customers} affected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Forecasts */}
      {capacityForecasts.length > 0 && (
        <Card className="bg-white/5 border-[#f4d35e]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#3cf7d4]" />
              Capacity Forecast (30-day outlook)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {capacityForecasts.map((forecast) => {
                const headroomColor = forecast.headroom_pct > 30 
                  ? 'text-green-400' 
                  : forecast.headroom_pct > 15 
                  ? 'text-yellow-400' 
                  : 'text-red-400';

                return (
                  <div key={forecast.id} className="p-4 rounded-lg bg-white/5 border border-[#f4d35e]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80 text-sm uppercase">{forecast.metric.replace(/_/g, ' ')}</span>
                      <Badge className={`${
                        forecast.recommendation === 'no_action' ? 'bg-green-500/20 text-green-400' :
                        forecast.recommendation === 'optimize' ? 'bg-blue-500/20 text-blue-400' :
                        forecast.recommendation === 'scale_up' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      } text-xs`}>
                        {forecast.recommendation.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <span className={`text-2xl font-bold ${headroomColor}`}>
                        {forecast.headroom_pct.toFixed(0)}%
                      </span>
                      <span className="text-white/60 text-sm ml-1">headroom</span>
                    </div>
                    <p className="text-xs text-white/50">
                      Peak: {forecast.projected_usage.toFixed(1)} / Capacity: {forecast.current_capacity}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#f4d35e]" />
              Recent Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400 font-semibold text-sm">{anomaly.signal}</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">
                      Score: {anomaly.score}
                    </Badge>
                  </div>
                  {anomaly.rca && (
                    <div className="text-xs text-white/60 space-y-1">
                      {anomaly.rca.recent_deploy && <p>• Recent deployment detected</p>}
                      {anomaly.rca.suspect_deps?.length > 0 && (
                        <p>• Suspect dependencies: {anomaly.rca.suspect_deps.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
