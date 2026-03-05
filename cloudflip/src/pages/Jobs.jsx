
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, ListTodo, Plus, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import TaskKanbanBoard from "../components/jobs/TaskKanbanBoard";
import TaskFormModal from "../components/jobs/TaskFormModal";
import InteractiveTutorial from "../components/InteractiveTutorial";
import TeamActivityFeed from "../components/TeamActivityFeed";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-gray-100 text-gray-800"
};

export default function Jobs() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list or kanban
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.entities.Job.list('-scheduled_start'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedJob?.id],
    queryFn: () => selectedJob ? api.entities.Task.filter({ job_id: selectedJob.id }) : [],
    enabled: !!selectedJob
  });

  // Load team members
  useEffect(() => {
    const loadTeam = async () => {
      try {
        const users = await api.entities.User.list();
        setTeamMembers(users);
      } catch (error) {
        console.error("Failed to load team members:", error);
      }
    };
    loadTeam();
  }, []);

  // Auto-select first job if none selected
  useEffect(() => {
    if (!selectedJob && jobs.length > 0) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const user = await api.auth.me();
      return api.entities.Task.create({
        ...taskData,
        org_id: user.current_org_id
      });
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task created successfully!");
      
      // Send notification if assigned
      if (newTask.assigned_to) {
        sendTaskNotification(newTask, 'assigned');
      }
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Task.update(id, data),
    onSuccess: (updatedTask, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task updated successfully!");
      
      // Check if assignment changed or deadline approaching
      const originalTask = tasks.find(t => t.id === variables.id);
      if (originalTask?.assigned_to !== updatedTask.assigned_to && updatedTask.assigned_to) {
        sendTaskNotification(updatedTask, 'assigned');
      }
    }
  });

  const sendTaskNotification = async (task, type) => {
    // This would integrate with your notification system
    console.log(`Notification: Task ${type}`, task);
    // You could use api.integrations.Core.SendEmail here
  };

  const handleTaskSave = (taskData) => {
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, data: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskUpdate = (taskId, updates) => {
    updateTaskMutation.mutate({ id: taskId, data: updates });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <InteractiveTutorial page="kanban" />

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">Job <span className="text-amber-400">Management</span></h1>
            <p className="text-white/70 mt-1">Manage jobs and <span className="text-amber-400">track tasks</span></p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-white/60 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          Loading jobs...
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="p-8 text-center bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <Calendar className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
          <p className="text-white font-medium">No jobs scheduled</p>
          <p className="text-white/60 text-sm">Create a quote and convert it to a job to get started</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Jobs List Sidebar */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-lg font-semibold text-white px-2">Jobs</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {jobs.map(job => (
                <Card
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedJob?.id === job.id
                      ? 'bg-amber-500/20 border-amber-500'
                      : 'bg-[#0a1929]/60 border-amber-500/20 hover:border-amber-500/40'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-white font-medium text-sm line-clamp-2">
                        {job.title}
                      </h3>
                      <Badge className={statusColors[job.status]}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {job.scheduled_start && (
                      <div className="text-xs text-white/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(job.scheduled_start), 'MMM d, h:mm a')}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Team Activity for Selected Job */}
            {selectedJob && (
              <TeamActivityFeed 
                entityType="job" 
                entityId={selectedJob.id}
                limit={10}
              />
            )}
          </div>

          {/* Task Management Area */}
          <div className="lg:col-span-9 space-y-4">
            {selectedJob && (
              <>
                {/* Job Header */}
                <Card className="p-6 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                      {selectedJob.description && (
                        <p className="text-white/70 mt-1">{selectedJob.description}</p>
                      )}
                    </div>
                    <Badge className={statusColors[selectedJob.status]}>
                      {selectedJob.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedJob.scheduled_start && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-amber-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {format(new Date(selectedJob.scheduled_start), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-white/60">
                            {format(new Date(selectedJob.scheduled_start), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedJob.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 mt-1" />
                        <div>
                          <p className="text-sm text-white">
                            {selectedJob.address.street}
                          </p>
                          <p className="text-xs text-white/60">
                            {selectedJob.address.city}, {selectedJob.address.state}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedJob.assignees && selectedJob.assignees.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <p className="text-sm text-white/70">
                          {selectedJob.assignees.length} team member(s)
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Task Management */}
                <Card className="p-6 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-amber-400" />
                      <h3 className="text-xl font-bold text-white">
                        Tasks <span className="text-amber-400">({tasks.length})</span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex border border-amber-500/30 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className={viewMode === 'list' ? 'bg-amber-500/20 text-amber-400' : 'text-white/60'}
                        >
                          <ListTodo className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode('kanban')}
                          className={viewMode === 'kanban' ? 'bg-amber-500/20 text-amber-400' : 'text-white/60'}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedTask(null);
                          setShowTaskModal(true);
                        }}
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                        data-tutorial="add-task"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <ListTodo className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
                      <p className="text-white font-medium">No tasks yet</p>
                      <p className="text-white/60 text-sm">Break down this job into tasks to track progress</p>
                      <Button
                        onClick={() => {
                          setSelectedTask(null);
                          setShowTaskModal(true);
                        }}
                        className="mt-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Task
                      </Button>
                    </div>
                  ) : viewMode === 'kanban' ? (
                    <div data-tutorial="kanban-board">
                      <TaskKanbanBoard
                        tasks={tasks}
                        onTaskClick={handleTaskClick}
                        onTaskUpdate={handleTaskUpdate}
                        teamMembers={teamMembers}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <Card
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          className="p-4 bg-white/5 border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{task.title}</h4>
                              {task.description && (
                                <p className="text-white/60 text-sm mt-1 line-clamp-2">{task.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${
                                task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.priority}
                              </Badge>
                              <Badge className={`${
                                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        open={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        jobId={selectedJob?.id}
        onSave={handleTaskSave}
        teamMembers={teamMembers}
      />
    </div>
  );
}
