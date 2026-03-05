import React from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Circle } from "lucide-react";
import { toast } from "sonner";

export default function QuickTasksWidget({ limit = 5 }) {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['quick-tasks-widget', limit],
    queryFn: async () => {
      const user = await api.auth.me();
      return api.entities.Task.filter(
        { 
          org_id: user.current_org_id,
          status: { $in: ['todo', 'in_progress'] }
        },
        '-created_date',
        limit
      );
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-tasks-widget'] });
      toast.success("Task updated!");
    }
  });

  const toggleTask = (task) => {
    updateMutation.mutate({
      id: task.id,
      data: {
        status: task.status === 'completed' ? 'todo' : 'completed',
        completed_at: task.status === 'completed' ? null : new Date().toISOString()
      }
    });
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-amber-400" />
          Quick Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-white/60 text-sm text-center py-4">All caught up! 🎉</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => toggleTask(task)}
              >
                <Checkbox
                  checked={task.status === 'completed'}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.status === 'completed' ? 'text-white/50 line-through' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.priority && (
                    <span className={`text-xs ${
                      task.priority === 'urgent' ? 'text-red-400' :
                      task.priority === 'high' ? 'text-orange-400' :
                      'text-white/50'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}