import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Globe, 
  Smartphone,
  CheckCircle,
  XCircle
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell 
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = {
  success: '#10b981',
  failed: '#ef4444',
  totp: '#3b82f6',
  backup_code: '#f59e0b',
  recovery_email: '#8b5cf6',
  security_questions: '#ec4899',
  trusted_device: '#06b6d4'
};

export default function MFAMonitoringDashboard({ attempts = [] }) {
  const analytics = useMemo(() => {
    if (!attempts || attempts.length === 0) {
      return {
        trendData: [],
        methodBreakdown: [],
        geoData: [],
        topFailingFlows: [],
        anomalies: []
      };
    }

    // Trend data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const dayAttempts = attempts.filter(a => {
        const attemptDate = startOfDay(new Date(a.created_date));
        return attemptDate.getTime() === date.getTime();
      });

      return {
        date: format(date, 'MMM d'),
        success: dayAttempts.filter(a => a.success).length,
        failed: dayAttempts.filter(a => !a.success).length
      };
    });

    // Method breakdown
    const methodCounts = attempts.reduce((acc, a) => {
      acc[a.attempt_type] = (acc[a.attempt_type] || 0) + 1;
      return acc;
    }, {});

    const methodBreakdown = Object.entries(methodCounts).map(([method, count]) => ({
      name: method.replace(/_/g, ' '),
      value: count,
      color: COLORS[method] || '#6b7280'
    }));

    // Geo data (top locations)
    const geoCounts = attempts.reduce((acc, a) => {
      if (a.geolocation?.city) {
        const location = `${a.geolocation.city}, ${a.geolocation.country}`;
        acc[location] = (acc[location] || 0) + 1;
      }
      return acc;
    }, {});

    const geoData = Object.entries(geoCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top failing flows (error patterns)
    const errorCounts = attempts
      .filter(a => !a.success && a.backend_error)
      .reduce((acc, a) => {
        acc[a.backend_error] = (acc[a.backend_error] || 0) + 1;
        return acc;
      }, {});

    const topFailingFlows = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Anomaly detection (multiple failures from same IP)
    const ipFailures = attempts
      .filter(a => !a.success)
      .reduce((acc, a) => {
        if (a.ip_address) {
          acc[a.ip_address] = (acc[a.ip_address] || 0) + 1;
        }
        return acc;
      }, {});

    const anomalies = Object.entries(ipFailures)
      .filter(([_, count]) => count >= 3)
      .map(([ip, count]) => ({ ip, count }));

    return {
      trendData: last7Days,
      methodBreakdown,
      geoData,
      topFailingFlows,
      anomalies
    };
  }, [attempts]);

  const totalAttempts = attempts.length;
  const successRate = totalAttempts > 0
    ? ((attempts.filter(a => a.success).length / totalAttempts) * 100).toFixed(1)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Total</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">{totalAttempts}</p>
            <p className="text-white/60 text-xs mt-1">Total Attempts</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Success</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">{successRate}%</p>
            <p className="text-white/60 text-xs mt-1">Success Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Anomalies</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{analytics.anomalies.length}</p>
            <p className="text-white/60 text-xs mt-1">High-risk IPs</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Methods</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">{analytics.methodBreakdown.length}</p>
            <p className="text-white/60 text-xs mt-1">MFA Methods Used</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            7-Day Verification Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(251, 146, 60, 0.1)" />
              <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.6)" />
              <YAxis stroke="rgba(255, 255, 255, 0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a1929', 
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="success" 
                stroke={COLORS.success} 
                strokeWidth={2}
                name="Successful"
              />
              <Line 
                type="monotone" 
                dataKey="failed" 
                stroke={COLORS.failed} 
                strokeWidth={2}
                name="Failed"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Method Breakdown & Geo Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              MFA Methods Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.methodBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.methodBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.methodBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a1929', 
                      border: '1px solid rgba(251, 146, 60, 0.3)',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-white/60 text-center py-12">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.geoData.length > 0 ? (
              <div className="space-y-3">
                {analytics.geoData.map((geo, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span className="text-white text-sm">{geo.location}</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                      {geo.count} attempts
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-12">No location data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anomalies & Top Failing Flows */}
      {(analytics.anomalies.length > 0 || analytics.topFailingFlows.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {analytics.anomalies.length > 0 && (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  IP Anomalies (3+ failures)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.anomalies.map((anomaly, idx) => (
                    <div key={idx} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <code className="text-red-400 text-sm font-mono">{anomaly.ip}</code>
                        <Badge className="bg-red-500/20 text-red-400">
                          {anomaly.count} failures
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.topFailingFlows.length > 0 && (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-yellow-400" />
                  Top Failing Flows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topFailingFlows.map((flow, idx) => (
                    <div key={idx} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <code className="text-yellow-400 text-xs font-mono flex-1">
                          {flow.error}
                        </code>
                        <Badge className="bg-yellow-500/20 text-yellow-400 flex-shrink-0">
                          {flow.count}x
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}