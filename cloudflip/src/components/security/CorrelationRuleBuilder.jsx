import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Loader2,
  Zap,
  Play,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CorrelationRuleBuilder() {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['correlation-rules'],
    queryFn: async () => {
      try {
        const currentUser = await api.auth.me();
        if (!currentUser?.current_org_id) return [];
        
        const allRules = await api.entities.CorrelationRule.list('-created_date');
        return allRules.filter(r => r.org_id === currentUser.current_org_id);
      } catch (err) {
        console.error('Error fetching correlation rules:', err);
        return [];
      }
    },
    retry: 1
  });

  const runEngineMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('correlationEngine', {});
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Correlation scan complete: ${data.correlations_found} patterns detected`);
      queryClient.invalidateQueries({ queryKey: ['correlation-rules'] });
    },
    onError: (err) => {
      console.error('Correlation engine error:', err);
      toast.error("Scan failed - check console for details");
    }
  });

  const activeRules = rules.filter(r => r.is_active);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Activity className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-2">{activeRules.length}</p>
            <p className="text-white/60 text-xs">Rules Running</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Matches</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-400 mt-2">
              {rules.reduce((sum, r) => sum + (r.match_count || 0), 0)}
            </p>
            <p className="text-white/60 text-xs">Correlations Found</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
          <CardContent className="p-4">
            <Button
              onClick={() => runEngineMutation.mutate()}
              disabled={runEngineMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {runEngineMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Engine
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Predefined Rules */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Correlation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
              <p className="text-red-400">Error loading rules</p>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 mb-2">No correlation rules configured</p>
              <p className="text-white/40 text-sm">Rules correlate events to detect complex attack patterns</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{rule.name}</h3>
                        <Badge className={
                          rule.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          rule.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }>
                          {rule.severity}
                        </Badge>
                        {rule.is_active && (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/70 text-sm">{rule.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                        <span>{rule.event_pattern?.length || 0} event patterns</span>
                        <span>•</span>
                        <span>{rule.threshold?.occurrences || 1}x threshold</span>
                        <span>•</span>
                        <span>{rule.threshold?.time_window_minutes || 5}min window</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-400">{rule.match_count || 0}</p>
                      <p className="text-white/60 text-xs">Matches</p>
                      {rule.last_matched_at && (
                        <p className="text-white/40 text-xs mt-1">
                          {format(new Date(rule.last_matched_at), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}