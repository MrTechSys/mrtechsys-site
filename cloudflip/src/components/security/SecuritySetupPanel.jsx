import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Zap,
  CheckCircle,
  Loader2,
  Sparkles,
  Rocket
} from "lucide-react";
import { toast } from "sonner";

export default function SecuritySetupPanel() {
  const queryClient = useQueryClient();
  const [setupStatus, setSetupStatus] = useState({
    playbooks: false,
    workflows: false
  });

  const seedPlaybooksMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('seedIncidentPlaybooks', {});
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.playbooks_created} incident playbooks created!`);
      setSetupStatus(prev => ({ ...prev, playbooks: true }));
      queryClient.invalidateQueries({ queryKey: ['incident-playbooks'] });
    },
    onError: () => {
      toast.error("Failed to create playbooks");
    }
  });

  const seedWorkflowsMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('seedAlertWorkflows', {});
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.workflows_created} alert workflows created!`);
      setSetupStatus(prev => ({ ...prev, workflows: true }));
      queryClient.invalidateQueries({ queryKey: ['alert-workflows'] });
    },
    onError: () => {
      toast.error("Failed to create workflows");
    }
  });

  const initializeAllMutation = useMutation({
    mutationFn: async () => {
      const playbookResult = await api.functions.invoke('seedIncidentPlaybooks', {});
      const workflowResult = await api.functions.invoke('seedAlertWorkflows', {});
      return { playbooks: playbookResult.data, workflows: workflowResult.data };
    },
    onSuccess: (data) => {
      toast.success(`Security initialized: ${data.playbooks.playbooks_created} playbooks, ${data.workflows.workflows_created} workflows`);
      setSetupStatus({ playbooks: true, workflows: true });
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast.error("Initialization failed");
    }
  });

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-purple-400" />
          Security Automation Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/70 text-sm">
          Initialize your security infrastructure with pre-built incident response playbooks and alert workflows
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-white/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Incident Playbooks</span>
                </div>
                {setupStatus.playbooks && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
              <p className="text-white/60 text-xs mb-3">
                6 automated response playbooks for common threats
              </p>
              <Button
                onClick={() => seedPlaybooksMutation.mutate()}
                disabled={seedPlaybooksMutation.isPending || setupStatus.playbooks}
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500"
              >
                {seedPlaybooksMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : setupStatus.playbooks ? (
                  'Initialized'
                ) : (
                  'Initialize Playbooks'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Alert Workflows</span>
                </div>
                {setupStatus.workflows && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
              <p className="text-white/60 text-xs mb-3">
                4 notification workflows for Slack, Teams, PagerDuty
              </p>
              <Button
                onClick={() => seedWorkflowsMutation.mutate()}
                disabled={seedWorkflowsMutation.isPending || setupStatus.workflows}
                size="sm"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500"
              >
                {seedWorkflowsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : setupStatus.workflows ? (
                  'Initialized'
                ) : (
                  'Initialize Workflows'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={() => initializeAllMutation.mutate()}
          disabled={initializeAllMutation.isPending || (setupStatus.playbooks && setupStatus.workflows)}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
        >
          {initializeAllMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Initializing...</>
          ) : (setupStatus.playbooks && setupStatus.workflows) ? (
            <><CheckCircle className="w-4 h-4 mr-2" />All Systems Ready</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />Initialize All Security Modules</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}