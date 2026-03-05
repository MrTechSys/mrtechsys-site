import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const severityColors = {
  critical: "bg-red-100 text-red-800 border-red-500",
  high: "bg-orange-100 text-orange-800 border-orange-500",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-500",
  low: "bg-blue-100 text-blue-800 border-blue-500",
  info: "bg-gray-100 text-gray-800 border-gray-500"
};

export default function PatchBoard() {
  const [scanning, setScanning] = useState(false);
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.entities.Service.list(),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: () => api.entities.SecurityAlert.filter({ 
      alert_type: 'policy_violation',
      status: 'active' 
    }),
  });

  const scanForPatchesMutation = useMutation({
    mutationFn: async () => {
      setScanning(true);
      // Call backend function to scan for outdated dependencies
      const response = await api.functions.invoke('sreAutomationEngine', {
        action: 'scan_patches',
        services: services.map(s => s.service_id)
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      toast.success(`Scan complete: ${data.patches_found || 0} patches found`);
      setScanning(false);
    },
    onError: (error) => {
      toast.error(`Scan failed: ${error.message}`);
      setScanning(false);
    }
  });

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const highAlerts = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-orange-400" />
            Patch <span className="text-amber-400">Board</span>
          </h1>
          <p className="text-white/70 mt-1">Security updates and vulnerability management</p>
        </div>
        <Button
          onClick={() => scanForPatchesMutation.mutate()}
          disabled={scanning}
          className="bg-gradient-to-r from-orange-600 to-orange-500"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Scan Now'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Critical</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{criticalAlerts}</p>
            <p className="text-white/60 text-xs mt-1">Immediate action</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-400">High</Badge>
            </div>
            <p className="text-3xl font-bold text-orange-400">{highAlerts}</p>
            <p className="text-white/60 text-xs mt-1">Priority patches</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Pending</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">{alerts.length}</p>
            <p className="text-white/60 text-xs mt-1">Total alerts</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Updated</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {services.filter(s => s.health_status === 'healthy').length}
            </p>
            <p className="text-white/60 text-xs mt-1">Services</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Security Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">All Patched!</h3>
              <p className="text-white/60">No security vulnerabilities detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-white/5 rounded-lg border border-amber-500/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={severityColors[alert.severity]}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="text-white/60">
                          {alert.alert_type?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <h3 className="text-white font-bold mb-1">{alert.title}</h3>
                      <p className="text-white/70 text-sm mb-2">{alert.description}</p>
                      
                      {alert.suggested_actions?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-white/50 text-xs mb-1">Suggested Actions:</p>
                          <ul className="space-y-1">
                            {alert.suggested_actions.map((action, idx) => (
                              <li key={idx} className="text-white/70 text-xs flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                {action.action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    <p className="text-white/50 text-xs">
                      Detected {alert.detected_at && format(new Date(alert.detected_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}