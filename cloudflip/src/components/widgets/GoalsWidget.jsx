import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, TrendingUp, CheckCircle, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function GoalsWidget() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ['personal-goals'],
    queryFn: async () => {
      const user = await api.auth.me();
      return api.entities.PersonalGoal.filter({ user_id: user.id, status: 'active' });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.PersonalGoal.create({
        ...data,
        user_id: user.id,
        org_id: user.current_org_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
      setShowForm(false);
      toast.success("Goal created!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.PersonalGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
      toast.success("Goal updated!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    createMutation.mutate({
      title: formData.get('title'),
      category: formData.get('category'),
      target_value: parseFloat(formData.get('target_value')),
      unit: formData.get('unit'),
      target_date: formData.get('target_date')
    });
  };

  const handleMarkComplete = (goal) => {
    updateMutation.mutate({
      id: goal.id,
      data: {
        status: 'completed',
        current_value: goal.target_value,
        completed_at: new Date().toISOString()
      }
    });
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            My Goals
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowForm(true)}
            className="text-amber-400 hover:bg-amber-500/10"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Target className="w-12 h-12 mx-auto mb-3 text-amber-400/30" />
            <p className="text-sm">No active goals</p>
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="mt-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
            >
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal, idx) => {
              const progress = (goal.current_value / goal.target_value) * 100;
              const daysLeft = goal.target_date 
                ? differenceInDays(new Date(goal.target_date), new Date())
                : null;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-white/5 rounded-lg border border-amber-500/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{goal.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-amber-500/20 text-amber-400 text-xs capitalize">
                          {goal.category}
                        </Badge>
                        {daysLeft !== null && (
                          <span className="text-xs text-white/60 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                          </span>
                        )}
                      </div>
                    </div>
                    {progress >= 100 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleMarkComplete(goal)}
                        className="text-green-400 hover:bg-green-500/10"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </span>
                      <span className="text-amber-400 font-semibold">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">New Personal Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Goal Title</Label>
                <Input
                  name="title"
                  placeholder="e.g., Close 10 deals this month"
                  required
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Category</Label>
                  <Select name="category" defaultValue="custom">
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="deals">Deals</SelectItem>
                      <SelectItem value="tasks">Tasks</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Target Date</Label>
                  <Input
                    type="date"
                    name="target_date"
                    required
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Target Value</Label>
                  <Input
                    type="number"
                    name="target_value"
                    placeholder="100"
                    required
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Unit</Label>
                  <Input
                    name="unit"
                    placeholder="deals, tasks, $, etc."
                    required
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-amber-500/30 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-amber-600 to-amber-500"
              >
                Create Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}