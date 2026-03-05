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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import {
  TrendingUp,
  Target,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const entityOptions = [
  { value: 'leads', label: 'Lead Volume', metric: 'count' },
  { value: 'revenue', label: 'Revenue', metric: 'total_amount' },
  { value: 'quotes', label: 'Quote Value', metric: 'total_amount' }
];

export default function TrendPredictor({ defaultEntity = 'leads' }) {
  const [entityType, setEntityType] = useState(defaultEntity);
  const [horizon, setHorizon] = useState(30);

  const { data: prediction, isLoading, refetch } = useQuery({
    queryKey: ['trend-prediction', entityType, horizon],
    queryFn: async () => {
      const selectedOption = entityOptions.find(opt => opt.value === entityType);
      const response = await api.functions.invoke('trendPredictor', {
        entityType,
        metric: selectedOption?.metric || 'count',
        horizon
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000
  });

  const safePrediction = prediction?.prediction || {};
  const forecast = safePrediction.forecast || [];
  const keyDrivers = safePrediction.key_drivers || [];
  const riskFactors = safePrediction.risk_factors || [];

  const chartData = forecast.map(point => ({
    date: point?.date ? format(new Date(point.date), 'MMM d') : '',
    predicted: point?.predicted_value || 0,
    lower: point?.lower_bound || 0,
    upper: point?.upper_bound || 0
  }));

  return (
    <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-amber-500/30">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Trend Predictions
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="w-40 bg-white/5 border-amber-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                {entityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(horizon)} onValueChange={(v) => setHorizon(parseInt(v))}>
              <SelectTrigger className="w-28 bg-white/5 border-amber-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
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
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-white/60 text-sm">Generating predictions...</p>
          </div>
        ) : (
          <>
            {/* Forecast Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-white/60 text-xs mb-1">Trend Direction</p>
                <div className="flex items-center justify-center gap-1">
                  {safePrediction.trend_direction === 'increasing' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : safePrediction.trend_direction === 'decreasing' ? (
                    <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                  ) : (
                    <Target className="w-4 h-4 text-yellow-400" />
                  )}
                  <p className="text-white font-semibold capitalize">{safePrediction.trend_direction || 'stable'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-white/60 text-xs mb-1">Growth Rate</p>
                <p className="text-xl font-bold text-cyan-400">{safePrediction.growth_rate || 'N/A'}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-white/60 text-xs mb-1">Confidence</p>
                <p className="text-xl font-bold text-purple-400">
                  {Math.round((safePrediction.confidence || 0) * 100)}%
                </p>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#fff" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#fff" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="upper" 
                      stroke="transparent" 
                      fill="#8b5cf620" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lower" 
                      stroke="transparent" 
                      fill="#8b5cf620" 
                      fillOpacity={0.3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Key Drivers & Risks */}
            <div className="grid md:grid-cols-2 gap-4">
              {keyDrivers.length > 0 && (
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <h4 className="text-green-400 font-medium text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Key Drivers
                  </h4>
                  <ul className="space-y-1">
                    {keyDrivers.map((driver, idx) => (
                      <li key={idx} className="text-white/80 text-xs flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        {driver}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {riskFactors.length > 0 && (
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <h4 className="text-red-400 font-medium text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Risk Factors
                  </h4>
                  <ul className="space-y-1">
                    {riskFactors.map((risk, idx) => (
                      <li key={idx} className="text-white/80 text-xs flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Strategic Recommendation */}
            {safePrediction.recommendation && (
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-amber-400 font-semibold text-sm mb-1">Strategic Recommendation</h4>
                    <p className="text-white/90 text-sm leading-relaxed">{safePrediction.recommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}