import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Play,
  CheckCircle,
  Clock,
  Zap,
  Loader2,
  ChevronRight,
  Users,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function IncidentPlaybookManager() {
  const queryClient = useQueryClient();
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);

  const { data: playbooks = [], isLoading } = useQuery({
    queryKey: ['incident-playbooks'],
    queryFn: async () => {
      const currentUser = await api.auth.me();
      return await api.entities.IncidentPlaybook.filter({
        org_id: currentUser.current_org_id
      }, '-created_date');
    }
  });

  const executeMutation = useMutation({
    mutationFn: async (playbookId) => {
      const { data } = await api.functions.invoke('incidentPlaybookExecutor', {
        playbookId
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Playbook executed: ${data.steps_successful}/${data.steps_executed} steps successful`);
      queryClient.invalidateQueries({ queryKey: ['incident-playbooks'] });
      setSelectedPlaybook(null);
    },
    onError: () => {
      toast.error("Playbook execution failed");
    }
  });

  const activePlaybooks = playbooks.filter(p => p.is_active);
  const avgSuccessRate = playbooks.length > 0 
    ? playbooks.reduce((sum, p) => sum + (p.success_rate || 0), 0) / playbooks.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Shield className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-2">{activePlaybooks.length}</p>
            <p className="text-white/60 text-xs">Playbooks Ready</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Success Rate</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-400 mt-2">{avgSuccessRate.toFixed(0)}%</p>
            <p className="text-white/60 text-xs">Avg Performance</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Total</Badge>
            </div>
            <p className="text-2xl font-bold text-purple-400 mt-2">
              {playbooks.reduce((sum, p) => sum + (p.execution_count || 0), 0)}
            </p>
            <p className="text-white/60 text-xs">Times Executed</p>
          </CardContent>
        </Card>
      </div>

      {/* Playbooks List */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Automated Response Playbooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            </div>
          ) : playbooks.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No playbooks configured</p>
              <p className="text-white/40 text-sm mt-1">Create playbooks to automate incident response</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playbooks.map((playbook) => (
                <div
                  key={playbook.id}
                  className={`p-4 rounded-lg border transition-all ${
                    playbook.is_active 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-white/10 bg-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{playbook.name}</h3>
                        {playbook.is_active ? (
                          <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-white/70 text-sm mb-2">{playbook.description}</p>
                      
                      {/* Trigger Conditions */}
                      {playbook.trigger_conditions && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {playbook.trigger_conditions.anomaly_types?.map((type, idx) => (
                            <Badge key={idx} className="bg-purple-500/20 text-purple-400 text-xs">
                              {type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {playbook.trigger_conditions.severity_threshold && (
                            <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                              ≥{playbook.trigger_conditions.severity_threshold}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-white/60 mb-1">Success Rate</div>
                      <div className="text-lg font-bold text-green-400">
                        {playbook.success_rate?.toFixed(0) || 0}%
                      </div>
                      <div className="text-xs text-white/40">
                        {playbook.execution_count || 0} runs
                      </div>
                    </div>
                  </div>

                  {/* Automated Steps Preview */}
                  {playbook.automated_steps && (
                    <div className="bg-black/20 rounded p-3 mb-3">
                      <p className="text-white/60 text-xs mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        {playbook.automated_steps.length} Automated Steps
                      </p>
                      <div className="space-y-1">
                        {playbook.automated_steps.slice(0, 3).map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-white/70">
                            <ChevronRight className="w-3 h-3 text-amber-400" />
                            <span>{step.step_number}. {step.action.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                        {playbook.automated_steps.length > 3 && (
                          <p className="text-white/50 text-xs ml-5">
                            +{playbook.automated_steps.length - 3} more steps
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manual Steps Preview */}
                  {playbook.manual_steps && playbook.manual_steps.length > 0 && (
                    <div className="bg-blue-500/10 rounded p-3 mb-3 border border-blue-500/20">
                      <p className="text-blue-400 text-xs mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {playbook.manual_steps.length} Manual Steps Required
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      {playbook.last_executed_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last run: {format(new Date(playbook.last_executed_at), 'MMM d, h:mm a')}
                        </div>
                      )}
                      {playbook.avg_resolution_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Avg: {playbook.avg_resolution_time_minutes}min
                        </div>
                      )}
                    </div>
                    
                    {playbook.is_active && (
                      <Button
                        onClick={() => executeMutation.mutate(playbook.playbook_id)}
                        disabled={executeMutation.isPending}
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-green-500"
                      >
                        {executeMutation.isPending ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
                        )}
                        Execute
                      </Button>
                    )}
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