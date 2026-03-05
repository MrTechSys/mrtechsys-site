import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Activity,
  Zap
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#f4d35e', '#3cf7d4', '#3b82f6', '#10b981', '#ef4444', '#a855f7'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a1929] border border-amber-500/50 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: <span className="font-bold">{typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LeadAnalyticsDashboard({ leads }) {
  if (!leads || leads.length === 0) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 p-12 text-center">
        <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">No lead data available yet</p>
        <p className="text-white/40 text-sm mt-2">Start by importing or creating leads</p>
      </Card>
    );
  }

  // Calculate analytics
  const statusDistribution = Object.entries(
    leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value 
  }));

  const sourceDistribution = Object.entries(
    leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value 
  }));

  const scoreDistribution = leads.reduce((acc, l) => {
    const score = l.score || 0;
    if (score >= 75) acc.high++;
    else if (score >= 50) acc.medium++;
    else acc.low++;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  const scoreData = [
    { name: 'High (75+)', value: scoreDistribution.high, fill: '#10b981' },
    { name: 'Medium (50-74)', value: scoreDistribution.medium, fill: '#f59e0b' },
    { name: 'Low (<50)', value: scoreDistribution.low, fill: '#ef4444' }
  ];

  // Lead creation trend (last 30 days)
  const trendData = leads
    .filter(l => {
      const daysSince = (Date.now() - new Date(l.created_date)) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    })
    .reduce((acc, l) => {
      const day = new Date(l.created_date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

  const trendChartData = Object.entries(trendData).map(([day, count]) => ({ day, count })).slice(-14);

  const avgScore = leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.expected_value || 0), 0);
  const conversionRate = (leads.filter(l => l.status === 'won').length / leads.length) * 100;

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Lead Intelligence Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-white/5 rounded-lg border border-cyan-500/20">
            <p className="text-white/60 text-xs mb-1">Avg AI Score</p>
            <p className="text-2xl font-bold text-cyan-400">{avgScore.toFixed(0)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-purple-500/20">
            <p className="text-white/60 text-xs mb-1">Pipeline Value</p>
            <p className="text-2xl font-bold text-purple-400">${Math.round(totalValue).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-green-500/20">
            <p className="text-white/60 text-xs mb-1">Conversion</p>
            <p className="text-2xl font-bold text-green-400">{conversionRate.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
            <p className="text-white/60 text-xs mb-1">Hot Leads</p>
            <p className="text-2xl font-bold text-amber-400">{scoreDistribution.high}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-3">Lead Quality Score</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={70}
                  dataKey="value"
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Lead Sources</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sourceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#fff', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3cf7d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {trendChartData.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-3">Lead Creation Trend (Last 14 Days)</h4>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="day" tick={{ fill: '#fff', fontSize: 11 }} />
                <YAxis tick={{ fill: '#fff', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#f4d35e" strokeWidth={2} name="Leads Created" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}