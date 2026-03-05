
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Download,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Reports() {
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads", user?.current_org_id],
    queryFn: () =>
      api.entities.Lead.filter({
        org_id: user?.current_org_id,
      }),
    enabled: !!user?.current_org_id,
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes", user?.current_org_id],
    queryFn: () =>
      api.entities.Quote.filter({
        org_id: user?.current_org_id,
      }),
    enabled: !!user?.current_org_id,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", user?.current_org_id],
    queryFn: () =>
      api.entities.Invoice.filter({
        org_id: user?.current_org_id,
      }),
    enabled: !!user?.current_org_id,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", user?.current_org_id],
    queryFn: () =>
      api.entities.Job.filter({
        org_id: user?.current_org_id,
      }),
    enabled: !!user?.current_org_id,
  });

  // Calculate metrics
  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const avgQuoteValue =
    quotes.length > 0
      ? quotes.reduce((sum, q) => sum + (q.total || 0), 0) / quotes.length
      : 0;

  const conversionRate =
    quotes.length > 0
      ? (quotes.filter((q) => q.status === "accepted").length / quotes.length) *
        100
      : 0;

  // Revenue by month
  const revenueByMonth = invoices
    .filter((inv) => inv.status === "paid" && inv.paid_date)
    .reduce((acc, inv) => {
      const month = new Date(inv.paid_date).toLocaleDateString("en-US", {
        month: "short",
      });
      if (!acc[month]) acc[month] = 0;
      acc[month] += inv.total || 0;
      return acc;
    }, {});

  const revenueData = Object.entries(revenueByMonth).map(([month, amount]) => ({
    month,
    amount,
  }));

  // Lead sources
  const leadsBySource = leads.reduce((acc, lead) => {
    const source = lead.source || "Unknown";
    if (!acc[source]) acc[source] = 0;
    acc[source]++;
    return acc;
  }, {});

  const leadSourceData = Object.entries(leadsBySource).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // Quote status distribution
  const quotesByStatus = quotes.reduce((acc, quote) => {
    const status = quote.status || "draft";
    if (!acc[status]) acc[status] = 0;
    acc[status]++;
    return acc;
  }, {});

  const quoteStatusData = Object.entries(quotesByStatus).map(
    ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    })
  );

  const COLORS = ["#f4d35e", "#3cf7d4", "#3b82f6", "#10b981", "#ef4444"];

  // Export function
  const handleExport = async (reportType) => {
    try {
      const { data } = await api.functions.invoke('exportReport', {
        reportType,
        format: 'csv',
        filters: {}
      });
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
      console.error(error);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Business <span className="text-amber-400">Reports</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Comprehensive analytics and <span className="text-amber-400">insights</span></p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("ScheduledReports")}>
            <Button
              variant="outline"
              className="border-[#f4d35e]/30 text-[#f4d35e] hover:bg-[#f4d35e]/10"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Reports
            </Button>
          </Link>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-amber-500/50 transition-all">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-white/70">Total Revenue</p>
                  <p className="text-xl md:text-2xl font-bold text-white mt-1">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-amber-500/50 transition-all">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-white/70">Avg Quote Value</p>
                  <p className="text-xl md:text-2xl font-bold text-white mt-1">
                    ${avgQuoteValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-amber-500/50 transition-all">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-white/70">Conversion Rate</p>
                  <p className="text-xl md:text-2xl font-bold text-white mt-1">
                    {conversionRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-amber-500/50 transition-all">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-white/70">Active Leads</p>
                  <p className="text-xl md:text-2xl font-bold text-white mt-1">
                    {leads.filter((l) => l.status === "new" || l.status === "contacted").length}
                  </p>
                </div>
                <Users className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        {revenueData.length > 0 && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#f4d35e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Lead Sources */}
        {leadSourceData.length > 0 && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Quote Status */}
        {quoteStatusData.length > 0 && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quote Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={quoteStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                  />
                  <Bar dataKey="value" fill="#3cf7d4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Export Options */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleExport('revenue')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Revenue Report
            </Button>
            <Button
              onClick={() => handleExport('leads')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Leads Report
            </Button>
            <Button
              onClick={() => handleExport('quotes')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Quotes Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
