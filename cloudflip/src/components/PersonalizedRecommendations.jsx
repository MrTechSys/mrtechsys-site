import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Target,
  Shield,
  CheckCircle,
  Clock,
  ArrowRight,
  X,
  Lightbulb,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const priorityColors = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30"
};

const actionIcons = {
  security: Shield,
  compliance: CheckCircle,
  sales: Target,
  task: Clock,
  insight: Lightbulb,
  optimization: TrendingUp,
  alert: AlertTriangle
};

export default function PersonalizedRecommendations({ compact = false }) {
  const [recommendations, setRecommendations] = useState([]);
  const [userInsights, setUserInsights] = useState(null);
  const [relevantDocs, setRelevantDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState([]);
  const location = useLocation();

  useEffect(() => {
    loadRecommendations();
  }, [location.pathname]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const user = await api.auth.me();
      const { data } = await api.functions.invoke('personalizedRecommendations', {
        userId: user.id,
        orgId: user.current_org_id,
        currentPage: location.pathname
      });

      setRecommendations(data?.recommendations || []);
      setUserInsights(data?.user_insights || null);
      setRelevantDocs(data?.relevant_docs || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
      setRelevantDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (index) => {
    setDismissed([...dismissed, index]);
  };

  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  const safeRelevantDocs = Array.isArray(relevantDocs) ? relevantDocs : [];
  const visibleRecommendations = safeRecommendations.filter((_, idx) => !dismissed.includes(idx));

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-8 h-8 text-purple-400 animate-pulse mx-auto mb-2" />
          <p className="text-white/70">Loading personalized recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  if (visibleRecommendations.length === 0) return null;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {visibleRecommendations.slice(0, 3).map((rec, idx) => {
              const Icon = actionIcons[rec?.action_type] || Target;
              return (
                <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-3">
                  <Icon className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{rec?.title || 'Recommendation'}</p>
                    <p className="text-white/60 text-xs mt-1">{rec?.call_to_action || ''}</p>
                  </div>
                  <Badge className={`${priorityColors[rec?.priority] || priorityColors.medium} text-xs flex-shrink-0`}>
                    {rec?.priority || 'medium'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Insights */}
      {userInsights && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {userInsights.productivity_score || 0}/100
                </div>
                <p className="text-white/60 text-xs">Productivity Score</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">Top Strength</p>
                <p className="text-white text-sm font-medium">{userInsights.top_strength || 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">Suggested Focus</p>
                <p className="text-amber-400 text-sm font-medium">{userInsights.suggested_focus || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Personalized for You
            </CardTitle>
            <Button
              onClick={loadRecommendations}
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {visibleRecommendations.map((rec, idx) => {
                const Icon = actionIcons[rec?.action_type] || Target;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-lg border ${priorityColors[rec?.priority] || priorityColors.medium}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{rec?.title || 'Recommendation'}</h4>
                            <Badge className={`${priorityColors[rec?.priority] || priorityColors.medium} text-xs`}>
                              {rec?.priority || 'medium'}
                            </Badge>
                          </div>
                          <p className="text-white/70 text-sm mb-3">{rec?.description || ''}</p>
                          
                          <div className="flex items-center gap-3">
                            {rec?.page_route && (
                              <Link to={createPageUrl(rec.page_route)}>
                                <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                                  {rec?.call_to_action || 'View Details'}
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            )}
                            {rec?.estimated_time_minutes && (
                              <span className="text-white/50 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ~{rec.estimated_time_minutes} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismiss(idx)}
                        className="text-white/40 hover:text-white/70 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Relevant Documentation */}
      {safeRelevantDocs.length > 0 && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Recommended Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {safeRelevantDocs.map((doc, idx) => (
                <a
                  key={idx}
                  href={doc?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-white/5 rounded-lg border border-blue-500/20 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{doc?.title || 'Document'}</p>
                      <p className="text-white/60 text-xs mt-1">{doc?.relevance_reason || ''}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs ml-2">
                      {doc?.category || 'general'}
                    </Badge>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}