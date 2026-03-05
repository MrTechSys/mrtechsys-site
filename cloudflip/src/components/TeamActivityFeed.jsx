import React from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  CheckCircle, 
  Edit, 
  Trash, 
  UserPlus,
  Clock,
  TrendingUp
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const activityIcons = {
  created: TrendingUp,
  updated: Edit,
  deleted: Trash,
  commented: MessageSquare,
  mentioned: UserPlus,
  assigned: UserPlus,
  completed: CheckCircle,
  status_changed: Edit
};

const activityColors = {
  created: "text-green-400",
  updated: "text-blue-400",
  deleted: "text-red-400",
  commented: "text-purple-400",
  mentioned: "text-amber-400",
  assigned: "text-cyan-400",
  completed: "text-green-400",
  status_changed: "text-orange-400"
};

export default function TeamActivityFeed({ limit = 20, entityType, entityId }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['team-activity', entityType, entityId],
    queryFn: async () => {
      const filters = entityType && entityId 
        ? { entity_type: entityType, entity_id: entityId }
        : {};
      return api.entities.TeamActivity.filter(filters, '-created_date', limit);
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardContent className="p-8 text-center text-white/60">
          Loading activity...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Team <span className="text-amber-400">Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              No recent activity
            </div>
          ) : (
            activities.map((activity, index) => {
              const Icon = activityIcons[activity.action_type] || Clock;
              const colorClass = activityColors[activity.action_type] || "text-white";
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3 p-3 bg-white/5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
                      {activity.actor_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon className={`w-4 h-4 ${colorClass} flex-shrink-0`} />
                        <p className="text-white text-sm">
                          <span className="font-medium">{activity.actor_name}</span>
                          {' '}
                          <span className="text-white/70">{activity.description}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                      </span>
                      {activity.entity_type && (
                        <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                          {activity.entity_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}