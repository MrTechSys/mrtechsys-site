import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Phone, 
  Mail, 
  Calendar, 
  CheckSquare,
  Loader2,
  TrendingUp,
  Zap,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const actionIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckSquare,
  demo: Calendar
};

const urgencyColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800 animate-pulse"
};

export default function AIActionSuggestions({ entityType, entityId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [engagementScore, setEngagementScore] = useState(null);

  useEffect(() => {
    if (entityId) {
      loadSuggestions();
      calculateEngagement();
    }
  }, [entityId]);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.functions.invoke('generateNextActionSuggestions', {
        entityType,
        entityId
      });

      if (response.data.success) {
        setSuggestions(response.data.suggestions || []);
      } else {
        setError('Failed to load suggestions');
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setError(error.message || 'Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const calculateEngagement = async () => {
    try {
      const params = {};
      if (entityType === 'lead') params.leadId = entityId;
      else if (entityType === 'contact') params.contactId = entityId;
      else if (entityType === 'deal') params.dealId = entityId;

      const response = await api.functions.invoke('calculateEngagementScore', params);

      if (response.data.success) {
        setEngagementScore(response.data);
      }
    } catch (error) {
      console.error('Failed to calculate engagement:', error);
      // Don't show error to user, engagement is optional
    }
  };

  const handleRefresh = () => {
    loadSuggestions();
    calculateEngagement();
    toast.success("Refreshing AI suggestions...");
  };

  const handleCreateFollowUp = async (sequenceType) => {
    try {
      toast.info("Creating automated follow-up sequence...");
      
      const response = await api.functions.invoke('autoFollowUpSequence', {
        entityType,
        entityId,
        sequenceType
      });

      if (response.data.success) {
        toast.success(`${response.data.actions_scheduled} follow-up actions scheduled!`);
      } else {
        toast.error("Failed to create sequence");
      }
    } catch (error) {
      console.error('Failed to create sequence:', error);
      toast.error(error.message || "Failed to create follow-up sequence");
    }
  };

  if (error && !engagementScore && suggestions.length === 0) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
          <p className="text-white/60 text-sm mb-3">AI features temporarily unavailable</p>
          <Button size="sm" onClick={handleRefresh} variant="outline" className="border-amber-500/30 text-amber-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Engagement Score Card */}
      {engagementScore && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Engagement Score
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                className="text-amber-400 hover:text-amber-300"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-4xl font-bold text-amber-400">
                {engagementScore.score}
              </div>
              <div className="flex-1">
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-3 rounded-full transition-all"
                    style={{ width: `${engagementScore.score}%` }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-1 capitalize">
                  {engagementScore.engagementLevel.replace('_', ' ')} engagement
                </p>
              </div>
            </div>

            {engagementScore.factors && engagementScore.factors.length > 0 && (
              <div className="space-y-2 text-xs">
                {engagementScore.factors.map((factor, idx) => (
                  <div key={idx} className="flex justify-between text-white/70">
                    <span>{factor.factor}</span>
                    <span className="font-medium">+{factor.impact}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-amber-500/20 flex gap-2">
              {engagementScore.engagementLevel === 'very_high' && (
                <Button 
                  size="sm" 
                  onClick={() => handleCreateFollowUp('hot_lead')}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold flex-1"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Hot Lead Sequence
                </Button>
              )}
              {(engagementScore.engagementLevel === 'low' || engagementScore.engagementLevel === 'medium') && (
                <Button 
                  size="sm" 
                  onClick={() => handleCreateFollowUp('cold_lead')}
                  variant="outline"
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-1"
                >
                  Re-engagement Sequence
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AI-Recommended Next Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/60 text-sm mb-3">No suggestions available</p>
              <Button size="sm" onClick={loadSuggestions} variant="outline" className="border-amber-500/30 text-amber-400">
                Generate Suggestions
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {suggestions.map((suggestion, idx) => {
                  const Icon = actionIcons[suggestion.type] || CheckSquare;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-white/5 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium text-sm">{suggestion.action}</h4>
                            <Badge className={urgencyColors[suggestion.urgency]} style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {suggestion.urgency}
                            </Badge>
                          </div>
                          <p className="text-white/60 text-xs mb-2">{suggestion.reason}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50 capitalize">
                              📅 {suggestion.timeline.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-amber-400">
                              {suggestion.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}

          {suggestions.length > 0 && (
            <Button 
              onClick={() => handleCreateFollowUp('new_lead')}
              className="w-full mt-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Automated Follow-Up
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}