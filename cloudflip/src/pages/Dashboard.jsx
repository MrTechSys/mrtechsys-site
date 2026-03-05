import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  DollarSign,
  Sparkles,
  Activity,
  Target,
  Zap,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import QuickActionsWidget from "../components/widgets/QuickActionsWidget";
import RecentActivityWidget from "../components/widgets/RecentActivityWidget";
import PersonalizedRecommendations from "../components/PersonalizedRecommendations";
import AIDashboardSummary from "../components/dashboard/AIDashboardSummary";

const CHART_COLORS = ['#f4d35e', '#3cf7d4', '#3b82f6', '#10b981', '#ef4444', '#a855f7'];

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: leads = [] } = useQuery({
    queryKey: ['dashboard-leads'],
    queryFn: async () => {
      const all = await api.entities.Lead.list('-created_date', 100);
      return all.filter(l => l.org_id === user.current_org_id);
    },
    enabled: !!user
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['dashboard-quotes'],
    queryFn: async () => {
      const all = await api.entities.Quote.list('-created_date', 50);
      return all.filter(q => q.org_id === user.current_org_id);
    },
    enabled: !!user
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['dashboard-jobs'],
    queryFn: async () => {
      const all = await api.entities.Job.list('-created_date', 50);
      return all.filter(j => j.org_id === user.current_org_id);
    },
    enabled: !!user
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['dashboard-invoices'],
    queryFn: async () => {
      const all = await api.entities.Invoice.list('-created_date', 50);
      return all.filter(i => i.org_id === user.current_org_id);
    },
    enabled: !!user
  });

  // Calculate metrics
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
  const conversionRate = leads.length > 0 ? (leads.filter(l => l.status === 'won').length / leads.length) * 100 : 0;
  const avgLeadScore = leads.length > 0 ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length : 0;
  const totalPipeline = leads.reduce((sum, l) => sum + (l.expected_value || 0), 0);

  // Lead status distribution
  const leadsByStatus = Object.entries(
    leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Monthly revenue trend
  const monthlyRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, inv) => {
      const month = new Date(inv.created_date).toLocaleDateString('en', { month: 'short' });
      acc[month] = (acc[month] || 0) + (inv.total || 0);
      return acc;
    }, {});
  
  const revenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })).slice(-6);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-amber-400" />
          Business <span className="text-amber-400">Command Center</span>
        </h1>
        <p className="text-white/70 mt-2">Your AI-powered business operations dashboard</p>
      </div>

      {/* AI Summary */}
      {user?.current_org_id && <AIDashboardSummary orgId={user.current_org_id} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to={createPageUrl("Leads")}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <Badge className="bg-blue-500/20 text-blue-400">Leads</Badge>
              </div>
              <p className="text-3xl font-bold text-white">{leads.length}</p>
              <p className="text-white/60 text-sm mt-1">Total leads</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl("Quotes")}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400">Quotes</Badge>
              </div>
              <p className="text-3xl font-bold text-white">{quotes.length}</p>
              <p className="text-white/60 text-sm mt-1">Active quotes</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl("Jobs")}>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400">Jobs</Badge>
              </div>
              <p className="text-3xl font-bold text-white">{jobs.length}</p>
              <p className="text-white/60 text-sm mt-1">Scheduled</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl("Invoices")}>
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-amber-400" />
                <Badge className="bg-amber-500/20 text-amber-400">Revenue</Badge>
              </div>
              <p className="text-3xl font-bold text-white">${Math.round(totalRevenue).toLocaleString()}</p>
              <p className="text-white/60 text-sm mt-1">Total earned</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="month" stroke="#fff" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#fff" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20 text-white/60">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No revenue data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={leadsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20 text-white/60">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No lead data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Widgets Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <QuickActionsWidget />
        <RecentActivityWidget />
      </div>

      {/* Personalized Recommendations */}
      {user?.id && <PersonalizedRecommendations userId={user.id} />}
    </div>
  );
}