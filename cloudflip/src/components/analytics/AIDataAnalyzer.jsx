import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  RefreshCw,
  ChevronRight,
  Loader2,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const moduleOptions = [
  { value: 'sales', label: 'Sales Performance', icon: TrendingUp },
  { value: 'leads', label: 'Lead Generation', icon: Target },
  { value: 'operations', label: 'Operations', icon: CheckCircle },
  { value: 'finance', label: 'Financial Health', icon: TrendingUp }
];

const timeRangeOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' }
];

export default function AIDataAnalyzer({ defaultModule = 'sales', compact = false }) {
  const [selectedModule, setSelectedModule] = useState(defaultModule);
  const [timeRange, setTimeRange] = useState('30d');

  const { data: analysis, isLoading, refetch } = useQuery({
    queryKey: ['ai-analysis', selectedModule, timeRange],
    queryFn: async () => {
      const response = await api.functions.invoke('aiDataAnalyzer', {
        module: selectedModule,
        timeRange
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000
  });

  const safeAnalysis = analysis?.analysis || {};
  const keyTrends = safeAnalysis.key_trends || [];
  const anomalies = safeAnalysis.anomalies || [];
  const opportunities = safeAnalysis.opportunities || [];
  const predictions = safeAnalysis.predictions || {};
  const recommendations = safeAnalysis.recommendations || [];

  const severityColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  const impactColors = {
    high: 'text-green-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400'
  };

  return (
    <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-amber-500/30">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Data Analysis
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-40 bg-white/5 border-amber-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                {moduleOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 bg-white/5 border-amber-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                {timeRangeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
            <p className="text-white/60 text-sm">Analyzing your data...</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            {safeAnalysis.summary && (
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p className="text-white/90 leading-relaxed">{safeAnalysis.summary}</p>
              </div>
            )}

            {/* Key Trends */}
            {keyTrends.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Key Trends
                </h3>
                <div className="space-y-2">
                  {keyTrends.map((trend, idx) => {
                    const TrendIcon = trend?.direction === 'up' ? TrendingUp : 
                                      trend?.direction === 'down' ? TrendingDown : 
                                      Target;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-3"
                      >
                        <TrendIcon className={`w-5 h-5 ${impactColors[trend?.impact] || 'text-white'} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1">
                          <p className="text-white text-sm">{trend?.trend}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${severityColors[trend?.impact] || 'bg-white/10 text-white'}`}>
                              {trend?.impact} impact
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anomalies */}
            {anomalies.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Issues & Anomalies
                </h3>
                <div className="space-y-2">
                  {anomalies.map((anomaly, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-3 rounded-lg border ${severityColors[anomaly?.severity] || 'border-white/10'}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium mb-1">{anomaly?.issue}</p>
                          <p className="text-white/70 text-xs">{anomaly?.recommendation}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunities */}
            {opportunities.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  Growth Opportunities
                </h3>
                <div className="space-y-2">
                  {opportunities.map((opp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium mb-1">{opp?.opportunity}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              {opp?.potential_value}
                            </Badge>
                            <Badge className="bg-white/10 text-white/70 text-xs">
                              Effort: {opp?.effort}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions */}
            {predictions.forecast_30d && (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-semibold text-sm">30-Day Forecast</span>
                  <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                    {Math.round((predictions?.confidence || 0) * 100)}% confidence
                  </Badge>
                </div>
                <p className="text-white/90 text-sm mb-3">{predictions.forecast_30d}</p>
                {predictions.expected_metrics && Object.keys(predictions.expected_metrics).length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {Object.entries(predictions.expected_metrics).map(([key, value]) => (
                      <div key={key} className="p-2 bg-white/5 rounded text-center">
                        <p className="text-white/60 text-xs mb-1">{key}</p>
                        <p className="text-lg font-bold text-purple-400">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  Recommended Actions
                </h3>
                <div className="space-y-2">
                  {recommendations.map((rec, idx) => {
                    const priorityColor = rec?.priority === 'high' ? 'border-red-500/30 bg-red-500/10' :
                                         rec?.priority === 'medium' ? 'border-yellow-500/30 bg-yellow-500/10' :
                                         'border-blue-500/30 bg-blue-500/10';
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-3 rounded-lg border ${priorityColor}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-xs ${
                                rec?.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                rec?.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {rec?.priority} priority
                              </Badge>
                              <Badge className="bg-white/10 text-white/70 text-xs">
                                {rec?.effort} effort
                              </Badge>
                            </div>
                            <p className="text-white text-sm font-medium mb-1">{rec?.action}</p>
                            <p className="text-white/70 text-xs">{rec?.impact}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isLoading && !safeAnalysis.summary && (
              <div className="py-8 text-center">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 text-sm">No analysis available</p>
                <Button
                  onClick={() => refetch()}
                  size="sm"
                  className="mt-3 bg-gradient-to-r from-amber-600 to-amber-500"
                >
                  Generate Analysis
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}