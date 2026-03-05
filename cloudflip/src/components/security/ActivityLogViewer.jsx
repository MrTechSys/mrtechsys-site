import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Key, 
  Mail, 
  Smartphone, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const actionIcons = {
  mfa_enabled: Shield,
  mfa_disabled: Shield,
  backup_codes_generated: Key,
  backup_code_used: Key,
  trusted_device_added: Smartphone,
  trusted_device_removed: Smartphone,
  recovery_email_updated: Mail,
  password_changed: Key,
  login_success: CheckCircle,
  login_failed: XCircle,
  security_settings_updated: Shield
};

const actionColors = {
  mfa_enabled: "bg-green-500/20 text-green-400",
  mfa_disabled: "bg-red-500/20 text-red-400",
  backup_codes_generated: "bg-blue-500/20 text-blue-400",
  backup_code_used: "bg-purple-500/20 text-purple-400",
  trusted_device_added: "bg-cyan-500/20 text-cyan-400",
  trusted_device_removed: "bg-orange-500/20 text-orange-400",
  recovery_email_updated: "bg-purple-500/20 text-purple-400",
  password_changed: "bg-yellow-500/20 text-yellow-400",
  login_success: "bg-green-500/20 text-green-400",
  login_failed: "bg-red-500/20 text-red-400",
  security_settings_updated: "bg-blue-500/20 text-blue-400"
};

export default function ActivityLogViewer({ activities = [] }) {
  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white">Security Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-2 pr-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 text-sm">No activity yet</p>
              </div>
            ) : (
              activities.map((activity, idx) => {
                const Icon = actionIcons[activity.action_type] || Shield;
                const colorClass = actionColors[activity.action_type] || "bg-gray-500/20 text-gray-400";
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-3 bg-white/5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">
                            {activity.action_type.split('_').map(w => 
                              w.charAt(0).toUpperCase() + w.slice(1)
                            ).join(' ')}
                          </p>
                          <p className="text-white/60 text-xs mt-1">
                            {activity.created_date && format(new Date(activity.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                          {activity.ip_address && (
                            <p className="text-white/40 text-xs mt-1">
                              IP: {activity.ip_address}
                            </p>
                          )}
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <p className="text-white/50 text-xs mt-1">
                              {JSON.stringify(activity.details, null, 2).slice(0, 100)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {activity.success !== undefined && (
                          <Badge className={activity.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                            {activity.success ? 'Success' : 'Failed'}
                          </Badge>
                        )}
                        {activity.risk_score !== undefined && activity.risk_score > 50 && (
                          <Badge className="bg-red-500/20 text-red-400">
                            Risk: {activity.risk_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}