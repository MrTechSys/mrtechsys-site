import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Zap,
  TrendingUp,
  CheckCircle,
  Loader2,
  Plus,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AIWorkflowSuggestions() {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['workflow-suggestions'],
    queryFn: async () => {
      const response = await api.functions.invoke('suggestWorkflowTriggers', {});
      return response.data;
    },
    staleTime: 30 * 60 * 1000
  });

  const createFromSuggestion = useMutation({
    mutationFn: async (suggestion) => {
      const user = await api.auth.me();
      
      const workflow = await api.entities.NurtureWorkflow.create({
        org_id: user.current_org_id,
        name: suggestion.trigger_name,
        description: suggestion.description,
        trigger: {
          type: suggestion.trigger_conditions.event || 'manual',
          conditions: suggestion.trigger_conditions.filters || {}
        },
        steps: suggestion.recommended_steps.map((step, idx) => ({
          step_number: idx + 1,
          delay_hours: step.delay_hours,
          action_type: step.action_type,
          email_template: step.action_type === 'send_email' ? {
            subject: step.template.split('\n')[0] || `Step ${idx + 1}`,
            body: step.template,
            use_ai: true
          } : undefined,
          task_template: step.action_type === 'create_task' ? {
            title: step.step_name,
            description: step.template,
            priority: 'medium'
          } : undefined
        })),
        ai_optimization: {
          enabled: true,
          adjust_timing: true,
          personalize_content: true,
          optimize_send_time: true
        },
        is_active: true,
        created_by: user.id
      });

      return workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurture-workflows'] });
      setShowPreview(false);
      setSelectedSuggestion(null);
      toast.success('Workflow created from AI suggestion!');
    },
    onError: (error) => {
      toast.error('Failed to create workflow');
      console.error(error);
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-purple-500/30 backdrop-blur">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.success || !data?.suggestions) {
    return null;
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur border-2 border-purple-500/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AI Workflow Suggestions
            <Badge className="bg-purple-500/20 text-purple-400 ml-auto">
              {data.suggestions.length} Ideas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-white/5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm mb-1">{suggestion.trigger_name}</h4>
                  <p className="text-white/60 text-xs mb-2">{suggestion.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                      {suggestion.priority} priority
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">
                      {suggestion.recommended_steps.length} steps
                    </Badge>
                  </div>

                  <div className="text-xs text-white/50">
                    Expected: {suggestion.estimated_impact}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedSuggestion(suggestion);
                    setShowPreview(true);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shrink-0"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Create
                </Button>
              </div>

              {suggestion.expected_outcomes?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-white/50 mb-1">Expected Outcomes:</div>
                  <ul className="space-y-1">
                    {suggestion.expected_outcomes.slice(0, 2).map((outcome, i) => (
                      <li key={i} className="flex items-start gap-1 text-xs text-white/70">
                        <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-[#0a1929] border-purple-500/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Preview AI-Suggested Workflow
            </DialogTitle>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {selectedSuggestion.trigger_name}
                </h3>
                <p className="text-white/70 text-sm">{selectedSuggestion.description}</p>
              </div>

              <div>
                <h4 className="text-white/70 font-medium text-sm mb-3">Workflow Steps</h4>
                <div className="space-y-3">
                  {selectedSuggestion.recommended_steps.map((step, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{step.step_name}</span>
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {step.delay_hours}h delay
                            </Badge>
                          </div>
                          <div className="text-xs text-white/50 mt-1">{step.action_type}</div>
                        </div>
                      </div>
                      <p className="text-white/70 text-xs mt-2 pl-11">{step.template}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white/70 font-medium text-sm mb-2">Success Metrics</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedSuggestion.success_metrics?.map((metric, idx) => (
                    <div key={idx} className="p-2 bg-green-500/10 rounded border border-green-500/20 text-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
                      <span className="text-white/80 text-xs">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="border-purple-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createFromSuggestion.mutate(selectedSuggestion)}
              disabled={createFromSuggestion.isPending}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
            >
              {createFromSuggestion.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" /> Create Workflow</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}