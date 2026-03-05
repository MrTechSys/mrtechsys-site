import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  Lock,
  Eye,
  Key
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SecurityDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: mfaSettings } = useQuery({
    queryKey: ['mfa-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const settings = await api.entities.MFASettings.filter({ user_id: user.id });
      return settings.length > 0 ? settings[0] : null;
    },
    enabled: !!user?.id
  });

  const { data: securityAlerts = [] } = useQuery({
    queryKey: ['security-alerts-recent'],
    queryFn: () => api.entities.SecurityAlert.filter({ 
      status: 'active',
      severity: { $in: ['critical', 'high'] }
    }),
  });

  const { data: rateLimitViolations = [] } = useQuery({
    queryKey: ['rate-limit-violations'],
    queryFn: () => api.entities.RateLimitLog.filter({ 
      limit_exceeded: true 
    }),
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs-recent'],
    queryFn: () => api.entities.AuditLog.list('-created_date', 10),
  });

  const isMFAEnabled = mfaSettings?.mfa_enabled;
  const criticalAlerts = securityAlerts.filter(a => a.severity === 'critical').length;
  const totalViolations = rateLimitViolations.reduce((sum, log) => sum + (log.blocked_requests || 0), 0);

  return (
    <div className="space-y-6">
      {/* MFA Status */}
      <Card className={`bg-gradient-to-br ${
        isMFAEnabled 
          ? 'from-green-500/10 to-emerald-500/10 border-green-500/30' 
          : 'from-red-500/10 to-orange-500/10 border-red-500/30'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`w-8 h-8 ${isMFAEnabled ? 'text-green-400' : 'text-red-400'}`} />
              <div>
                <h3 className="text-white font-bold">Multi-Factor Authentication</h3>
                <p className="text-white/60 text-sm">
                  {isMFAEnabled ? 'Your account is secured with MFA' : 'MFA is not enabled'}
                </p>
              </div>
            </div>
            <Link to={createPageUrl("MFASettings")}>
              <Button size="sm" variant={isMFAEnabled ? "outline" : "default"}
                className={isMFAEnabled ? "border-green-500/30 text-green-400" : ""}>
                {isMFAEnabled ? 'Manage' : 'Enable MFA'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Security Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Active</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{criticalAlerts}</p>
            <p className="text-white/60 text-xs mt-1">Critical alerts</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Lock className="w-5 h-5 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-400">Blocked</Badge>
            </div>
            <p className="text-3xl font-bold text-orange-400">{totalViolations}</p>
            <p className="text-white/60 text-xs mt-1">Rate limit blocks</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Tracked</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">{auditLogs.length}</p>
            <p className="text-white/60 text-xs mt-1">Recent actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white text-sm">Recent Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2 bg-white/5 rounded border border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">
                    {log.actor_name || 'System'} • {log.action} • {log.entity}
                  </span>
                  <span className="text-white/50">
                    {log.created_date && format(new Date(log.created_date), 'h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}