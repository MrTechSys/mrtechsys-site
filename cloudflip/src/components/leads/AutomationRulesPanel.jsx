import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Zap,
  Plus,
  Trash2,
  Mail,
  UserPlus,
  Target,
  Send,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const TRIGGER_OPTIONS = [
  { value: 'lead_created', label: 'New Lead Created', icon: UserPlus },
  { value: 'score_threshold', label: 'Score Reaches Threshold', icon: Target },
  { value: 'status_change', label: 'Status Changed', icon: CheckCircle },
  { value: 'source_match', label: 'Source Matches', icon: Zap }
];

const ACTION_OPTIONS = [
  { value: 'score_lead', label: 'AI Score Lead', icon: Target },
  { value: 'generate_email', label: 'Generate Email', icon: Mail },
  { value: 'create_task', label: 'Create Task', icon: CheckCircle },
  { value: 'route_to_sales', label: 'Route to Sales Rep', icon: UserPlus },
  { value: 'enroll_nurture', label: 'Enroll in Nurture', icon: Send }
];

export default function AutomationRulesPanel({ orgId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'lead_created',
    condition_value: '',
    actions: ['score_lead']
  });
  const queryClient = useQueryClient();

  const { data: rules = [] } = useQuery({
    queryKey: ['automation-rules', orgId],
    queryFn: () => api.entities.WorkflowAutomation.filter({ 
      org_id: orgId,
      'trigger.type': { $in: ['new_lead_created', 'lead_status_change'] }
    }),
    enabled: !!orgId
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const workflowData = {
        org_id: orgId,
        name: data.name,
        description: `Auto-workflow for leads`,
        trigger: {
          type: data.trigger,
          conditions: data.condition_value ? { value: data.condition_value } : {}
        },
        actions: data.actions.map((actionType, idx) => ({
          order: idx + 1,
          action_type: actionType,
          config: {}
        })),
        is_active: true,
        ai_suggested: false
      };

      if (editingRule) {
        return await api.entities.WorkflowAutomation.update(editingRule.id, workflowData);
      } else {
        return await api.entities.WorkflowAutomation.create(workflowData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success(editingRule ? 'Rule updated!' : 'Rule created!');
      setShowDialog(false);
      setEditingRule(null);
      setFormData({ name: '', trigger: 'lead_created', condition_value: '', actions: ['score_lead'] });
    },
    onError: (error) => {
      console.error('Save rule error:', error);
      toast.error('Failed to save rule');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId) => api.entities.WorkflowAutomation.delete(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Rule deleted');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete rule');
    }
  });

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      trigger: rule.trigger?.type || 'lead_created',
      condition_value: rule.trigger?.conditions?.value || '',
      actions: rule.actions?.map(a => a.action_type) || ['score_lead']
    });
    setShowDialog(true);
  };

  const handleAddAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, 'generate_email']
    });
  };

  const handleRemoveAction = (idx) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== idx)
    });
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Automation Rules ({rules.length})
          </CardTitle>
          <Button
            onClick={() => {
              setEditingRule(null);
              setFormData({ name: '', trigger: 'lead_created', condition_value: '', actions: ['score_lead'] });
              setShowDialog(true);
            }}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
            <p className="text-white/60 mb-4">No automation rules yet</p>
            <p className="text-white/50 text-sm">Create rules to automate lead workflows</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => {
              const TriggerIcon = TRIGGER_OPTIONS.find(t => t.value === rule.trigger?.type)?.icon || Zap;
              
              return (
                <Card key={rule.id} className="bg-white/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-bold">{rule.name}</h3>
                          {rule.is_active ? (
                            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <TriggerIcon className="w-4 h-4 text-purple-400" />
                          <span>
                            {TRIGGER_OPTIONS.find(t => t.value === rule.trigger?.type)?.label || 'Custom Trigger'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(rule)}
                          size="sm"
                          variant="outline"
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteMutation.mutate(rule.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {rule.actions?.map((action, idx) => {
                        const ActionIcon = ACTION_OPTIONS.find(a => a.value === action.action_type)?.icon || Zap;
                        return (
                          <Badge key={idx} className="bg-purple-500/20 text-purple-400">
                            <ActionIcon className="w-3 h-3 mr-1" />
                            {ACTION_OPTIONS.find(a => a.value === action.action_type)?.label || action.action_type}
                          </Badge>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-white/50">Executions:</span>
                        <span className="text-white ml-2">{rule.execution_count || 0}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Success Rate:</span>
                        <span className="text-green-400 ml-2">
                          {rule.execution_count > 0 
                            ? Math.round((rule.success_count / rule.execution_count) * 100) 
                            : 100}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Rule Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Auto-score new leads"
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Trigger</Label>
                <Select value={formData.trigger} onValueChange={(val) => setFormData({...formData, trigger: val})}>
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.trigger === 'score_threshold' && (
                <div>
                  <Label className="text-white">Minimum Score</Label>
                  <Input
                    type="number"
                    value={formData.condition_value}
                    onChange={(e) => setFormData({...formData, condition_value: e.target.value})}
                    placeholder="70"
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">Actions ({formData.actions.length})</Label>
                  <Button
                    onClick={handleAddAction}
                    size="sm"
                    variant="outline"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-white/50 text-sm w-6">{idx + 1}.</span>
                      <Select
                        value={action}
                        onValueChange={(val) => {
                          const updated = [...formData.actions];
                          updated[idx] = val;
                          setFormData({...formData, actions: updated});
                        }}
                      >
                        <SelectTrigger className="bg-white/5 border-amber-500/30 text-white flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <opt.icon className="w-4 h-4" />
                                <span>{opt.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.actions.length > 1 && (
                        <Button
                          onClick={() => handleRemoveAction(idx)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="border-amber-500/30 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => saveMutation.mutate(formData)}
                disabled={!formData.name || saveMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-purple-500"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Rule
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}