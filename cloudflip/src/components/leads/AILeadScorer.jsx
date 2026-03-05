import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Loader2,
  ChevronRight,
  Flame,
  Wind,
  Snowflake
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AILeadScorer({ lead, onScoreUpdate }) {
  const [scoringDetails, setScoringDetails] = useState(lead?.ai_scoring || null);

  const scoreMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('aiLeadScoring', {
        leadId: lead.id
      });
      return data;
    },
    onSuccess: (data) => {
      setScoringDetails(data.ai_scoring);
      toast.success(`Lead scored: ${data.score}/100`);
      if (onScoreUpdate) {
        onScoreUpdate(data);
      }
    },
    onError: () => {
      toast.error("Scoring failed");
    }
  });

  const priorityConfig = {
    hot: {
      icon: Flame,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      label: '🔥 Hot Lead'
    },
    warm: {
      icon: Wind,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      label: '⚡ Warm Lead'
    },
    cold: {
      icon: Snowflake,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      label: '❄️ Cold Lead'
    }
  };

  const priority = scoringDetails?.priority || lead?.ai_scoring?.priority || 'cold';
  const config = priorityConfig[priority];
  const Icon = config?.icon;
  const score = lead?.score || 0;
  const conversionProb = scoringDetails?.conversion_probability || lead?.ai_scoring?.conversion_probability || 0;

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <Card className={`${config?.bg} border ${config?.border}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {Icon && <Icon className={`w-6 h-6 ${config?.color}`} />}
              <div>
                <p className={`font-bold ${config?.color}`}>{config?.label}</p>
                <p className="text-white/60 text-xs">AI Confidence: {(conversionProb * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${config?.color}`}>{score}</p>
              <p className="text-white/60 text-xs">Score</p>
            </div>
          </div>

          {/* Score Breakdown */}
          {scoringDetails?.scoring_factors && (
            <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
              <p className="text-white/70 text-xs font-semibold mb-2">Score Breakdown:</p>
              {scoringDetails.scoring_factors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">{factor.factor}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${config?.bg}`}
                        style={{ width: `${factor.value}%` }}
                      />
                    </div>
                    <span className="text-white text-xs font-semibold w-8 text-right">
                      {Math.round(factor.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={() => scoreMutation.mutate()}
            disabled={scoreMutation.isPending}
            size="sm"
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {scoreMutation.isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Scoring...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-2" />
                {scoringDetails ? 'Re-score with AI' : 'Score with AI'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Predicted Value & Recommendations */}
      {scoringDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-white/70 text-sm">Predicted Deal Value</span>
                </div>
                <span className="text-green-400 font-bold text-lg">
                  ${scoringDetails.predicted_value?.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {scoringDetails.recommended_actions && scoringDetails.recommended_actions.length > 0 && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-semibold text-sm">AI Recommendations:</span>
                </div>
                <div className="space-y-2">
                  {scoringDetails.recommended_actions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-xs">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}