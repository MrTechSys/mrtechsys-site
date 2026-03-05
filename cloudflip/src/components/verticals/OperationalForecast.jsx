import React from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function OperationalForecast({ vertical }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['operational-forecast', vertical],
    queryFn: async () => {
      const response = await api.functions.invoke('predictiveOperations', { 
        vertical, 
        forecastDays: 7 
      });
      return response.data;
    },
    staleTime: 30 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000 // Refresh hourly
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-[#3cf7d4]/30 backdrop-blur">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#3cf7d4] animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.success) {
    return null;
  }

  const forecast = data.forecast;
  const history = data.historical_summary;

  // Prepare chart data
  const forecastChartData = forecast.daily_forecasts?.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
    bookings: day.predicted_bookings,
    revenue: day.predicted_revenue
  })) || [];

  return (
    <div className="space-y-6">
      {/* Forecast Overview */}
      <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-[#3cf7d4]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#3cf7d4]" />
              7-Day Operational Forecast
            </CardTitle>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white"
            >
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Insights */}
          {forecast.key_insights?.length > 0 && (
            <div className="grid md:grid-cols-2 gap-3">
              {forecast.key_insights.slice(0, 4).map((insight, idx) => (
                <div key={idx} className="p-3 bg-[#3cf7d4]/10 rounded-lg border border-[#3cf7d4]/20">
                  <p className="text-white/80 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          )}

          {/* Demand Forecast Chart */}
          {forecastChartData.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3">Predicted Bookings</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3cf7d420" />
                  <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#fff' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #3cf7d450' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="bookings" fill="#3cf7d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Revenue Forecast Chart */}
          {forecastChartData.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3">Predicted Revenue</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3cf7d420" />
                  <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#fff' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #3cf7d450' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#f4d35e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily Breakdown */}
          <div className="space-y-2">
            {forecast.daily_forecasts?.map((day, idx) => {
              const demandColors = {
                high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
                medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
                low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' }
              };
              const colors = demandColors[day.demand_level] || demandColors.medium;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-white font-medium text-sm">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                      <Badge className={`ml-2 ${colors.bg} ${colors.text} text-xs`}>
                        {day.demand_level} demand
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-xs">
                        {day.predicted_bookings} bookings • ${day.predicted_revenue?.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  {day.peak_hours && (
                    <p className="text-white/60 text-xs">Peak: {day.peak_hours}</p>
                  )}
                  {day.special_notes && (
                    <p className="text-amber-400 text-xs mt-1">💡 {day.special_notes}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Staffing Recommendations */}
      {forecast.staffing_recommendations?.length > 0 && (
        <Card className="bg-white/5 border-green-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Staffing Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {forecast.staffing_recommendations.map((staff, idx) => (
              <div key={idx} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">
                    {new Date(staff.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </span>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    {staff.recommended_staff} staff
                  </Badge>
                </div>
                <p className="text-white/60 text-xs mb-1">Coverage: {staff.peak_coverage_hours}</p>
                <p className="text-white/70 text-xs">{staff.rationale}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Inventory Recommendations */}
      {forecast.inventory_recommendations?.length > 0 && (
        <Card className="bg-white/5 border-amber-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Inventory Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {forecast.inventory_recommendations.map((inv, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${
                inv.priority === 'high' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : inv.priority === 'medium'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{inv.item}</span>
                  <Badge className={`text-xs ${
                    inv.priority === 'high' 
                      ? 'bg-red-500/20 text-red-400' 
                      : inv.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {inv.priority}
                  </Badge>
                </div>
                <p className="text-white/70 text-xs mb-1">Suggested: {inv.suggested_quantity}</p>
                <p className="text-white/60 text-xs">{inv.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weather Risks */}
      {forecast.weather_risks?.length > 0 && (
        <Card className="bg-white/5 border-orange-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Weather Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {forecast.weather_risks.map((risk, idx) => (
              <div key={idx} className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">
                    {new Date(risk.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </span>
                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                    {risk.risk_type}
                  </Badge>
                </div>
                <p className="text-white/70 text-xs mb-1">{risk.impact}</p>
                <p className="text-orange-400 text-xs">→ {risk.mitigation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}