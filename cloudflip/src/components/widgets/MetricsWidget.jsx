import React from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";

export default function MetricsWidget({ config = {} }) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const [quotes, jobs, clients, invoices] = await Promise.all([
        api.entities.Quote.list(),
        api.entities.Job.list(),
        api.entities.Client.list(),
        api.entities.Invoice.list()
      ]);

      const thisMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

      const thisMonthRevenue = (invoices || [])
        .filter(i => i.created_date?.startsWith(thisMonth) && i.status === 'paid')
        .reduce((sum, i) => sum + (i.total || 0), 0);

      const lastMonthRevenue = (invoices || [])
        .filter(i => i.created_date?.startsWith(lastMonth) && i.status === 'paid')
        .reduce((sum, i) => sum + (i.total || 0), 0);

      const revenueChange = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      return {
        totalRevenue: thisMonthRevenue,
        revenueChange,
        totalClients: (clients || []).length,
        activeQuotes: (quotes || []).filter(q => q.status === 'sent' || q.status === 'viewed').length,
        jobsThisWeek: (jobs || []).filter(j => {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return new Date(j.created_date) > weekAgo;
        }).length
      };
    },
    refetchInterval: 60000
  });

  if (isLoading) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Business Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </CardContent>
      </>
    );
  }

  const safeMetrics = metrics || {};
  const isPositiveChange = (safeMetrics.revenueChange || 0) >= 0;

  return (
    <>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Business Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
            <DollarSign className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white mb-1">
              ${(safeMetrics.totalRevenue || 0).toLocaleString()}
            </p>
            <p className="text-white/60 text-xs mb-1">Revenue (MTD)</p>
            <div className="flex items-center gap-1">
              {isPositiveChange ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-xs font-medium ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(safeMetrics.revenueChange || 0).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white mb-1">{safeMetrics.totalClients || 0}</p>
            <p className="text-white/60 text-xs">Total Clients</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <FileText className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white mb-1">{safeMetrics.activeQuotes || 0}</p>
            <p className="text-white/60 text-xs">Active Quotes</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
            <BarChart3 className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white mb-1">{safeMetrics.jobsThisWeek || 0}</p>
            <p className="text-white/60 text-xs">Jobs This Week</p>
          </div>
        </div>
      </CardContent>
    </>
  );
}