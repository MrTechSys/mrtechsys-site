
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Map,
  Layers,
  Zap,
  Plus,
  Calendar,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const statusColors = {
  planning: 'bg-gray-500/20 text-gray-400',
  active: 'bg-blue-500/20 text-blue-400',
  on_track: 'bg-green-500/20 text-green-400',
  at_risk: 'bg-yellow-500/20 text-yellow-400',
  blocked: 'bg-red-500/20 text-red-400',
  completed: 'bg-green-500/20 text-green-400'
};

const severityColors = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-blue-500/20 text-blue-400',
};

export default function DevOpsPlanner() {
  const [user, setUser] = useState(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [selectedEpic, setSelectedEpic] = useState(null);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showEpicModal, setShowEpicModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [viewMode, setViewMode] = useState('roadmaps');
  const queryClient = useQueryClient();
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiAction, setAIAction] = useState(null);
  const [aiResult, setAIResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: roadmaps = [] } = useQuery({
    queryKey: ['devops-roadmaps'],
    queryFn: () => api.entities.DevOpsRoadmap.list('-created_date'),
    enabled: !!user
  });

  const { data: epics = [] } = useQuery({
    queryKey: ['devops-epics', selectedRoadmap?.id],
    queryFn: () => selectedRoadmap
      ? api.entities.DevOpsEpic.filter({ roadmap_id: selectedRoadmap.id })
      : api.entities.DevOpsEpic.list('-created_date'),
    enabled: !!user
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ['devops-sprints', selectedEpic?.id],
    queryFn: () => selectedEpic
      ? api.entities.DevOpsSprint.filter({ epic_id: selectedEpic.id })
      : api.entities.DevOpsSprint.list('-start_date', 20),
    enabled: !!user
  });

  const createRoadmapMutation = useMutation({
    mutationFn: async (data) => api.entities.DevOpsRoadmap.create({
      ...data,
      org_id: user.current_org_id,
      owner_id: user.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devops-roadmaps'] });
      setShowRoadmapModal(false);
      toast.success('Roadmap created!');
    }
  });

  const createEpicMutation = useMutation({
    mutationFn: async (data) => api.entities.DevOpsEpic.create({
      ...data,
      org_id: user.current_org_id,
      owner_id: user.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devops-epics'] });
      setShowEpicModal(false);
      toast.success('Epic created!');
    }
  });

  const createSprintMutation = useMutation({
    mutationFn: async (data) => api.entities.DevOpsSprint.create({
      ...data,
      org_id: user.current_org_id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devops-sprints'] });
      setShowSprintModal(false);
      toast.success('Sprint created!');
    }
  });

  const handleAIGenerateEpics = async () => {
    if (!selectedRoadmap) {
      toast.error('Please select a roadmap first');
      return;
    }

    setLoadingAI(true);
    setAIAction('generate_epics');
    setAIResult(null); // Clear previous results

    try {
      const { data } = await api.functions.invoke('devopsPlannerAI', {
        action: 'generate_epics',
        roadmapId: selectedRoadmap.id
      });

      setAIResult(data);
      setShowAIAssistant(true);
      toast.success(`Generated ${data.epics.length} epic suggestions!`);
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('AI generation failed');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAISuggestSprints = async () => {
    if (!selectedEpic) {
      toast.error('Please select an epic first');
      return;
    }

    setLoadingAI(true);
    setAIAction('suggest_sprints');
    setAIResult(null); // Clear previous results

    try {
      const { data } = await api.functions.invoke('devopsPlannerAI', {
        action: 'suggest_sprints',
        epicId: selectedEpic.id,
        context: { teamVelocity: 30 } // Example context
      });

      setAIResult(data);
      setShowAIAssistant(true);
      toast.success(`Generated ${data.sprints.length} sprint suggestions!`);
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('AI generation failed');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAIOptimizeCapacity = async () => {
    setLoadingAI(true);
    setAIAction('optimize_capacity');
    setAIResult(null); // Clear previous results

    try {
      // In a real scenario, this would send relevant data (e.g., historical sprint data)
      const { data } = await api.functions.invoke('devopsPlannerAI', {
        action: 'optimize_capacity',
        context: {
          sprints: sprints.map(s => ({
            id: s.id,
            completed_points: s.capacity?.completed_points || 0,
            total_points: s.capacity?.total_points || 0,
            duration_weeks: s.duration_weeks,
            status: s.status
          })),
          teamMembers: 5 // Example context
        }
      });

      setAIResult(data);
      setShowAIAssistant(true);
      toast.success('Capacity optimization complete!');
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Optimization failed');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCreateEpicFromAI = async (epicData) => {
    try {
      await api.entities.DevOpsEpic.create({
        org_id: user.current_org_id,
        roadmap_id: selectedRoadmap.id,
        epic_id: `EPIC-${Date.now()}`,
        title: epicData.title,
        description: epicData.description,
        business_value: epicData.business_value,
        priority: epicData.priority,
        story_points: epicData.story_points,
        owner_id: user.id,
        status: 'planning' // Default status for newly created epics
      });

      queryClient.invalidateQueries({ queryKey: ['devops-epics'] });
      toast.success('Epic created from AI suggestion!');
    } catch (error) {
      console.error('Failed to create epic:', error);
      toast.error('Failed to create epic');
    }
  };

  const handleCreateSprintFromAI = async (sprintData) => {
    try {
      const start = new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + (sprintData.duration_weeks * 7));

      const totalPoints = sprintData.user_stories?.reduce((sum, s) => sum + (s.points || 0), 0) || 0;

      await api.entities.DevOpsSprint.create({
        org_id: user.current_org_id,
        sprint_id: `SPRINT-${Date.now()}`,
        name: sprintData.name,
        epic_id: selectedEpic?.id,
        goal: sprintData.goal,
        duration_weeks: sprintData.duration_weeks,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        capacity: {
          total_points: totalPoints,
          committed_points: totalPoints,
          completed_points: 0
        },
        user_stories: sprintData.user_stories || [],
        status: 'planning'
      });

      queryClient.invalidateQueries({ queryKey: ['devops-sprints'] });
      toast.success('Sprint created from AI suggestion!');
    } catch (error) {
      console.error('Failed to create sprint:', error);
      toast.error('Failed to create sprint');
    }
  };

  const handleRoadmapSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    createRoadmapMutation.mutate({
      name: formData.get('name'),
      description: formData.get('description'),
      vision: formData.get('vision'),
      time_horizon: formData.get('time_horizon'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      themes: [formData.get('theme')]
    });
  };

  const handleEpicSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    createEpicMutation.mutate({
      roadmap_id: selectedRoadmap?.id || formData.get('roadmap_id'),
      epic_id: `EPIC-${Date.now()}`,
      title: formData.get('title'),
      description: formData.get('description'),
      business_value: formData.get('business_value'),
      priority: formData.get('priority'),
      start_date: formData.get('start_date'),
      target_date: formData.get('target_date'),
      story_points: parseInt(formData.get('story_points')) || 0
    });
  };

  const handleSprintSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    createSprintMutation.mutate({
      sprint_id: `SPRINT-${Date.now()}`,
      name: formData.get('name'),
      epic_id: selectedEpic?.id,
      goal: formData.get('goal'),
      duration_weeks: parseInt(formData.get('duration_weeks')) || 2,
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      capacity: {
        total_points: parseInt(formData.get('total_points')) || 0,
        committed_points: 0,
        completed_points: 0
      }
    });
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8" style={{
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Map className="w-8 h-8 text-[#f4d35e]" />
              DevOps <span className="text-[#f4d35e]">Planner</span>
            </h1>
            <p className="text-white/70 mt-1">Manage roadmaps, epics, and sprints with AI assistance</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => { setShowAIAssistant(true); setAIResult(null); setAIAction(null); }}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button
              onClick={() => setShowRoadmapModal(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Roadmap
            </Button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={viewMode === 'roadmaps' ? 'default' : 'outline'}
          onClick={() => setViewMode('roadmaps')}
          className={viewMode === 'roadmaps' ? '' : 'border-[#f4d35e]/30 text-white hover:bg-white/10'}
        >
          <Map className="w-4 h-4 mr-2" />
          Roadmaps
        </Button>
        <Button
          variant={viewMode === 'epics' ? 'default' : 'outline'}
          onClick={() => setViewMode('epics')}
          className={viewMode === 'epics' ? '' : 'border-[#f4d35e]/30 text-white hover:bg-white/10'}
        >
          <Layers className="w-4 h-4 mr-2" />
          Epics
        </Button>
        <Button
          variant={viewMode === 'sprints' ? 'default' : 'outline'}
          onClick={() => setViewMode('sprints')}
          className={viewMode === 'sprints' ? '' : 'border-[#f4d35e]/30 text-white hover:bg-white/10'}
        >
          <Zap className="w-4 h-4 mr-2" />
          Sprints
        </Button>
      </div>

      {/* Roadmaps View */}
      {viewMode === 'roadmaps' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {roadmaps.map((roadmap) => (
            <motion.div
              key={roadmap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className="bg-white/5 border-[#f4d35e]/20 cursor-pointer hover:border-[#f4d35e]/40 transition-all"
                onClick={() => {
                  setSelectedRoadmap(roadmap);
                  setViewMode('epics');
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-xl">{roadmap.name}</CardTitle>
                      <p className="text-white/60 text-sm mt-1">{roadmap.description}</p>
                    </div>
                    <Badge className={statusColors[roadmap.status]}>
                      {roadmap.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {roadmap.vision && (
                    <p className="text-white/70 text-sm mb-4 italic">"{roadmap.vision}"</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Progress</span>
                      <span className="text-[#f4d35e] font-bold">{roadmap.progress_pct}%</span>
                    </div>
                    <Progress value={roadmap.progress_pct} className="h-2" />

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                      <div>
                        <p className="text-white/50 text-xs">Epics</p>
                        <p className="text-white font-semibold">{roadmap.epic_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Sprints</p>
                        <p className="text-white font-semibold">{roadmap.sprint_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Timeline</p>
                        <p className="text-white font-semibold capitalize">{roadmap.time_horizon?.replace('_', ' ')}</p>
                      </div>
                    </div>

                    {roadmap.themes && (
                      <div className="flex gap-1 flex-wrap pt-2">
                        {roadmap.themes.map(theme => (
                          <Badge key={theme} variant="outline" className="text-xs">
                            {theme.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Epics View */}
      {viewMode === 'epics' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              {selectedRoadmap && (
                <h2 className="text-xl font-semibold text-white">
                  Epics for: <span className="text-[#f4d35e]">{selectedRoadmap.name}</span>
                </h2>
              )}
            </div>
            <div className="flex gap-2">
              {selectedRoadmap && (
                <Button
                  onClick={handleAIGenerateEpics}
                  disabled={loadingAI}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generate
                </Button>
              )}
              <Button
                onClick={() => setShowEpicModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Epic
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {epics.map((epic) => (
              <motion.div
                key={epic.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card
                  className="bg-white/5 border-[#f4d35e]/20 cursor-pointer hover:border-[#f4d35e]/40 transition-all"
                  onClick={() => {
                    setSelectedEpic(epic);
                    setViewMode('sprints');
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        {epic.epic_id}
                      </Badge>
                      <Badge className={statusColors[epic.status]}>
                        {epic.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">{epic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/60 text-sm mb-3">{epic.description}</p>

                    {epic.business_value && (
                      <div className="p-2 bg-green-500/10 rounded border border-green-500/30 mb-3">
                        <p className="text-green-400 text-xs font-semibold">Value:</p>
                        <p className="text-white/70 text-xs">{epic.business_value}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-white/50 mb-1">Priority</p>
                        <Badge className={severityColors[epic.priority] || 'bg-gray-500/20 text-gray-400'}>
                          {epic.priority}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-white/50 mb-1">Story Points</p>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-semibold">{epic.completed_points || 0}</span>
                          <span className="text-white/50">/</span>
                          <span className="text-white/70">{epic.story_points || 0}</span>
                        </div>
                      </div>
                    </div>

                    {epic.story_points > 0 && (
                      <div className="mt-3">
                        <Progress
                          value={(epic.completed_points / epic.story_points) * 100}
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sprints View */}
      {viewMode === 'sprints' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              {selectedEpic && (
                <h2 className="text-xl font-semibold text-white">
                  Sprints for: <span className="text-[#f4d35e]">{selectedEpic.title}</span>
                </h2>
              )}
            </div>
            <div className="flex gap-2">
              {selectedEpic && (
                <Button
                  onClick={handleAISuggestSprints}
                  disabled={loadingAI}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Suggest
                </Button>
              )}
              <Button
                onClick={handleAIOptimizeCapacity}
                disabled={loadingAI}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Target className="w-4 h-4 mr-2" />
                Optimize Capacity
              </Button>
              <Button
                onClick={() => setShowSprintModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Sprint
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {sprints.map((sprint) => (
              <Card key={sprint.id} className="bg-white/5 border-[#f4d35e]/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {sprint.sprint_id}
                        </Badge>
                        <Badge className={statusColors[sprint.status]}>
                          {sprint.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-white">{sprint.name}</CardTitle>
                      {sprint.goal && (
                        <p className="text-white/60 text-sm mt-1">Goal: {sprint.goal}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs">Velocity</p>
                      <p className="text-2xl font-bold text-[#f4d35e]">{sprint.velocity || 0}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-white/50 text-xs mb-1">Start Date</p>
                      <p className="text-white text-sm">{new Date(sprint.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs mb-1">End Date</p>
                      <p className="text-white text-sm">{new Date(sprint.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs mb-1">Capacity</p>
                      <p className="text-white text-sm">
                        {sprint.capacity?.completed_points || 0} / {sprint.capacity?.total_points || 0} pts
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs mb-1">Duration</p>
                      <p className="text-white text-sm">{sprint.duration_weeks} weeks</p>
                    </div>
                  </div>

                  {sprint.capacity && sprint.capacity.total_points > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/60">Sprint Progress</span>
                        <span className="text-[#f4d35e] font-semibold">
                          {((sprint.capacity.completed_points / sprint.capacity.total_points) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={(sprint.capacity.completed_points / sprint.capacity.total_points) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {sprint.user_stories && sprint.user_stories.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-gray-500/10 rounded">
                        <p className="text-gray-400 text-xs">To Do</p>
                        <p className="text-white font-bold">{sprint.user_stories.filter(s => s.status === 'todo').length}</p>
                      </div>
                      <div className="p-2 bg-blue-500/10 rounded">
                        <p className="text-blue-400 text-xs">In Progress</p>
                        <p className="text-white font-bold">{sprint.user_stories.filter(s => s.status === 'in_progress').length}</p>
                      </div>
                      <div className="p-2 bg-purple-500/10 rounded">
                        <p className="text-purple-400 text-xs">Review</p>
                        <p className="text-white font-bold">{sprint.user_stories.filter(s => s.status === 'review').length}</p>
                      </div>
                      <div className="p-2 bg-green-500/10 rounded">
                        <p className="text-green-400 text-xs">Done</p>
                        <p className="text-white font-bold">{sprint.user_stories.filter(s => s.status === 'done').length}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Assistant Modal - NEW */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="bg-[#0a1929] border-purple-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Planning Assistant
            </DialogTitle>
          </DialogHeader>

          {aiResult ? (
            <div className="space-y-4">
              {/* Generated Epics */}
              {aiAction === 'generate_epics' && aiResult.epics && (
                <div className="space-y-3">
                  <p className="text-white/70 text-sm">
                    AI generated {aiResult.epics.length} epics for roadmap: <strong className="text-[#f4d35e]">{selectedRoadmap?.name || 'N/A'}</strong>
                  </p>
                  {aiResult.epics.map((epic, idx) => (
                    <Card key={idx} className="bg-white/5 border-purple-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-lg">{epic.title}</h4>
                            <p className="text-white/60 text-sm mt-1">{epic.description}</p>
                            {epic.business_value && (
                              <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/30">
                                <p className="text-green-400 text-xs font-semibold">Value:</p>
                                <p className="text-white/70 text-xs">{epic.business_value}</p>
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Badge className={severityColors[epic.priority] || 'bg-gray-500/20'}>
                                {epic.priority}
                              </Badge>
                              <Badge variant="outline" className="bg-white/5 text-white border-white/20">{epic.story_points} points</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleCreateEpicFromAI(epic)}
                            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                          >
                            Create
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Suggested Sprints */}
              {aiAction === 'suggest_sprints' && aiResult.sprints && (
                <div className="space-y-3">
                  <p className="text-white/70 text-sm">
                    AI suggested {aiResult.sprints.length} sprints for epic: <strong className="text-[#f4d35e]">{selectedEpic?.title || 'N/A'}</strong>
                  </p>
                  {aiResult.sprints.map((sprint, idx) => (
                    <Card key={idx} className="bg-white/5 border-purple-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{sprint.name}</h4>
                            <p className="text-white/60 text-sm mt-1">Goal: {sprint.goal}</p>

                            {sprint.user_stories && sprint.user_stories.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-white/50 text-xs font-semibold">User Stories:</p>
                                {sprint.user_stories.map((story, si) => (
                                  <div key={si} className="p-2 bg-white/5 rounded border border-amber-500/10">
                                    <p className="text-white text-sm">{story.title}</p>
                                    <p className="text-white/60 text-xs mt-1">{story.description}</p>
                                    <Badge variant="outline" className="mt-1 text-xs bg-white/5 text-white border-white/20">
                                      {story.points} points
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleCreateSprintFromAI(sprint)}
                            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                          >
                            Create
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Capacity Optimization */}
              {aiAction === 'optimize_capacity' && aiResult.recommended_capacity !== undefined && (
                <div className="space-y-4">
                  <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30 p-6">
                    <div className="text-center mb-4">
                      <p className="text-white/60 text-sm mb-2">Recommended Sprint Capacity</p>
                      <p className="text-6xl font-bold text-green-400">{aiResult.recommended_capacity}</p>
                      <p className="text-white/60 text-sm">story points</p>
                    </div>
                    <p className="text-white/80 text-sm text-center">{aiResult.reasoning}</p>
                  </Card>

                  {aiResult.optimization_tips && (
                    <div className="p-4 bg-blue-500/10 rounded border border-blue-500/30">
                      <p className="text-blue-400 font-semibold text-sm mb-2">💡 Optimization Tips:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        {aiResult.optimization_tips.map((tip, i) => (
                          <li key={i} className="text-white/70 text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResult.historical_data && (
                    <div className="p-4 bg-white/5 rounded border border-amber-500/20">
                      <p className="text-white/60 text-xs mb-2">Historical Analysis:</p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-white/50 text-xs">Avg Velocity</p>
                          <p className="text-white font-bold">{aiResult.historical_data.average.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs">Trend</p>
                          <p className={`font-bold capitalize ${
                            aiResult.historical_data.trend === 'improving' ? 'text-green-400' :
                            aiResult.historical_data.trend === 'declining' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}>
                            {aiResult.historical_data.trend}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs">Data Points</p>
                          <p className="text-white font-bold">{aiResult.historical_data.sample_size}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-white/60 mb-6">Choose an AI action to get started</p>

              <div className="grid md:grid-cols-2 gap-3">
                <Button
                  onClick={handleAIGenerateEpics}
                  disabled={!selectedRoadmap || loadingAI}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                  {loadingAI && aiAction === 'generate_epics' ? 'Generating...' : (<><Layers className="w-4 h-4 mr-2" />Generate Epics</>)}
                </Button>
                <Button
                  onClick={handleAISuggestSprints}
                  disabled={!selectedEpic || loadingAI}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  {loadingAI && aiAction === 'suggest_sprints' ? 'Suggesting...' : (<><Zap className="w-4 h-4 mr-2" />Suggest Sprints</>)}
                </Button>
                <Button
                  onClick={handleAIOptimizeCapacity}
                  disabled={loadingAI}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  {loadingAI && aiAction === 'optimize_capacity' ? 'Optimizing...' : (<><Target className="w-4 h-4 mr-2" />Optimize Capacity</>)}
                </Button>
              </div>

              {(selectedRoadmap || selectedEpic) && (
                <div className="mt-4 p-3 bg-purple-500/10 rounded border border-purple-500/30">
                  <p className="text-purple-400 text-sm">
                    {selectedRoadmap && `📍 Roadmap: ${selectedRoadmap.name}`}
                    {selectedEpic && ` → Epic: ${selectedEpic.title}`}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAIAssistant(false);
                setAIResult(null);
                setAIAction(null);
              }}
              className="border-[#f4d35e]/30 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Roadmap Modal */}
      <Dialog open={showRoadmapModal} onOpenChange={setShowRoadmapModal}>
        <DialogContent className="bg-[#0a1929] border-[#f4d35e]/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Roadmap</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRoadmapSubmit}>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Roadmap Name *</Label>
                <Input name="name" required className="bg-white/5 border-[#f4d35e]/30 text-white" />
              </div>
              <div>
                <Label className="text-white">Vision Statement</Label>
                <Textarea name="vision" rows={2} className="bg-white/5 border-[#f4d35e]/30 text-white" />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Textarea name="description" rows={3} className="bg-white/5 border-[#f4d35e]/30 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Start Date *</Label>
                  <Input type="date" name="start_date" required className="bg-white/5 border-[#f4d35e]/30 text-white" />
                </div>
                <div>
                  <Label className="text-white">End Date *</Label>
                  <Input type="date" name="end_date" required className="bg-white/5 border-[#f4d35e]/30 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Time Horizon</Label>
                  <Select name="time_horizon" defaultValue="quarterly">
                    <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="multi_year">Multi-Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Primary Theme</Label>
                  <Select name="theme" defaultValue="performance">
                    <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="scalability">Scalability</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="observability">Observability</SelectItem>
                      <SelectItem value="cost_optimization">Cost Optimization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowRoadmapModal(false)} className="border-[#f4d35e]/30 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
                Create Roadmap
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Epic Modal */}
      <Dialog open={showEpicModal} onOpenChange={setShowEpicModal}>
        <DialogContent className="bg-[#0a1929] border-[#f4d35e]/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Epic</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEpicSubmit}>
            <div className="space-y-4">
              {!selectedRoadmap && (
                <div>
                  <Label className="text-white">Roadmap *</Label>
                  <Select name="roadmap_id" required>
                    <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                      <SelectValue placeholder="Select roadmap" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                      {roadmaps.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-white">Epic Title *</Label>
                <Input name="title" required className="bg-white/5 border-[#f4d35e]/30 text-white" />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Textarea name="description" rows={3} className="bg-white/5 border-[#f4d35e]/30 text-white" />
              </div>
              <div>
                <Label className="text-white">Business Value</Label>
                <Textarea name="business_value" rows={2} placeholder="What business value does this deliver?" className="bg-white/5 border-[#f4d35e]/30 text-white" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Story Points</Label>
                  <Input type="number" name="story_points" defaultValue="0" min="0" className="bg-white/5 border-[#f4d35e]/30 text-white" />
                </div>
                <div>
                  <Label className="text-white">Target Date</Label>
                  <Input type="date" name="target_date" className="bg-white/5 border-[#f4d35e]/30 text-white" />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowEpicModal(false)} className="border-[#f4d35e]/30 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold">
                Create Epic
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Sprint Modal */}
      <Dialog open={showSprintModal} onOpenChange={setShowSprintModal}>
        <DialogContent className="bg-[#0a1929] border-[#f4d35e]/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Sprint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSprintSubmit}>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Sprint Name *</Label>
                <Input name="name" required placeholder="Sprint 1 - API Performance" className="bg-white/5 border-[#f4d35e]/30 text-white" />
              </div>
              <div>
                <Label className="text-white">Sprint Goal</Label>
                <Textarea name="goal" rows={2} placeholder="Improve API latency by 30%" className="bg-white/5 border-[#f4d35e]/30 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Start Date *</Label>
                  <Input type="date" name="start_date" required className="bg-white/5 border-[#f4d35e]/30 text-white" />
                </div>
                <div>
                  <Label className="text-white">End Date *</Label>
                  <Input type="date" name="end_date" required className="bg-white/5 border-[#f4d35e]/30 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Duration (weeks)</Label>
                  <Input type="number" name="duration_weeks" defaultValue="2" min="1" max="4" className="bg-white/5 border-[#f4d35e]/30 text-white" />
                </div>
                <div>
                  <Label className="text-white">Total Capacity (points)</Label>
                  <Input type="number" name="total_points" defaultValue="40" min="0" className="bg-white/5 border-[#f4d35e]/30 text-white" />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowSprintModal(false)} className="border-[#f4d35e]/30 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold">
                Create Sprint
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
