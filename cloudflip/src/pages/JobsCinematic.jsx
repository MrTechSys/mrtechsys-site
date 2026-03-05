import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Plus,
  Zap,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  LayoutGrid,
  List,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const statusConfig = {
  created: { label: 'Created', color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  in_progress: { label: 'In Progress', color: 'from-amber-500/20 to-amber-600/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  completed: { label: 'Completed', color: 'from-green-500/20 to-green-600/20', border: 'border-green-500/30', text: 'text-green-400' },
  billed: { label: 'Billed', color: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-400' }
};

export default function JobsCinematic() {
  const [user, setUser] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs-cinematic', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      return await api.entities.Job.filter({ org_id: currentOrg.id }, '-scheduled_start', 100);
    },
    enabled: !!currentOrg
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await api.entities.Job.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs-cinematic']);
      toast.success('Job updated');
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    updateJobMutation.mutate({
      id: draggableId,
      data: { status: newStatus }
    });
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const jobsByStatus = {
    created: filteredJobs.filter(j => j.status === 'created' || j.status === 'scheduled'),
    in_progress: filteredJobs.filter(j => j.status === 'in_progress'),
    completed: filteredJobs.filter(j => j.status === 'completed'),
    billed: filteredJobs.filter(j => j.status === 'billed')
  };

  const stats = {
    total: jobs.length,
    active: jobsByStatus.in_progress.length,
    completed: jobsByStatus.completed.length,
    healthScore: jobs.length > 0 ? Math.round((jobsByStatus.completed.length / jobs.length) * 100) : 0
  };

  const renderJobCard = (job, provided, snapshot) => {
    const config = statusConfig[job.status] || statusConfig.created;
    
    return (
      <motion.div
        ref={provided?.innerRef}
        {...provided?.draggableProps}
        {...provided?.dragHandleProps}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`mb-3 ${snapshot?.isDragging ? 'opacity-50' : ''}`}
      >
        <Card className={`bg-gradient-to-br ${config.color} border ${config.border} hover:scale-[1.02] transition-all cursor-pointer group`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-semibold text-sm line-clamp-2 flex-1">
                {job.title}
              </h4>
              <Badge className={`${config.color} ${config.text} border-0 text-xs`}>
                {config.label}
              </Badge>
            </div>
            
            {job.description && (
              <p className="text-white/60 text-xs mb-3 line-clamp-2">{job.description}</p>
            )}

            <div className="flex items-center gap-3 text-xs">
              {job.scheduled_start && (
                <div className="flex items-center gap-1 text-white/70">
                  <Calendar className="w-3 h-3" />
                  {new Date(job.scheduled_start).toLocaleDateString()}
                </div>
              )}
              {job.assignees?.length > 0 && (
                <div className="flex items-center gap-1 text-white/70">
                  <Users className="w-3 h-3" />
                  {job.assignees.length}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
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
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-400" />
              Jobs <span className="text-amber-400">Command Center</span>
            </h1>
            <p className="text-white/60">Cinematic job management system</p>
          </div>
          <Button className="bg-gradient-to-r from-amber-600 to-amber-500">
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-white/60">Total Jobs</p>
                  </div>
                  <LayoutGrid className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.active}</p>
                    <p className="text-xs text-white/60">Active</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.completed}</p>
                    <p className="text-xs text-white/60">Completed</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.healthScore}%</p>
                    <p className="text-xs text-white/60">Health Score</p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="bg-white/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Job Board</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white/5 border-amber-500/30 text-white"
                />
                <div className="flex border border-amber-500/30 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className={viewMode === 'kanban' ? 'bg-amber-500/20 text-amber-400' : 'text-white/60'}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-amber-500/20 text-amber-400' : 'text-white/60'}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'kanban' ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(jobsByStatus).map(([status, statusJobs]) => {
                    const config = statusConfig[status];
                    return (
                      <div key={status} className="space-y-2">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${config.color} border ${config.border}`}>
                          <h3 className={`font-semibold ${config.text} flex items-center justify-between`}>
                            {config.label}
                            <Badge className="bg-white/20 text-white">{statusJobs.length}</Badge>
                          </h3>
                        </div>
                        <Droppable droppableId={status}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-[400px] p-2 rounded-lg ${
                                snapshot.isDraggingOver ? 'bg-white/10' : ''
                              }`}
                            >
                              {statusJobs.map((job, index) => (
                                <Draggable key={job.id} draggableId={job.id} index={index}>
                                  {(provided, snapshot) => renderJobCard(job, provided, snapshot)}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            ) : (
              <div className="space-y-2">
                {filteredJobs.map(job => renderJobCard(job, null, {}))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}