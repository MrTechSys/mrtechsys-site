import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Mail,
  MessageSquare,
  Loader2,
  CheckCircle,
  Slack,
  Users
} from "lucide-react";

export default function AlertWorkflowManager() {
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['alert-workflows'],
    queryFn: async () => {
      const currentUser = await api.auth.me();
      return await api.entities.AlertWorkflow.filter({
        org_id: currentUser.current_org_id
      }, '-created_date');
    }
  });

  const activeWorkflows = workflows.filter(w => w.is_active);
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0);

  const channelIcons = {
    slack: Slack,
    teams: Users,
    email: Mail,
    pagerduty: Bell,
    sms: MessageSquare,
    webhook: CheckCircle
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Bell className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-2">{activeWorkflows.length}</p>
            <p className="text-white/60 text-xs">Alert Workflows</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Sent</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-400 mt-2">{totalExecutions}</p>
            <p className="text-white/60 text-xs">Alerts Dispatched</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Channels</Badge>
            </div>
            <p className="text-2xl font-bold text-purple-400 mt-2">
              {workflows.reduce((sum, w) => sum + (w.notification_channels?.length || 0), 0)}
            </p>
            <p className="text-white/60 text-xs">Configured</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Alert Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No alert workflows configured</p>
            </div>
          ) : (
            <div className="space-y-2">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{workflow.name}</h3>
                        {workflow.is_active && (
                          <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                        )}
                      </div>
                      <p className="text-white/70 text-sm">{workflow.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-400">{workflow.execution_count || 0}</p>
                      <p className="text-white/60 text-xs">Executions</p>
                    </div>
                  </div>

                  {/* Notification Channels */}
                  <div className="flex flex-wrap gap-2">
                    {workflow.notification_channels?.map((channel, idx) => {
                      const Icon = channelIcons[channel.channel_type] || Bell;
                      return (
                        <Badge key={idx} className="bg-blue-500/20 text-blue-400">
                          <Icon className="w-3 h-3 mr-1" />
                          {channel.channel_type}
                        </Badge>
                      );
                    })}
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