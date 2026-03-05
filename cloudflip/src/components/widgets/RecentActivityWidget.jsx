import React from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Mail, FileText, Users, Target, Plus, Trash } from "lucide-react";
import { format } from "date-fns";

const actionIcons = {
  created: Plus,
  updated: FileText,
  deleted: Trash,
  emailed: Mail,
  viewed: Users,
  converted: Target
};

const actionColors = {
  created: "text-green-400",
  updated: "text-blue-400",
  deleted: "text-red-400",
  emailed: "text-amber-400",
  viewed: "text-purple-400",
  converted: "text-emerald-400"
};

export default function RecentActivityWidget({ limit = 5 }) {
  const { data: activities = [] } = useQuery({
    queryKey: ['team-activities-widget', limit],
    queryFn: async () => {
      const user = await api.auth.me();
      return api.entities.TeamActivity.filter(
        { org_id: user.current_org_id },
        '-created_date',
        limit
      );
    },
    refetchInterval: 10000
  });

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-white/60 text-sm text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, idx) => {
              const Icon = actionIcons[activity.action_type] || Activity;
              
              return (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${actionColors[activity.action_type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">
                      <span className="font-medium">{activity.actor_name}</span>{' '}
                      <span className="text-white/70">{activity.action_type}</span>{' '}
                      <span className="text-amber-400">{activity.entity_type}</span>
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}