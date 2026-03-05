
import React from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X,
  ChevronRight,
  Zap,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const severityConfig = {
  critical: {
    color: 'from-red-600 to-red-500',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-400',
    icon: '🔴'
  },
  high: {
    color: 'from-orange-600 to-orange-500',
    borderColor: 'border-orange-500/50',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    icon: '🟠'
  },
  medium: {
    color: 'from-yellow-600 to-yellow-500',
    borderColor: 'border-yellow-500/50',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-400',
    icon: '🟡'
  },
  low: {
    color: 'from-blue-600 to-blue-500',
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    icon: '🔵'
  },
  info: {
    color: 'from-cyan-600 to-cyan-500',
    borderColor: 'border-cyan-500/50',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-400',
    icon: 'ℹ️'
  }
};

export default function SecurityAlertPanel({ limit = 5 }) {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['security-alerts-active'],
    queryFn: () => api.entities.SecurityAlert.filter({ status: 'active' }, '-detected_at', limit),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async ({ alertId, resolution }) => {
      return await api.entities.SecurityAlert.update(alertId, {
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolution_notes: resolution
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts-active'] });
      toast.success('Alert resolved');
    }
  });

  const markFalsePositiveMutation = useMutation({
    mutationFn: async (alertId) => {
      return await api.entities.SecurityAlert.update(alertId, {
        status: 'false_positive',
        false_positive: true,
        resolved_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts-active'] });
      toast.success('Marked as false positive');
    }
  });

  const safeAlerts = alerts || [];

  if (safeAlerts.length === 0 && !isLoading) {
    return (
      <Card className="bg-white/5 border-green-500/30">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-green-400 font-semibold">No active security alerts</p>
          <p className="text-white/60 text-sm mt-1">Your system is secure</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {safeAlerts.map((alert, idx) => {
          const config = severityConfig[alert?.severity] || severityConfig.medium;

          return (
            <motion.div
              key={alert?.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`bg-gradient-to-r ${config.color} text-white border-0`}>
                          {config.icon} {(alert?.severity || 'medium').toUpperCase()}
                        </Badge>
                        <Badge className="bg-white/10 text-white/70 border-white/20">
                          {(alert?.alert_type || 'unknown').replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <CardTitle className={`text-lg ${config.textColor}`}>
                        {alert?.title || 'Security Alert'}
                      </CardTitle>
                      <p className="text-white/70 text-sm mt-2">
                        {alert?.description || ''}
                      </p>
                    </div>
                    <Button
                      onClick={() => resolveAlertMutation.mutate({ 
                        alertId: alert?.id, 
                        resolution: 'Resolved by user' 
                      })}
                      size="sm"
                      variant="ghost"
                      className="text-white/70 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Threat Actor Info */}
                  {alert?.threat_actor && (
                    <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/60 text-xs font-semibold mb-2">Threat Source:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-white/50">IP:</span>
                          <span className="text-white ml-2 font-mono">{alert.threat_actor.ip_address || 'N/A'}</span>
                        </div>
                        {alert.threat_actor.user_id && (
                          <div>
                            <span className="text-white/50">User:</span>
                            <span className="text-white ml-2">{alert.threat_actor.user_id.slice(0, 8)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Auto Actions Taken */}
                  {alert?.auto_actions_taken && alert.auto_actions_taken.length > 0 && (
                    <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <p className="text-green-400 text-xs font-semibold mb-2 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Auto-Actions Executed:
                      </p>
                      <ul className="space-y-1">
                        {alert.auto_actions_taken.map((action, i) => (
                          <li key={i} className="text-white/70 text-xs flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {action?.action || 'Action taken'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {alert?.suggested_actions && alert.suggested_actions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white/60 text-xs font-semibold mb-2">Suggested Actions:</p>
                      <div className="space-y-2">
                        {alert.suggested_actions.slice(0, 3).map((action, i) => (
                          <div 
                            key={i} 
                            className="p-2 bg-white/5 rounded border border-white/10"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white text-xs font-semibold">
                                {i + 1}. {action?.action || 'Action'}
                              </span>
                              <Badge className={`text-xs ${
                                action?.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                action?.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                action?.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {action?.priority || 'medium'}
                              </Badge>
                            </div>
                            <p className="text-white/60 text-xs">{action?.description || ''}</p>
                            {action?.automated && (
                              <Badge className="bg-cyan-500/20 text-cyan-400 text-xs mt-2">
                                <Zap className="w-3 h-3 mr-1" />
                                Automated
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <Button
                      onClick={() => resolveAlertMutation.mutate({ 
                        alertId: alert?.id, 
                        resolution: 'Actions completed' 
                      })}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                    <Button
                      onClick={() => markFalsePositiveMutation.mutate(alert?.id)}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white/70 hover:bg-white/10"
                    >
                      False Positive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
