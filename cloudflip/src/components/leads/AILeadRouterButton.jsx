import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Zap,
  UserPlus,
  Target,
  CheckCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

export default function AILeadRouterButton({ leadId, leadName, onSuccess }) {
  const [showResults, setShowResults] = useState(false);
  const [routingResult, setRoutingResult] = useState(null);

  const routeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('aiLeadRouter', { leadId });
      return data;
    },
    onSuccess: (data) => {
      setRoutingResult(data);
      setShowResults(true);
      toast.success(`Lead assigned to ${data.assigned_to.user_name}!`);
      onSuccess && onSuccess(data);
    },
    onError: (error) => {
      console.error('Routing error:', error);
      toast.error(error?.response?.data?.error || 'Routing failed');
    }
  });

  return (
    <>
      <Button
        onClick={() => routeMutation.mutate()}
        disabled={routeMutation.isPending}
        size="sm"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {routeMutation.isPending ? (
          <>
            <Zap className="w-4 h-4 mr-2 animate-spin" />
            Routing...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            AI Route
          </>
        )}
      </Button>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Lead Routed Successfully
            </DialogTitle>
          </DialogHeader>

          {routingResult && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {routingResult.assigned_to.user_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-bold">{routingResult.assigned_to.user_name}</p>
                    <p className="text-white/60 text-xs">{routingResult.assigned_to.user_email}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400">
                  <Target className="w-3 h-3 mr-1" />
                  Routing Score: {routingResult.routing_score}
                </Badge>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/60 text-xs font-semibold mb-2">Routing Factors:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/50">Lead Score:</span>
                    <span className="text-white ml-2">{routingResult.routing_factors.score}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Source:</span>
                    <span className="text-white ml-2 capitalize">{routingResult.routing_factors.source}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Value:</span>
                    <span className="text-white ml-2">${routingResult.routing_factors.expected_value}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Location:</span>
                    <span className="text-white ml-2">{routingResult.routing_factors.location}</span>
                  </div>
                </div>
              </div>

              {routingResult.alternatives?.length > 0 && (
                <div>
                  <p className="text-white/60 text-xs mb-2">Alternative matches:</p>
                  <div className="space-y-1">
                    {routingResult.alternatives.map((alt, idx) => (
                      <div key={idx} className="p-2 bg-white/5 rounded text-sm flex items-center justify-between">
                        <span className="text-white/70">{alt.user_name}</span>
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          Score: {alt.routing_score}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={() => setShowResults(false)}
            className="w-full bg-gradient-to-r from-green-600 to-green-500"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}