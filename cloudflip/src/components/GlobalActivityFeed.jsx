import React from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Mail, 
  FileText, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash,
  Plus,
  Shield,
  Database,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const moduleColors = {
  lead: "bg-blue-500/20 text-blue-400",
  contact: "bg-purple-500/20 text-purple-400",
  deal: "bg-green-500/20 text-green-400",
  quote: "bg-amber-500/20 text-amber-400",
  invoice: "bg-emerald-500/20 text-emerald-400",
  job: "bg-orange-500/20 text-orange-400",
  task: "bg-cyan-500/20 text-cyan-400",
  ticket: "bg-pink-500/20 text-pink-400",
  security_alert: "bg-red-500/20 text-red-400",
  incident: "bg-red-600/20 text-red-300",
  deployment: "bg-indigo-500/20 text-indigo-400"
};

const actionIcons = {
  created: Plus,
  updated: Edit,
  deleted: Trash,
  emailed: Mail,
  viewed: Users,
  converted: Target,
  commented: FileText,
  assigned: CheckCircle,
  escalated: AlertTriangle,
  deployed: Database,
  blocked: Shield
};

export default function GlobalActivityFeed({ limit = 20, modules = [] }) {
  const { data: activities = [] } = useQuery({
    queryKey: ['global-activity-feed', limit, modules],
    queryFn: async () => {
      const user = await api.auth.me();
      
      const filter = { org_id: user.current_org_id };
      if (modules.length > 0) {
        filter.entity_type = { $in: modules };
      }
      
      return api.entities.TeamActivity.filter(
        filter,
        '-created_date',
        limit
      );
    },
    refetchInterval: 5000 // Real-time updates every 5s
  });

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          Team Activity Feed
          <Badge className="bg-amber-500/20 text-amber-400 ml-2">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            <AnimatePresence>
              {activities.map((activity, idx) => {
                const Icon = actionIcons[activity.action_type] || Activity;
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {activity.actor_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">
                        <span className="font-medium">{activity.actor_name}</span>{' '}
                        <span className="text-white/70">{activity.action_type}</span>{' '}
                        <Badge className={`${moduleColors[activity.entity_type]} ml-1`}>
                          {activity.entity_type}
                        </Badge>
                      </p>
                      {activity.description && (
                        <p className="text-white/60 text-xs mt-1">{activity.description}</p>
                      )}
                      {activity.entity_name && (
                        <p className="text-amber-400 text-xs mt-1">{activity.entity_name}</p>
                      )}
                      <p className="text-white/50 text-xs mt-1">
                        {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      activity.action_type === 'deleted' ? 'text-red-400' :
                      activity.action_type === 'created' ? 'text-green-400' :
                      'text-amber-400'
                    }`} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}