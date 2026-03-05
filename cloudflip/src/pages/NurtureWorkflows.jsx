
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Mail,
  CheckSquare,
  TrendingUp,
  Clock,
  Users,
  Zap,
  Play,
  Pause,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AIWorkflowSuggestions from "../components/workflows/AIWorkflowSuggestions";

export default function NurtureWorkflows() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowForm, setWorkflowForm] = useState({
    name: "",
    description: "",
    trigger_type: "lead_created",
    steps: []
  });
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['nurture-workflows'],
    queryFn: () => api.entities.NurtureWorkflow.list('-created_date')
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['nurture-enrollments'],
    queryFn: () => api.entities.NurtureEnrollment.list('-enrolled_at')
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.NurtureWorkflow.create({
        ...data,
        org_id: user.current_org_id,
        created_by: user.id,
        total_enrolled: 0,
        total_completed: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurture-workflows'] });
      setShowCreateModal(false);
      toast.success("Nurture workflow created!");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      api.entities.NurtureWorkflow.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurture-workflows'] });
      toast.success("Workflow updated!");
    }
  });

  const addStep = () => {
    setWorkflowForm({
      ...workflowForm,
      steps: [
        ...workflowForm.steps,
        {
          step_number: workflowForm.steps.length + 1,
          delay_hours: 24,
          action_type: "send_email",
          email_template: {
            subject: "",
            body: "",
            use_ai: true
          }
        }
      ]
    });
  };

  const removeStep = (index) => {
    const newSteps = workflowForm.steps.filter((_, i) => i !== index);
    setWorkflowForm({ ...workflowForm, steps: newSteps });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...workflowForm.steps];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newSteps[index][parent] = { ...newSteps[index][parent], [child]: value };
    } else {
      newSteps[index][field] = value;
    }
    setWorkflowForm({ ...workflowForm, steps: newSteps });
  };

  const handleCreateWorkflow = () => {
    if (!workflowForm.name || workflowForm.steps.length === 0) {
      toast.error("Please provide a name and at least one step");
      return;
    }

    createMutation.mutate({
      name: workflowForm.name,
      description: workflowForm.description,
      trigger: {
        type: workflowForm.trigger_type,
        conditions: {}
      },
      steps: workflowForm.steps,
      engagement_rules: {
        email_opened_action: "continue",
        link_clicked_action: "create_task",
        no_engagement_action: "continue"
      },
      ai_optimization: {
        enabled: true,
        adjust_timing: true,
        personalize_content: true,
        optimize_send_time: false
      },
      is_active: true
    });
  };

  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Nurture <span className="text-amber-400">Workflows</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Automate lead engagement with <span className="text-amber-400">AI-powered sequences</span></p>
        </div>
        <Button
          onClick={() => {
            setWorkflowForm({ name: "", description: "", trigger_type: "lead_created", steps: [] });
            setShowCreateModal(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Active Workflows</div>
              <div className="text-2xl font-bold text-white">{workflows.filter(w => w.is_active).length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Active Nurtures</div>
              <div className="text-2xl font-bold text-blue-400">{activeEnrollments}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Completed</div>
              <div className="text-2xl font-bold text-green-400">{completedEnrollments}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Emails Sent</div>
              <div className="text-2xl font-bold text-purple-400">
                {enrollments.reduce((sum, e) => sum + (e.emails_sent || 0), 0)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Workflow Suggestions - NEW */}
      <AIWorkflowSuggestions />

      {/* Workflows List */}
      {isLoading ? (
        <Card className="p-8 text-center text-white/60 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          Loading workflows...
        </Card>
      ) : workflows.length === 0 ? (
        <Card className="p-12 text-center bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <Zap className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Workflows Yet</h3>
          <p className="text-white/60 mb-6">Create your first automated nurture workflow to engage leads</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Workflow
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {workflows.map((workflow) => {
            const workflowEnrollments = enrollments.filter(e => e.workflow_id === workflow.id);
            const activeCount = workflowEnrollments.filter(e => e.status === 'active').length;
            const completedCount = workflowEnrollments.filter(e => e.status === 'completed').length;
            
            return (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:border-amber-500/40 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white flex items-center gap-2">
                          {workflow.name}
                          {workflow.is_active ? (
                            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400">Paused</Badge>
                          )}
                        </CardTitle>
                        {workflow.description && (
                          <p className="text-white/60 text-sm mt-2">{workflow.description}</p>
                        )}
                      </div>
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: workflow.id, is_active: checked })
                        }
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-amber-400">{workflow.steps.length}</div>
                        <div className="text-xs text-white/60">Steps</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{activeCount}</div>
                        <div className="text-xs text-white/60">Active</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                        <div className="text-xs text-white/60">Completed</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-white/60 font-medium">Workflow Steps:</div>
                      {workflow.steps.slice(0, 3).map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-white/70 p-2 bg-white/5 rounded">
                          {step.action_type === 'send_email' && <Mail className="w-4 h-4 text-amber-400" />}
                          {step.action_type === 'create_task' && <CheckSquare className="w-4 h-4 text-blue-400" />}
                          <span className="flex-1">
                            {step.action_type === 'send_email' ? 'Send Email' : 
                             step.action_type === 'create_task' ? 'Create Task' : step.action_type}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-white/50">
                            <Clock className="w-3 h-3" />
                            {step.delay_hours}h
                          </span>
                        </div>
                      ))}
                      {workflow.steps.length > 3 && (
                        <div className="text-xs text-white/50 text-center">
                          +{workflow.steps.length - 3} more steps
                        </div>
                      )}
                    </div>

                    {workflow.ai_optimization?.enabled && (
                      <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">AI-Optimized</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Workflow Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Create Nurture Workflow
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label className="text-white">Workflow Name *</Label>
              <Input
                value={workflowForm.name}
                onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                placeholder="e.g., New Lead Welcome Series"
                className="bg-white/5 border-amber-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Description</Label>
              <Textarea
                value={workflowForm.description}
                onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                placeholder="What is this workflow for?"
                rows={2}
                className="bg-white/5 border-amber-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Trigger</Label>
              <Select 
                value={workflowForm.trigger_type} 
                onValueChange={(value) => setWorkflowForm({ ...workflowForm, trigger_type: value })}
              >
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_created">When Lead is Created</SelectItem>
                  <SelectItem value="lead_status_change">When Lead Status Changes</SelectItem>
                  <SelectItem value="lead_score_threshold">When Lead Score Reaches Threshold</SelectItem>
                  <SelectItem value="manual">Manual Enrollment Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Workflow Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white">Workflow Steps</Label>
                <Button
                  onClick={addStep}
                  size="sm"
                  className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {workflowForm.steps.map((step, index) => (
                  <Card key={index} className="p-4 bg-white/5 border-amber-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-white font-medium">Step {index + 1}</div>
                      <Button
                        onClick={() => removeStep(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-500 h-6 w-6 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-white text-xs">Action</Label>
                          <Select
                            value={step.action_type}
                            onValueChange={(value) => updateStep(index, 'action_type', value)}
                          >
                            <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="send_email">Send Email</SelectItem>
                              <SelectItem value="create_task">Create Task</SelectItem>
                              <SelectItem value="update_lead_score">Update Lead Score</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-white text-xs">Delay (hours)</Label>
                          <Input
                            type="number"
                            value={step.delay_hours}
                            onChange={(e) => updateStep(index, 'delay_hours', parseInt(e.target.value))}
                            className="bg-white/5 border-amber-500/30 text-white"
                          />
                        </div>
                      </div>

                      {step.action_type === 'send_email' && (
                        <>
                          <div>
                            <Label className="text-white text-xs">Email Subject</Label>
                            <Input
                              value={step.email_template?.subject || ''}
                              onChange={(e) => updateStep(index, 'email_template.subject', e.target.value)}
                              placeholder="Subject line..."
                              className="bg-white/5 border-amber-500/30 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white text-xs">Email Body</Label>
                            <Textarea
                              value={step.email_template?.body || ''}
                              onChange={(e) => updateStep(index, 'email_template.body', e.target.value)}
                              placeholder="Email content... (AI will personalize this)"
                              rows={3}
                              className="bg-white/5 border-amber-500/30 text-white"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={step.email_template?.use_ai !== false}
                              onCheckedChange={(checked) => updateStep(index, 'email_template.use_ai', checked)}
                              className="data-[state=checked]:bg-amber-500"
                            />
                            <Label className="text-white text-xs">Use AI to personalize</Label>
                          </div>
                        </>
                      )}

                      {step.action_type === 'create_task' && (
                        <>
                          <div>
                            <Label className="text-white text-xs">Task Title</Label>
                            <Input
                              value={step.task_template?.title || ''}
                              onChange={(e) => updateStep(index, 'task_template.title', e.target.value)}
                              placeholder="Task title..."
                              className="bg-white/5 border-amber-500/30 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white text-xs">Task Priority</Label>
                            <Select
                              value={step.task_template?.priority || 'medium'}
                              onValueChange={(value) => updateStep(index, 'task_template.priority', value)}
                            >
                              <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}

                {workflowForm.steps.length === 0 && (
                  <div className="text-center py-8 text-white/50 border border-dashed border-amber-500/30 rounded-lg">
                    No steps added yet. Click "Add Step" to create your first step.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkflow}
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
