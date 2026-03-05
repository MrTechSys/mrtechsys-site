import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Users, DollarSign, Target, BarChart, PieChart } from "lucide-react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function CRMAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: contacts = [] } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: () => api.entities.Contact.list('-created_date'),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['crm-deals'],
    queryFn: () => api.entities.Deal.list('-created_date'),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['crm-tickets'],
    queryFn: () => api.entities.Ticket.list('-created_date'),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['crm-activities'],
    queryFn: () => api.entities.CRMActivity.list('-created_date', 100),
  });

  // Calculate metrics
  const totalContacts = contacts.length;
  const totalDeals = deals.reduce((sum, d) => sum + d.value, 0);
  const avgDealSize = deals.length > 0 ? totalDeals / deals.length : 0;
  const conversionRate = contacts.length > 0 
    ? ((deals.filter(d => d.pipeline_stage === 'closed_won').length / contacts.length) * 100).toFixed(1)
    : 0;

  // Lifecycle stage distribution
  const lifecycleData = Object.entries(
    contacts.reduce((acc, contact) => {
      const stage = contact.lifecycle_stage || 'subscriber';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ 
    name: name.replace(/_/g, ' '), 
    value 
  }));

  // Deal pipeline stages
  const pipelineData = Object.entries(
    deals.reduce((acc, deal) => {
      acc[deal.pipeline_stage] = (acc[deal.pipeline_stage] || 0) + deal.value;
      return acc;
    }, {})
  ).map(([name, value]) => ({ 
    name: name.replace(/_/g, ' '), 
    value 
  }));

  // Monthly growth trend
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString('default', { month: 'short' });
    
    const monthContacts = contacts.filter(c => {
      const created = new Date(c.created_date);
      return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
    }).length;
    
    const monthDeals = deals.filter(d => {
      const created = new Date(d.created_date);
      return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
    }).reduce((sum, d) => sum + d.value, 0);
    
    return {
      month,
      contacts: monthContacts,
      revenue: monthDeals
    };
  });

  // Activity breakdown
  const activityData = Object.entries(
    activities.reduce((acc, act) => {
      acc[act.action_type] = (acc[act.action_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ 
    name: name.replace(/_/g, ' '), 
    value 
  })).slice(0, 5);

  // Win rate by source
  const sourceData = contacts.reduce((acc, contact) => {
    const source = contact.lead_source || 'unknown';
    if (!acc[source]) {
      acc[source] = { total: 0, won: 0 };
    }
    acc[source].total++;
    if (contact.lifecycle_stage === 'customer' || contact.lifecycle_stage === 'evangelist') {
      acc[source].won++;
    }
    return acc;
  }, {});

  const winRateData = Object.entries(sourceData).map(([name, data]) => ({
    name,
    rate: data.total > 0 ? ((data.won / data.total) * 100).toFixed(1) : 0
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">CRM <span className="text-amber-400">Analytics</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Track your <span className="text-amber-400">pipeline performance</span></p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 bg-[#0a1929]/60 border-amber-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Total Contacts</div>
              <div className="text-2xl font-bold text-white">{totalContacts}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Pipeline Value</div>
              <div className="text-2xl font-bold text-amber-400">${(totalDeals / 1000).toFixed(0)}k</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Avg Deal Size</div>
              <div className="text-2xl font-bold text-purple-400">${(avgDealSize / 1000).toFixed(1)}k</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Win Rate</div>
              <div className="text-2xl font-bold text-green-400">{conversionRate}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Growth <span className="text-amber-400">Trend</span></CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b20" />
                <XAxis dataKey="month" tick={{ fill: '#fff', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: '#fff' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="contacts" stroke="#3b82f6" name="Contacts" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#f59e0b" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Pipeline by <span className="text-amber-400">Stage</span></CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b20" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#fff', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b50' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="value" fill="#f59e0b" />
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Lifecycle <span className="text-amber-400">Distribution</span></CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={lifecycleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {lifecycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b50' }}
                  labelStyle={{ color: '#fff' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Win Rate by <span className="text-amber-400">Source</span></CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart data={winRateData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b20" />
                <XAxis type="number" tick={{ fill: '#fff' }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#fff', fontSize: 12 }} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b50' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="rate" fill="#10b981" />
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Top <span className="text-amber-400">Activities</span></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityData.map((activity, index) => {
              const total = activityData.reduce((sum, a) => sum + a.value, 0);
              const percentage = (activity.value / total) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white capitalize">{activity.name}</span>
                    <span className="text-white/60">{activity.value} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}