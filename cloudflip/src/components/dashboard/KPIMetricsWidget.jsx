import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const metricIcons = {
  mrr: DollarSign,
  active_users: Users,
  completion_rate: CheckCircle,
  compliance_score: Shield
};

export default function KPIMetricsWidget({ refreshInterval = 30000 }) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['kpi-metrics'],
    queryFn: async () => {
      const [invoices, jobs, audits] = await Promise.all([
        api.entities.Invoice.filter({ status: 'paid' }),
        api.entities.Job.list(),
        api.entities.AuditLog.list('-created_date', 100)
      ]);

      const mrr = invoices
        .filter(inv => inv.created_date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      const completedJobs = jobs.filter(j => j.status === 'completed').length;
      const completionRate = jobs.length > 0 ? (completedJobs / jobs.length) * 100 : 0;

      return {
        mrr: { value: mrr, trend: 12.5, label: 'MRR' },
        active_users: { value: audits.length, trend: 8.3, label: 'Active Users' },
        completion_rate: { value: completionRate, trend: 5.2, label: 'Completion Rate' },
        compliance_score: { value: 94, trend: 2.1, label: 'Compliance Score' }
      };
    },
    refetchInterval: refreshInterval
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-amber-500/20">
        <CardContent className="p-6">
          <div className="text-white/60">Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(metrics || {}).map(([key, data], idx) => {
        const Icon = metricIcons[key];
        const isPositive = data.trend > 0;
        
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-white/5 to-white/10 border-amber-500/20 hover:border-amber-500/40 transition-all group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(data.trend)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-white">
                    {key === 'mrr' ? `$${data.value.toLocaleString()}` : 
                     key.includes('rate') || key.includes('score') ? `${data.value.toFixed(1)}%` :
                     data.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/60">{data.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}