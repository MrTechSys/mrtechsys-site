import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CheckSquare,
  Plus,
  Filter,
  Calendar,
  User,
  Clock,
  Sparkles,
  AlertCircle,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const statusColumns = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-500/20' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500/20' },
  { id: 'review', label: 'Review', color: 'bg-amber-500/20' },
  { id: 'done', label: 'Done', color: 'bg-green-500/20' }
];

const priorityColors = {
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400'
};

export default function TaskManagement() {
  const [user, setUser] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', user?.current_org_id],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      return await api.entities.Task.filter({
        org_id: user.current_org_id
      }, '-created_date', 200);
    },
    enabled: !!user?.current_org_id
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.current_org_id],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      return await api.entities.Project.filter({
        org_id: user.current_org_id
      });
    },
    enabled: !!user?.current_org_id
  });

  // Create/Update task
  const saveTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      if (editingTask) {
        return await api.entities.Task.update(editingTask.id, taskData);
      } else {
        return await api.entities.Task.create({
          org_id: user.current_org_id,
          created_by: user.id,
          ...taskData
        });
      }
    },
    onSuccess: (savedTask) => {
      queryClient.invalidateQueries(['tasks']);
      setShowTaskModal(false);
      setEditingTask(null);
      
      // Trigger AI routing for new tasks
      if (!editingTask && !savedTask.assigned_to) {
        aiRouteTaskMutation.mutate(savedTask.id);
      }
      
      toast.success(editingTask ? 'Task updated!' : 'Task created!');
    }
  });

  // AI task routing
  const aiRouteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const { data } = await api.functions.invoke('aiTaskRouter', {
        taskId,
        orgId: user.current_org_id
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.auto_assigned) {
        toast.success(`Task auto-assigned to ${data.recommendation.recommended_user_name}!`);
        queryClient.invalidateQueries(['tasks']);
      }
    }
  });

  // Update task status via drag-and-drop
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      return await api.entities.Task.update(taskId, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    
    updateTaskStatusMutation.mutate({ taskId, newStatus });
  };

  const filteredTasks = filterPriority === 'all' 
    ? tasks 
    : tasks.filter(t => t.priority === filterPriority);

  const groupedTasks = statusColumns.reduce((acc, col) => {
    acc[col.id] = filteredTasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-cyan-400" />
              Task <span className="text-cyan-400">Management</span>
            </h1>
            <p className="text-white/60">Organize work with AI-powered task routing</p>
          </div>
          <Button
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }}
            className="bg-gradient-to-r from-cyan-600 to-cyan-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {statusColumns.map(col => (
            <Card key={col.id} className={`${col.color} border-white/10`}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">{col.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {groupedTasks[col.id]?.length || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'low', 'medium', 'high', 'urgent'].map(priority => (
            <Button
              key={priority}
              onClick={() => setFilterPriority(priority)}
              variant={filterPriority === priority ? 'default' : 'outline'}
              size="sm"
              className={filterPriority === priority ? '' : 'border-white/10 text-white/70'}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Button>
          ))}
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statusColumns.map(column => (
              <div key={column.id}>
                <div className="mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    {column.label}
                    <Badge className={column.color}>
                      {groupedTasks[column.id]?.length || 0}
                    </Badge>
                  </h3>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 min-h-[400px]"
                    >
                      <AnimatePresence>
                        {(groupedTasks[column.id] || []).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                <Card
                                  className="bg-[#0a1929]/60 backdrop-blur border-white/10 hover:border-cyan-500/30 cursor-pointer transition-all"
                                  onClick={() => {
                                    setEditingTask(task);
                                    setShowTaskModal(true);
                                  }}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="text-white font-medium text-sm">{task.title}</h4>
                                      <Badge className={priorityColors[task.priority]}>
                                        {task.priority}
                                      </Badge>
                                    </div>
                                    
                                    {task.description && (
                                      <p className="text-white/60 text-xs mb-2 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-white/50">
                                      {task.assigned_to_name && (
                                        <div className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          <span>{task.assigned_to_name}</span>
                                        </div>
                                      )}
                                      {task.due_date && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                      {task.ai_routed && (
                                        <Sparkles className="w-3 h-3 text-purple-400" title="AI-routed" />
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Task Modal */}
        <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
          <DialogContent className="bg-[#0a1929] border-cyan-500/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <TaskForm
              task={editingTask}
              projects={projects}
              onSubmit={(data) => saveTaskMutation.mutate(data)}
              onCancel={() => setShowTaskModal(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function TaskForm({ task, projects, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(task || {
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    project_id: ''
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Task title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        className="bg-white/5 border-cyan-500/30 text-white"
      />
      
      <Textarea
        placeholder="Task description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        className="bg-white/5 border-cyan-500/30 text-white"
        rows={4}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-white/60 text-sm mb-1 block">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
            className="w-full p-2 bg-white/5 border border-cyan-500/30 rounded text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1 block">Due Date</label>
          <Input
            type="date"
            value={formData.due_date || ''}
            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            className="bg-white/5 border-cyan-500/30 text-white"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="border-white/10 text-white/70">
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(formData)}
          disabled={!formData.title}
          className="bg-gradient-to-r from-cyan-600 to-cyan-500"
        >
          {task ? 'Update' : 'Create'} Task
        </Button>
      </div>
    </div>
  );
}