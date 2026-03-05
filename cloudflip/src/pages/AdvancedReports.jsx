import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Download,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format, addMonths } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const severityConfig = {
  critical: { color: "from-red-600 to-red-700", icon: AlertTriangle, bgClass: "bg-red-500/10", borderClass: "border-red-500/30" },
  warning: { color: "from-yellow-600 to-yellow-700", icon: AlertCircle, bgClass: "bg-yellow-500/10", borderClass: "border-yellow-500/30" },
  positive: { color: "from-green-600 to-green-700", icon: CheckCircle, bgClass: "bg-green-500/10", borderClass: "border-green-500/30" },
  info: { color: "from-blue-600 to-blue-700", icon: Lightbulb, bgClass: "bg-blue-500/10", borderClass: "border-blue-500/30" }
};

export default function AdvancedReports() {
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [generatingForecasts, setGeneratingForecasts] = useState(false);
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => api.entities.AIInsight.filter({ is_dismissed: false }, '-created_date', 10)
  });

  const { data: forecasts = [], isLoading: forecastsLoading } = useQuery({
    queryKey: ['forecasts'],
    queryFn: () => api.entities.Forecast.list('-forecast_date', 12)
  });

  const generateInsightsMutation = useMutation({
    mutationFn: () => api.functions.invoke('generateAIInsights', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success("AI insights generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate insights");
    }
  });

  const generateForecastsMutation = useMutation({
    mutationFn: ({ type, periods }) => api.functions.invoke('generateForecasts', {
      forecastType: type,
      periods
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
      toast.success("Forecasts generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate forecasts");
    }
  });

  const dismissInsightMutation = useMutation({
    mutationFn: (insightId) => api.entities.AIInsight.update(insightId, {
      is_dismissed: true,
      dismissed_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast.success("Insight dismissed");
    }
  });

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true);
    await generateInsightsMutation.mutateAsync();
    setGeneratingInsights(false);
  };

  const handleGenerateForecasts = async (type) => {
    setGeneratingForecasts(true);
    await generateForecastsMutation.mutateAsync({ type, periods: 3 });
    setGeneratingForecasts(false);
  };

  // Group forecasts by type
  const revenueForecasts = forecasts.filter(f => f.forecast_type === 'revenue');
  const salesForecasts = forecasts.filter(f => f.forecast_type === 'sales');

  // Prepare chart data
  const forecastChartData = revenueForecasts.map(f => ({
    date: format(new Date(f.forecast_date), 'MMM yyyy'),
    predicted: f.predicted_value,
    lower: f.lower_bound,
    upper: f.upper_bound
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Advanced <span className="text-amber-400">Analytics</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">AI-powered insights and <span className="text-amber-400">predictive forecasting</span></p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateInsights}
            disabled={generatingInsights}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
          >
            {generatingInsights ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">AI <span className="text-amber-400">Insights</span></h2>
          {insights.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400">{insights.length} Active</Badge>
          )}
        </div>

        {insightsLoading ? (
          <Card className="p-8 text-center text-white/60 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            Loading insights...
          </Card>
        ) : insights.length === 0 ? (
          <Card className="p-12 text-center bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <Lightbulb className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Insights Yet</h3>
            <p className="text-white/60 mb-6">Click "Generate Insights" to analyze your business data with AI</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {insights.map((insight) => {
                const config = severityConfig[insight.severity] || severityConfig.info;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <Card className={`bg-[#0a1929]/60 backdrop-blur border-amber-500/20 ${config.borderClass}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                                <Badge className={`${config.bgClass} border-0 text-xs`}>
                                  {insight.category}
                                </Badge>
                                {insight.impact_score >= 75 && (
                                  <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                                    High Impact
                                  </Badge>
                                )}
                              </div>
                              <p className="text-white/70 mb-4">{insight.description}</p>
                              
                              {insight.recommended_actions && insight.recommended_actions.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-amber-400">Recommended Actions:</p>
                                  <ul className="space-y-1">
                                    {insight.recommended_actions.map((action, idx) => (
                                      <li key={idx} className="text-sm text-white/60 flex items-start gap-2">
                                        <Target className="w-3 h-3 mt-1 text-amber-400 flex-shrink-0" />
                                        {action}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dismissInsightMutation.mutate(insight.id)}
                            className="text-white/40 hover:text-white/60"
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Forecasting Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Revenue <span className="text-amber-400">Forecasting</span></h2>
          <Button
            onClick={() => handleGenerateForecasts('revenue')}
            disabled={generatingForecasts}
            variant="outline"
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            {generatingForecasts ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Update Forecast
              </>
            )}
          </Button>
        </div>

        {forecastsLoading ? (
          <Card className="p-8 text-center text-white/60 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            Loading forecasts...
          </Card>
        ) : forecastChartData.length === 0 ? (
          <Card className="p-12 text-center bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <TrendingUp className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Forecasts Available</h3>
            <p className="text-white/60 mb-6">Generate forecasts to predict future revenue trends</p>
            <Button
              onClick={() => handleGenerateForecasts('revenue')}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Forecast
            </Button>
          </Card>
        ) : (
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white">3-Month Revenue <span className="text-amber-400">Projection</span></CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={forecastChartData}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b20" />
                  <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#fff' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b50' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    stroke="transparent" 
                    fill="url(#colorRange)" 
                    name="Upper Bound"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lower" 
                    stroke="transparent" 
                    fill="url(#colorRange)" 
                    name="Lower Bound"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    name="Predicted Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {revenueForecasts.slice(0, 3).map((forecast, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                    <div className="text-sm text-white/60 mb-1">
                      {format(new Date(forecast.forecast_date), 'MMMM yyyy')}
                    </div>
                    <div className="text-2xl font-bold text-amber-400">
                      ${(forecast.predicted_value / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      Range: ${(forecast.lower_bound / 1000).toFixed(1)}k - ${(forecast.upper_bound / 1000).toFixed(1)}k
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Real-time Performance KPIs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Real-Time <span className="text-amber-400">Performance</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-sm text-white/60">Pipeline Health</div>
                <div className="text-2xl font-bold text-green-400">Excellent</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-sm text-white/60">Forecast Accuracy</div>
                <div className="text-2xl font-bold text-amber-400">92%</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-white/60">Lead Velocity</div>
                <div className="text-2xl font-bold text-blue-400">+12%</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-white/60">At-Risk Deals</div>
                <div className="text-2xl font-bold text-purple-400">3</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}