
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Globe,
  Activity,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#f4d35e', '#3cf7d4', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function OpsTraffic() {
  const [user, setUser] = useState(null);
  const [includeDemoData, setIncludeDemoData] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: telemetryEvents = [] } = useQuery({
    queryKey: ['traffic-telemetry', includeDemoData],
    queryFn: () => api.entities.TelemetryEvent.filter({
      org_id: user.current_org_id,
      ...(includeDemoData ? {} : { demo: false })
    }, '-timestamp', 1000),
    enabled: !!user
  });

  // UTM Attribution
  const utmData = Object.entries(
    telemetryEvents.reduce((acc, e) => {
      if (e.utm?.source) {
        const key = `${e.utm.source}/${e.utm.medium || 'none'}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).slice(0, 8);

  // Referrers
  const referrerData = Object.entries(
    telemetryEvents.reduce((acc, e) => {
      if (e.referrer) {
        try {
          const url = new URL(e.referrer);
          const domain = url.hostname;
          acc[domain] = (acc[domain] || 0) + 1;
        } catch {
          acc['direct'] = (acc['direct'] || 0) + 1;
        }
      } else {
        acc['direct'] = (acc['direct'] || 0) + 1;
      }
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Device Mix
  const deviceData = Object.entries(
    telemetryEvents.reduce((acc, e) => {
      const device = e.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Top Pages
  const pageData = Object.entries(
    telemetryEvents.reduce((acc, e) => {
      if (e.url) {
        try {
          const url = new URL(e.url);
          const path = url.pathname;
          acc[path] = (acc[path] || 0) + 1;
        } catch {
          acc[e.url] = (acc[e.url] || 0) + 1;
        }
      }
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const totalSessions = new Set(telemetryEvents.map(e => e.session_id)).size;
  const uniqueUsers = new Set(telemetryEvents.map(e => e.user_id).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link to={createPageUrl("LaunchControlCenter")}>
          <button className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Launch Control
          </button>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Globe className="w-8 h-8 text-[#f4d35e]" />
              Traffic <span className="text-[#f4d35e]">Analytics</span>
            </h1>
            <p className="text-white/70 mt-1">UTM attribution, referrers, geo & device analytics</p>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-[#f4d35e]/20">
              <Label className="text-white text-sm">Include Demo Data</Label>
              <Switch
                checked={includeDemoData}
                onCheckedChange={setIncludeDemoData}
                className="data-[state=checked]:bg-[#f4d35e]"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-white">{telemetryEvents.length.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-[#f4d35e]/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Sessions</p>
                <p className="text-2xl font-bold text-[#3cf7d4]">{totalSessions.toLocaleString()}</p>
              </div>
              <Globe className="w-8 h-8 text-[#3cf7d4]/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Unique Users</p>
                <p className="text-2xl font-bold text-white">{uniqueUsers.toLocaleString()}</p>
              </div>
              <Sparkles className="w-8 h-8 text-white/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Top Source</p>
                <p className="text-2xl font-bold text-[#f4d35e]">
                  {utmData[0]?.name.split('/')[0] || 'N/A'}
                </p>
              </div>
              <ExternalLink className="w-8 h-8 text-[#f4d35e]/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* UTM Attribution */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">UTM Attribution</CardTitle>
          </CardHeader>
          <CardContent>
            {utmData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={utmData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split('/')[0]} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {utmData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-white/60 text-center py-12">No UTM data available</p>
            )}
          </CardContent>
        </Card>

        {/* Device Mix */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Device Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceData.length > 0 ? (
              <div className="space-y-4">
                {deviceData.map((device, index) => {
                  const total = deviceData.reduce((sum, d) => sum + d.value, 0);
                  const percentage = (device.value / total) * 100;
                  const Icon = device.name === 'desktop' ? Monitor : 
                               device.name === 'mobile' ? Smartphone : 
                               device.name === 'tablet' ? Tablet : Activity;
                  
                  return (
                    <div key={device.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#f4d35e]" />
                          <span className="text-white capitalize">{device.name}</span>
                        </div>
                        <span className="text-white/60 text-sm">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-[#f4d35e] to-[#f4d35e]/80 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/60 text-center py-12">No device data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referrers & Pages */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {referrerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={referrerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#fff', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#fff' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#f4d35e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-white/60 text-center py-12">No referrer data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pageData.length > 0 ? (
                pageData.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white text-sm truncate flex-1">{page.name}</span>
                    <Badge className="bg-[#f4d35e]/20 text-[#f4d35e] border-0 ml-2">
                      {page.value}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-center py-12">No page data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
