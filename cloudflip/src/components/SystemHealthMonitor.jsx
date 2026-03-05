import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function SystemHealthMonitor({ orgId }) {
  const { data: healthStatus, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data } = await api.functions.invoke('healthCheck', {});
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!orgId
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-amber-500/20">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-white/60 text-sm mt-2">Checking system health...</p>
        </CardContent>
      </Card>
    );
  }

  const isHealthy = healthStatus?.status === 'healthy';

  return (
    <Card className={`bg-white/5 border-${isHealthy ? 'green' : 'red'}-500/20`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-400" />
            )}
            <div>
              <h3 className="text-white font-semibold">System Health</h3>
              <p className="text-white/60 text-sm">
                {healthStatus?.timestamp && new Date(healthStatus.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <Badge className={`${isHealthy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {healthStatus?.status || 'Unknown'}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-white/60 text-xs mb-1">Database</p>
            <div className={`font-semibold ${healthStatus?.checks?.database ? 'text-green-400' : 'text-red-400'}`}>
              {healthStatus?.checks?.database ? '✓ OK' : '✗ Error'}
            </div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-white/60 text-xs mb-1">Auth</p>
            <div className={`font-semibold ${healthStatus?.checks?.auth ? 'text-green-400' : 'text-red-400'}`}>
              {healthStatus?.checks?.auth ? '✓ OK' : '✗ Error'}
            </div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-white/60 text-xs mb-1">Response</p>
            <div className="font-semibold text-cyan-400">
              {healthStatus?.response_time_ms || 0}ms
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}