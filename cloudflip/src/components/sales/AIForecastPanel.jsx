import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Target,
  Zap,
  Clock,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

const severityColors = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30"
};

export default function AIForecastPanel({ orgId, onForecastComplete }) {
  const [forecast, setForecast] = useState(null);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  const forecastMutation = useMutation({
    mutationFn: async () => {
      const user = await api.auth.me();
      return api.functions.invoke('aiSalesForecaster', {
        orgId: user.current_org_id,
        forecastQuarters: 2
      });
    },
    onSuccess: (data) => {
      setForecast(data?.forecast || null);
      toast.success('Sales forecast generated successfully!');
      if (onForecastComplete) onForecastComplete(data);
    },
    onError: (error) => {
      toast.error(`Forecast failed: ${error?.message || 'Unknown error'}`);
    }
  });

  const handleGenerateForecast = () => {
    setForecast(null);
    forecastMutation.mutate();
  };

  const safeForecast = forecast || {};
  const quarterlyForecasts = Array.isArray(safeForecast.quarterly_forecasts) ? safeForecast.quarterly_forecasts : [];
  const riskFactors = Array.isArray(safeForecast.risk_factors) ? safeForecast.risk_factors : [];
  const interventions = Array.isArray(safeForecast.interventions) ? safeForecast.interventions : [];
  const atRiskDeals = Array.isArray(safeForecast.at_risk_deals) ? safeForecast.at_risk_deals : [];
  const metrics = safeForecast.metrics || {};

  // Prepare chart data with safety checks
  const forecastChartData = quarterlyForecasts.map(q => ({
    quarter: q?.quarter || 'N/A',
    predicted: q?.predicted_revenue || 0,
    best_case: q?.best_case || 0,
    worst_case: q?.worst_case || 0
  }));

  return (
    <div className="space-y-4">
      {/* Forecast Trigger */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">AI Sales Forecast</h3>
                <p className="text-white/60 text-sm">Predictive revenue analysis & insights</p>
              </div>
            </div>
            <Button
              onClick={handleGenerateForecast}
              disabled={forecastMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {forecastMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Forecasting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Forecast
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Results */}
      <AnimatePresence>
        {forecast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Overall Assessment */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Overall Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safeForecast.overall_assessment && (
                  <div className="p-3 bg-white/5 rounded-lg border border-blue-500/20 mb-4">
                    <p className="text-white/80">{safeForecast.overall_assessment}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Current Pipeline</p>
                    <p className="text-2xl font-bold text-blue-400">
                      ${(metrics.pipelineValue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Recommended Quota</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${(safeForecast.recommended_quota || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Forecast Chart */}
            {forecastChartData.length > 0 && (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Revenue Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={forecastChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="quarter" stroke="#fff" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#fff" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="best_case"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Best Case"
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        name="Predicted"
                      />
                      <Line
                        type="monotone"
                        dataKey="worst_case"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Worst Case"
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {forecastChartData.map((q, idx) => (
                      <div key={idx} className="p-2 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs mb-1">{q.quarter}</p>
                        <p className="text-sm font-bold text-blue-400">
                          ${q.predicted.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riskFactors.map((risk, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${severityColors[risk?.severity] || severityColors.medium} text-xs`}>
                                {(risk?.severity || 'medium').toUpperCase()}
                              </Badge>
                              <Badge className="bg-white/10 text-white/60 text-xs">
                                {risk?.likelihood || 'medium'} likelihood
                              </Badge>
                            </div>
                            <p className="text-white font-medium text-sm">{risk?.risk || 'Risk identified'}</p>
                          </div>
                          <span className="text-red-400 font-bold text-sm">
                            -${(risk?.impact_on_revenue || 0).toLocaleString()}
                          </span>
                        </div>
                        {risk?.mitigation && (
                          <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                            <p className="text-green-400 text-xs">💡 {risk.mitigation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interventions */}
            {interventions.length > 0 && (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Recommended Interventions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {interventions.slice(0, 5).map((intervention, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedIntervention === idx ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'
                        }`}
                        onClick={() => setSelectedIntervention(selectedIntervention === idx ? null : idx)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                Priority {intervention?.priority || 1}
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                {intervention?.effort || 'medium'} effort
                              </Badge>
                            </div>
                            <p className="text-white font-medium text-sm">{intervention?.title || 'Intervention'}</p>
                          </div>
                          <span className="text-green-400 font-bold text-sm">
                            +${(intervention?.expected_impact || 0).toLocaleString()}
                          </span>
                        </div>

                        {selectedIntervention === idx && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-white/10 space-y-2"
                          >
                            <p className="text-white/80 text-sm">{intervention?.description || ''}</p>
                            {intervention?.timeline && (
                              <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                <p className="text-blue-400 text-xs">Timeline: {intervention.timeline}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* At-Risk Deals */}
            {atRiskDeals.length > 0 && (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    At-Risk Deals ({atRiskDeals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {atRiskDeals.slice(0, 5).map((deal, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-lg border border-red-500/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{deal?.name || 'Deal'}</p>
                            <p className="text-white/60 text-xs mt-1">{deal?.risk_reason || 'At risk'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-400">
                              ${(deal?.value || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-white/50">{deal?.probability || 0}% prob</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}