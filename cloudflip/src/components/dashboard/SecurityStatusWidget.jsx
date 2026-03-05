import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityStatusWidget({ refreshInterval = 10000 }) {
  const { data: securityStatus, isLoading } = useQuery({
    queryKey: ['security-status'],
    queryFn: async () => {
      const [logs, mfaAttempts] = await Promise.all([
        api.entities.SecurityLog.list('-created_date', 50),
        api.entities.MFAAttempt.list('-created_date', 20)
      ]);

      const criticalAlerts = logs.filter(log => log.severity === 'critical').length;
      const failedMFA = mfaAttempts.filter(a => a.status === 'failed').length;
      const recentThreats = logs.filter(log => 
        log.event_type === 'suspicious_activity' || 
        log.event_type === 'unauthorized_access'
      ).length;

      const score = Math.max(0, 100 - (criticalAlerts * 10) - (failedMFA * 5) - (recentThreats * 8));

      return {
        score,
        criticalAlerts,
        failedMFA,
        recentThreats,
        status: score > 80 ? 'healthy' : score > 60 ? 'warning' : 'critical'
      };
    },
    refetchInterval: refreshInterval
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-amber-500/20">
        <CardContent className="p-6">
          <div className="text-white/60">Loading security status...</div>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    healthy: { bg: 'from-green-500/20 to-green-600/20', border: 'border-green-500/30', text: 'text-green-400' },
    warning: { bg: 'from-yellow-500/20 to-yellow-600/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    critical: { bg: 'from-red-500/20 to-red-600/20', border: 'border-red-500/30', text: 'text-red-400' }
  };

  const colors = statusColors[securityStatus?.status || 'warning'];

  return (
    <Card className={`bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className={`w-5 h-5 ${colors.text}`} />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-4xl font-bold ${colors.text}`}>
              {securityStatus?.score}
            </p>
            <p className="text-xs text-white/60">Security Score</p>
          </div>
          <div className="p-4 rounded-full bg-white/10">
            <Shield className={`w-8 h-8 ${colors.text}`} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg bg-white/5 text-center"
          >
            <p className="text-lg font-bold text-white">{securityStatus?.criticalAlerts}</p>
            <p className="text-xs text-white/60">Critical</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-3 rounded-lg bg-white/5 text-center"
          >
            <p className="text-lg font-bold text-white">{securityStatus?.failedMFA}</p>
            <p className="text-xs text-white/60">Failed MFA</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-3 rounded-lg bg-white/5 text-center"
          >
            <p className="text-lg font-bold text-white">{securityStatus?.recentThreats}</p>
            <p className="text-xs text-white/60">Threats</p>
          </motion.div>
        </div>

        <Badge className={`w-full justify-center ${colors.bg} ${colors.text} border-0`}>
          {securityStatus?.status.toUpperCase()}
        </Badge>
      </CardContent>
    </Card>
  );
}