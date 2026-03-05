import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Clock,
  Mail,
  Database,
  Webhook,
  Shield,
  Bell,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Activity,
  GitBranch,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const triggerTypes = [
  { value: 'entity_create', label: 'Entity Created', icon: Database, color: 'blue' },
  { value: 'entity_update', label: 'Entity Updated', icon: Database, color: 'green' },
  { value: 'security_alert', label: 'Security Alert', icon: Shield, color: 'red' },
  { value: 'schedule', label: 'Scheduled Time', icon: Clock, color: 'purple' },
  { value: 'api_event', label: 'API Event', icon: Activity, color: 'orange' }
];

const actionTypes = [
  { value: 'send_email', label: 'Send Email', icon: Mail },
  { value: 'update_entity', label: 'Update Entity', icon: Database },
  { value: 'create_entity', label: 'Create Entity', icon: Plus },
  { value: 'webhook', label: 'Trigger Webhook', icon: Webhook },
  { value: 'notification', label: 'Send Notification', icon: Bell },
  { value: 'security_action', label: 'Security Action', icon: Shield }
];

const entities = ['Lead', 'Contact', 'Deal', 'Ticket', 'Quote', 'Invoice', 'Job'];

export default function AutomationBuilder() {
  const [user, setUser] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
      if (userData.data?.current_org_id) {
        const orgs = await api.entities.Organization.filter({ id: userData.data.current_org_id });
        if (orgs.length > 0) setCurrentOrg(orgs[0]);
      }
    };
    loadUser();
  }, []);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      return await api.entities.WorkflowAutomation.filter({ org_id: currentOrg.id });
    },
    enabled: !!currentOrg
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow-executions', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      return await api.entities.WorkflowExecution.filter(
        { org_id: currentOrg.id },
        '-created_date',
        50
      );
    },
    enabled: !!currentOrg,
    refetchInterval: 5000
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData) => {
      return await api.entities.WorkflowAutomation.create({
        ...workflowData,
        org_id: currentOrg.id,
        created_by: user.id,
        status: 'draft'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast.success('Workflow created');
      setIsEditing(false);
    }
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await api.entities.WorkflowAutomation.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast.success('Workflow updated');
    }
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id) => {
      return await api.entities.WorkflowAutomation.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast.success('Workflow deleted');
      setSelectedWorkflow(null);
    }
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await api.entities.WorkflowAutomation.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
    }
  });

  const handleCreateWorkflow = () => {
    const newWorkflow = {
      name: 'New Workflow',
      description: '',
      trigger: {
        type: 'entity_create',
        entity: 'Lead',
        conditions: {}
      },
      actions: [
        {
          type: 'send_email',
          config: {
            to: '{{entity.email}}',
            subject: 'Welcome!',
            body: 'Thank you for your interest.'
          }
        }
      ]
    };
    createWorkflowMutation.mutate(newWorkflow);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getExecutionStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f33] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-400" />
              Automation Engine
            </h1>
            <p className="text-white/60">Build powerful workflows without code</p>
          </div>
          <Button
            onClick={handleCreateWorkflow}
            className="bg-gradient-to-r from-amber-600 to-amber-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="bg-white/5 border border-amber-500/20">
            <TabsTrigger value="workflows">
              <GitBranch className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="executions">
              <Activity className="w-4 h-4 mr-2" />
              Execution History
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {workflows.map((workflow) => {
                  const TriggerIcon = triggerTypes.find(t => t.value === workflow.trigger?.type)?.icon || Zap;
                  return (
                    <motion.div
                      key={workflow.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card className="bg-white/5 border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.status)}`} />
                              <TriggerIcon className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newStatus = workflow.status === 'active' ? 'paused' : 'active';
                                  toggleWorkflowMutation.mutate({ id: workflow.id, status: newStatus });
                                }}
                              >
                                {workflow.status === 'active' ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this workflow?')) {
                                    deleteWorkflowMutation.mutate(workflow.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-white text-lg mt-2">{workflow.name}</CardTitle>
                          <CardDescription className="text-white/60">
                            {workflow.description || 'No description'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-white/60">Trigger:</span>
                              <Badge className="bg-blue-500/20 text-blue-400">
                                {workflow.trigger?.entity || workflow.trigger?.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-white/60">Actions:</span>
                              <Badge className="bg-purple-500/20 text-purple-400">
                                {workflow.actions?.length || 0} steps
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Activity className="w-4 h-4 text-white/60" />
                              <span className="text-white/60">
                                {workflow.execution_count || 0} runs
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {workflows.length === 0 && !isLoading && (
                <Card className="col-span-full bg-white/5 border-amber-500/20">
                  <CardContent className="text-center py-12">
                    <Zap className="w-12 h-12 text-white/40 mx-auto mb-3" />
                    <p className="text-white/60 mb-4">No workflows yet</p>
                    <Button onClick={handleCreateWorkflow} className="bg-gradient-to-r from-amber-600 to-amber-500">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Workflow
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="executions">
            <Card className="bg-white/5 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Execution History</CardTitle>
                <CardDescription className="text-white/60">
                  Recent workflow executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {executions.slice(0, 20).map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        {getExecutionStatusIcon(execution.status)}
                        <div>
                          <p className="text-white font-medium">{execution.workflow_name}</p>
                          <p className="text-white/60 text-xs">
                            {new Date(execution.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {execution.duration_ms && (
                          <Badge className="bg-white/10 text-white">
                            {execution.duration_ms}ms
                          </Badge>
                        )}
                        <Badge className={
                          execution.status === 'success' 
                            ? 'bg-green-500/20 text-green-400'
                            : execution.status === 'error'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }>
                          {execution.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {executions.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-white/40 mx-auto mb-3" />
                      <p className="text-white/60">No executions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-white/5 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Automation Settings</CardTitle>
                <CardDescription className="text-white/60">
                  Configure global automation behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold">Security Integration Active</p>
                      <p className="text-white/60 text-sm">
                        Workflows can trigger on security events and perform security actions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold">Real-time Execution</p>
                      <p className="text-white/60 text-sm">
                        Workflows execute immediately when triggered
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <Label className="text-white">Max Concurrent Workflows</Label>
                    <Input
                      type="number"
                      defaultValue="10"
                      className="bg-white/5 border-amber-500/30 text-white mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Retry Failed Actions</Label>
                    <Select defaultValue="3">
                      <SelectTrigger className="bg-white/5 border-amber-500/30 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Never</SelectItem>
                        <SelectItem value="1">1 time</SelectItem>
                        <SelectItem value="3">3 times</SelectItem>
                        <SelectItem value="5">5 times</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}