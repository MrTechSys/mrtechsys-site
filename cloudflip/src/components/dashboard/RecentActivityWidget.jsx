import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, Database, Mail, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const actionIcons = {
  create: Database,
  update: Database,
  delete: Database,
  emailed: Mail,
  viewed: User,
  security: Shield
};

const actionColors = {
  create: 'text-green-400',
  update: 'text-blue-400',
  delete: 'text-red-400',
  emailed: 'text-purple-400',
  viewed: 'text-cyan-400',
  security: 'text-amber-400'
};

export default function RecentActivityWidget({ refreshInterval = 5000 }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const audits = await api.entities.AuditLog.list('-created_date', 10);
      return audits;
    },
    refetchInterval: refreshInterval
  });

  return (
    <Card className="bg-white/5 border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-white/60 text-sm">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="text-white/60 text-sm text-center py-4">No recent activity</div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity, idx) => {
              const Icon = actionIcons[activity.action] || Activity;
              const color = actionColors[activity.action] || 'text-white';
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {activity.actor_name || 'User'} {activity.action}d {activity.entity}
                    </p>
                    <p className="text-xs text-white/60">
                      {new Date(activity.created_date).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className="bg-white/10 text-white text-xs">
                    {activity.action}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}