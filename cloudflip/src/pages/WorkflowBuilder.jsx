import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Zap,
  Trash2,
  Play,
  Pause,
  Sparkles,
  ArrowRight,
  Settings as SettingsIcon,
  Mail,
  MessageSquare,
  UserPlus,
  Database,
  Webhook,
  Shield,
  AlertTriangle,
  Clock,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const triggerIcons = {
  new_lead_created: UserPlus,
  lead_status_change: ArrowRight,
  security_alert_triggered: Shield,
  compliance_finding_detected: AlertTriangle,
  quote_accepted: Zap,
  invoice_overdue: Clock,
  ticket_created: MessageSquare,
  sentiment_threshold: Sparkles,
  schedule: Clock,
  webhook: Webhook
};

const actionIcons = {
  send_email: Mail,
  send_sms: MessageSquare,
  create_task: Plus,
  assign_user: UserPlus,
  update_entity: Database,
  call_webhook: Webhook,
  block_ip: Shield,
  create_incident: AlertTriangle,
  send_notification: Zap,
  invoke_function: Sparkles,
  delay: Clock
};

export default function WorkflowBuilder() {
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflow-automations'],
    queryFn: () => api.entities.WorkflowAutomation.list('-created_date'),
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: () => api.entities.WorkflowExecution.list('-started_at', 50),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.WorkflowAutomation.create({
        ...data,
        org_id: user.current_org_id,
        created_by: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
      setShowForm(false);
      setEditingWorkflow(null);
      toast.success("Workflow created successfully!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.WorkflowAutomation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
      setShowForm(false);
      setEditingWorkflow(null);
      toast.success("Workflow updated!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.WorkflowAutomation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
      toast.success("Workflow deleted!");
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      api.entities.WorkflowAutomation.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
    }
  });

  const getAISuggestions = async () => {
    setLoadingAI(true);
    try {
      const user = await api.auth.me();
      const { data } = await api.functions.invoke('suggestWorkflows', {
        orgId: user.current_org_id
      });
      setAiSuggestions(data.suggestions || []);
      setShowAISuggestions(true);
    } catch (error) {
      toast.error("Failed to get AI suggestions");
    } finally {
      setLoadingAI(false);
    }
  };

  const applyAISuggestion = (suggestion) => {
    createMutation.mutate(suggestion);
    setShowAISuggestions(false);
  };

  const activeWorkflows = workflows.filter(w => w.is_active).length;
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0);
  const successRate = totalExecutions > 0
    ? ((workflows.reduce((sum, w) => sum + (w.success_count || 0), 0) / totalExecutions) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Workflow <span className="text-amber-400">Automation</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Automate your <span className="text-amber-400">business processes</span></p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={getAISuggestions}
            disabled={loadingAI}
            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
          >
            {loadingAI ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Suggestions
          </Button>
          <Button
            onClick={() => {
              setEditingWorkflow(null);
              setShowForm(true);
            }}
            className="flex-1 sm:flex-none bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{activeWorkflows}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalExecutions}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{successRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow, index) => {
          const TriggerIcon = triggerIcons[workflow.trigger?.type] || Zap;
          
          return (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:border-amber-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <TriggerIcon className="w-5 h-5 text-amber-400" />
                        <CardTitle className="text-white">{workflow.name}</CardTitle>
                        {workflow.ai_suggested && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-white/60">
                        {workflow.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={(checked) => 
                          toggleMutation.mutate({ id: workflow.id, is_active: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingWorkflow(workflow);
                          setShowForm(true);
                        }}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(workflow.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <span className="text-xs text-blue-400 font-medium">
                        Trigger: {workflow.trigger?.type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40" />
                    <div className="px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/30">
                      <span className="text-xs text-green-400 font-medium">
                        {workflow.actions?.length || 0} actions
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <div>Runs: <span className="text-white font-semibold">{workflow.execution_count || 0}</span></div>
                    <div>Success: <span className="text-green-400 font-semibold">{workflow.success_count || 0}</span></div>
                    <div>Failed: <span className="text-red-400 font-semibold">{workflow.failure_count || 0}</span></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {workflows.length === 0 && !isLoading && (
          <Card className="p-12 text-center bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <Zap className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Workflows Yet
            </h3>
            <p className="text-white/60 mb-6">
              Automate your business processes with AI-powered workflows
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={getAISuggestions}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Suggestions
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={showAISuggestions} onOpenChange={setShowAISuggestions}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Workflow Suggestions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, idx) => (
              <Card key={idx} className="bg-white/5 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    {React.createElement(triggerIcons[suggestion.trigger?.type] || Zap, {
                      className: "w-4 h-4 text-purple-400"
                    })}
                    {suggestion.name}
                  </CardTitle>
                  <CardDescription className="text-white/60 text-sm">
                    {suggestion.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {suggestion.actions?.length || 0} actions
                      </Badge>
                      <span className="text-white/50">
                        {Math.round((suggestion.ai_confidence || 0.8) * 100)}% confidence
                      </span>
                    </div>
                    <Button
                      onClick={() => applyAISuggestion(suggestion)}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
                    >
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
            </DialogTitle>
          </DialogHeader>
          <WorkflowForm
            workflow={editingWorkflow}
            onSubmit={(data) => {
              if (editingWorkflow) {
                updateMutation.mutate({ id: editingWorkflow.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkflowForm({ workflow, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(workflow || {
    name: "",
    description: "",
    trigger: { type: "new_lead_created", conditions: {} },
    actions: []
  });

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [
        ...formData.actions,
        { order: formData.actions.length, action_type: "send_email", config: {} }
      ]
    });
  };

  const removeAction = (index) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index)
    });
  };

  const updateAction = (index, updates) => {
    const newActions = [...formData.actions];
    newActions[index] = { ...newActions[index], ...updates };
    setFormData({ ...formData, actions: newActions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-white">Workflow Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="bg-white/5 border-amber-500/30 text-white"
          placeholder="e.g., Auto-respond to new leads"
        />
      </div>

      <div>
        <Label className="text-white">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-white/5 border-amber-500/30 text-white"
          rows={2}
          placeholder="What does this workflow do?"
        />
      </div>

      <div>
        <Label className="text-white">Trigger *</Label>
        <Select
          value={formData.trigger?.type}
          onValueChange={(value) => setFormData({
            ...formData,
            trigger: { ...formData.trigger, type: value }
          })}
        >
          <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_lead_created">New Lead Created</SelectItem>
            <SelectItem value="lead_status_change">Lead Status Change</SelectItem>
            <SelectItem value="security_alert_triggered">Security Alert Triggered</SelectItem>
            <SelectItem value="compliance_finding_detected">Compliance Finding</SelectItem>
            <SelectItem value="quote_accepted">Quote Accepted</SelectItem>
            <SelectItem value="invoice_overdue">Invoice Overdue</SelectItem>
            <SelectItem value="ticket_created">Ticket Created</SelectItem>
            <SelectItem value="sentiment_threshold">Sentiment Threshold</SelectItem>
            <SelectItem value="schedule">Schedule (Recurring)</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-white">Actions *</Label>
          <Button type="button" size="sm" onClick={addAction} variant="outline" className="border-amber-500/30 text-amber-400">
            <Plus className="w-3 h-3 mr-1" />
            Add Action
          </Button>
        </div>
        <div className="space-y-2">
          {formData.actions.map((action, idx) => {
            const ActionIcon = actionIcons[action.action_type] || Zap;
            return (
              <div key={idx} className="p-3 bg-white/5 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ActionIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-white text-sm font-medium">Action {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAction(idx)}
                    className="ml-auto text-red-400 hover:text-red-300 h-6 w-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <Select
                  value={action.action_type}
                  onValueChange={(value) => updateAction(idx, { action_type: value })}
                >
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_email">Send Email</SelectItem>
                    <SelectItem value="send_sms">Send SMS</SelectItem>
                    <SelectItem value="create_task">Create Task</SelectItem>
                    <SelectItem value="assign_user">Assign User</SelectItem>
                    <SelectItem value="update_entity">Update Entity</SelectItem>
                    <SelectItem value="call_webhook">Call Webhook</SelectItem>
                    <SelectItem value="block_ip">Block IP</SelectItem>
                    <SelectItem value="create_incident">Create Incident</SelectItem>
                    <SelectItem value="send_notification">Send Notification</SelectItem>
                    <SelectItem value="invoke_function">Invoke Function</SelectItem>
                    <SelectItem value="delay">Delay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} className="border-amber-500/30 text-white">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!formData.name || formData.actions.length === 0}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
        >
          {workflow ? 'Update' : 'Create'} Workflow
        </Button>
      </DialogFooter>
    </form>
  );
}