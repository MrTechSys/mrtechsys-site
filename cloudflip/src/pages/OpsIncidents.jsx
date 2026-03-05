
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  AlertCircle,
  Activity,
  Shield,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function OpsIncidents() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [expandedIncidents, setExpandedIncidents] = useState(new Set());
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [runningTriage, setRunningTriage] = useState(null);

  const [newIncident, setNewIncident] = useState({
    service_id: '',
    severity: 'sev3',
    title: '',
    summary: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents', filterSeverity, filterStatus],
    queryFn: () => {
      const filters = { org_id: user.current_org_id };
      if (filterSeverity !== 'all') filters.severity = filterSeverity;
      if (filterStatus !== 'all') filters.status = filterStatus;
      return api.entities.Incident.filter(filters, '-opened_at');
    },
    enabled: !!user
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.entities.Service.filter({ org_id: user.current_org_id }),
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: async (incidentData) => {
      const incidentId = `INC-${Date.now()}`;
      return await api.entities.Incident.create({
        org_id: user.current_org_id,
        incident_id: incidentId,
        opened_by: user.full_name,
        opened_at: new Date().toISOString(),
        timeline: [{
          timestamp: new Date().toISOString(),
          event: 'Incident created',
          author: user.full_name
        }],
        ...incidentData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setShowCreateDialog(false);
      setNewIncident({ service_id: '', severity: 'sev3', title: '', summary: '' });
      toast.success('Incident created');
    },
    onError: () => {
      toast.error('Failed to create incident');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const incident = incidents.find(i => i.id === id);
      const updatedTimeline = [
        ...(incident.timeline || []),
        {
          timestamp: new Date().toISOString(),
          event: `Status changed to ${status}`,
          author: user.full_name
        }
      ];

      return await api.entities.Incident.update(id, {
        status,
        timeline: updatedTimeline,
        ...(status === 'closed' ? { closed_at: new Date().toISOString() } : {})
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Status updated');
    }
  });

  const handleRunTriage = async (incidentId) => {
    setRunningTriage(incidentId);
    try {
      await api.functions.invoke('aiIncidentTriage', {
        incidentId,
        orgId: user.current_org_id
      });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('AI triage completed');
    } catch (error) {
      toast.error('Triage failed');
      console.error(error);
    } finally {
      setRunningTriage(null);
    }
  };

  const handleToggleExpand = (incidentId) => {
    const newExpanded = new Set(expandedIncidents);
    if (newExpanded.has(incidentId)) {
      newExpanded.delete(incidentId);
    } else {
      newExpanded.add(incidentId);
    }
    setExpandedIncidents(newExpanded);
  };

  const severityConfig = {
    sev1: { label: 'SEV1', color: 'bg-red-500/20 text-red-400', border: 'border-red-500/30', icon: AlertTriangle },
    sev2: { label: 'SEV2', color: 'bg-orange-500/20 text-orange-400', border: 'border-orange-500/30', icon: AlertCircle },
    sev3: { label: 'SEV3', color: 'bg-yellow-500/20 text-yellow-400', border: 'border-yellow-500/30', icon: AlertCircle },
    sev4: { label: 'SEV4', color: 'bg-blue-500/20 text-blue-400', border: 'border-blue-500/30', icon: Activity }
  };

  const statusConfig = {
    investigating: { label: 'Investigating', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    identified: { label: 'Identified', color: 'bg-blue-500/20 text-blue-400', icon: Eye },
    monitoring: { label: 'Monitoring', color: 'bg-purple-500/20 text-purple-400', icon: Activity },
    resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    closed: { label: 'Closed', color: 'bg-gray-500/20 text-gray-400', icon: XCircle }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-[#f4d35e]" />
              Incident <span className="text-[#f4d35e]">Management</span>
            </h1>
            <p className="text-white/70 mt-1">Track and resolve production incidents</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Filters & Stats */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-white/5 border-red-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              {incidents.filter(i => i.severity === 'sev1').length}
            </p>
            <p className="text-white/60 text-xs mt-1">SEV1</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-orange-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">
              {incidents.filter(i => i.severity === 'sev2').length}
            </p>
            <p className="text-white/60 text-xs mt-1">SEV2</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {incidents.filter(i => ['investigating', 'identified'].includes(i.status)).length}
            </p>
            <p className="text-white/60 text-xs mt-1">Active</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {incidents.filter(i => i.status === 'resolved').length}
            </p>
            <p className="text-white/60 text-xs mt-1">Resolved</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {incidents.length}
            </p>
            <p className="text-white/60 text-xs mt-1">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-40 bg-white/5 border-[#f4d35e]/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="sev1">SEV1</SelectItem>
            <SelectItem value="sev2">SEV2</SelectItem>
            <SelectItem value="sev3">SEV3</SelectItem>
            <SelectItem value="sev4">SEV4</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-white/5 border-[#f4d35e]/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="identified">Identified</SelectItem>
            <SelectItem value="monitoring">Monitoring</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.map((incident) => {
          const sevConfig = severityConfig[incident.severity];
          const statusConf = statusConfig[incident.status];
          const SevIcon = sevConfig.icon;
          const StatusIcon = statusConf.icon;
          const isExpanded = expandedIncidents.has(incident.id);

          return (
            <Card key={incident.id} className={`bg-white/5 border ${sevConfig.border}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${sevConfig.color} border-0`}>
                        <SevIcon className="w-3 h-3 mr-1" />
                        {sevConfig.label}
                      </Badge>
                      <Badge className={`${statusConf.color} border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConf.label}
                      </Badge>
                      <span className="text-white/60 text-sm">{incident.incident_id}</span>
                    </div>
                    <CardTitle className="text-white text-lg">{incident.title}</CardTitle>
                    <p className="text-white/60 text-sm mt-2">
                      Service: {incident.service_id} • Opened: {new Date(incident.opened_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {incident.status !== 'closed' && incident.status !== 'resolved' && (
                      <Button
                        size="sm"
                        onClick={() => handleRunTriage(incident.id)}
                        disabled={runningTriage === incident.id}
                        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                      >
                        {runningTriage === incident.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Triaging...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Triage
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleExpand(incident.id)}
                      className="text-white/60 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Summary</h4>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{incident.summary}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Root Cause & Mitigation */}
                  {incident.root_cause && (
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <h4 className="text-blue-400 font-medium mb-2">Root Cause</h4>
                      <p className="text-white/80 text-sm">{incident.root_cause}</p>
                    </div>
                  )}

                  {incident.mitigation && (
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                      <h4 className="text-green-400 font-medium mb-2">Mitigation</h4>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{incident.mitigation}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {incident.timeline && incident.timeline.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Timeline</h4>
                      <div className="space-y-2">
                        {incident.timeline.slice().reverse().map((event, idx) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#f4d35e] mt-2" />
                            <div className="flex-1">
                              <p className="text-white/80">{event.event}</p>
                              <p className="text-white/50 text-xs mt-1">
                                {new Date(event.timestamp).toLocaleString()} • {event.author}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    {incident.status !== 'closed' && (
                      <Select
                        value={incident.status}
                        onValueChange={(status) => updateStatusMutation.mutate({ id: incident.id, status })}
                      >
                        <SelectTrigger className="w-48 bg-white/5 border-[#f4d35e]/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="identified">Identified</SelectItem>
                          <SelectItem value="monitoring">Monitoring</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {incidents.length === 0 && (
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-white/60">No incidents found</p>
              <p className="text-white/40 text-sm mt-2">All systems operational</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Incident Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0a1929] border-[#f4d35e]/30">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Incident</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-white">Service</Label>
              <Select
                value={newIncident.service_id}
                onValueChange={(value) => setNewIncident({ ...newIncident, service_id: value })}
              >
                <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.service_id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Severity</Label>
              <Select
                value={newIncident.severity}
                onValueChange={(value) => setNewIncident({ ...newIncident, severity: value })}
              >
                <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                  <SelectItem value="sev1">SEV1 - Critical</SelectItem>
                  <SelectItem value="sev2">SEV2 - High</SelectItem>
                  <SelectItem value="sev3">SEV3 - Medium</SelectItem>
                  <SelectItem value="sev4">SEV4 - Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Title</Label>
              <Input
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                placeholder="Brief incident description"
                className="bg-white/5 border-[#f4d35e]/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Summary</Label>
              <Textarea
                value={newIncident.summary}
                onChange={(e) => setNewIncident({ ...newIncident, summary: e.target.value })}
                placeholder="Detailed incident description, symptoms, and initial observations..."
                rows={5}
                className="bg-white/5 border-[#f4d35e]/30 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-[#f4d35e]/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(newIncident)}
              disabled={createMutation.isPending || !newIncident.service_id || !newIncident.title}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              Create Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
