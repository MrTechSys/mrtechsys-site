
import React from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sun,
  Cloud,
  CloudRain,
  AlertTriangle,
  DollarSign,
  Target,
  Users,
  CheckCircle,
  Loader2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyBriefing() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['daily-briefing'],
    queryFn: async () => {
      const response = await api.functions.invoke('generateDailyBriefing', {});
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000 // Refresh every 30 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur border-blue-500/30">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
          <p className="text-white/70">Preparing your daily briefing...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.success) {
    return null;
  }

  const briefing = data.briefing || {};
  const weather = data.weather;
  const topPriorities = Array.isArray(briefing.top_priorities) ? briefing.top_priorities : [];
  const revenueOpportunities = Array.isArray(briefing.revenue_opportunities) ? briefing.revenue_opportunities : [];
  const riskAlerts = Array.isArray(briefing.risk_alerts) ? briefing.risk_alerts : [];
  const customerFocus = Array.isArray(briefing.customer_focus) ? briefing.customer_focus : [];
  const endOfDayGoals = Array.isArray(briefing.end_of_day_goals) ? briefing.end_of_day_goals : [];
  const weatherAlerts = Array.isArray(weather?.alerts) ? weather.alerts : [];

  const getWeatherIcon = (condition) => {
    if (!condition) return Sun;
    if (condition.toLowerCase().includes('rain')) return CloudRain;
    if (condition.toLowerCase().includes('cloud')) return Cloud;
    return Sun;
  };

  const WeatherIcon = weather ? getWeatherIcon(weather.condition) : Sun;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-blue-500/30 relative overflow-hidden">
        {/* Animated gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-400" />
              Daily Operations Briefing
              <Badge className="bg-blue-500/20 text-blue-400 ml-2">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Badge>
            </CardTitle>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Morning Summary */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30">
            <p className="text-white/90 text-sm leading-relaxed">{briefing.morning_summary || 'Good morning! Preparing your briefing...'}</p>
          </div>

          {/* Weather Alert (if applicable) */}
          {weather && (
            <div className={`p-3 rounded-lg border ${
              weatherAlerts.length > 0 
                ? 'bg-red-500/10 border-red-500/30' 
                : weather.precipitation_chance > 50
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-green-500/10 border-green-500/30'
            }`}>
              <div className="flex items-center gap-3">
                <WeatherIcon className={`w-5 h-5 ${
                  weatherAlerts.length > 0 ? 'text-red-400' :
                  weather.precipitation_chance > 50 ? 'text-amber-400' :
                  'text-green-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    {weather.condition} • {weather.temperature}
                  </p>
                  <p className="text-white/60 text-xs">
                    {weather.precipitation_chance}% rain • Wind: {weather.wind_speed}
                  </p>
                  {weather.impact_on_business && (
                    <p className="text-white/70 text-xs mt-1">{weather.impact_on_business}</p>
                  )}
                </div>
                {weatherAlerts.length > 0 && (
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                )}
              </div>
            </div>
          )}

          {/* Forecast Summary */}
          {data.forecast_summary && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-white/60 text-xs mb-1">Expected Bookings</p>
                <p className="text-2xl font-bold text-[#3cf7d4]">
                  {data.forecast_summary.predicted_bookings || 0}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-white/60 text-xs mb-1">Forecast Revenue</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(data.forecast_summary.predicted_revenue || 0).toFixed(0)}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-white/60 text-xs mb-1">Demand Level</p>
                <p className={`text-lg font-bold ${
                  data.forecast_summary.demand_level === 'high' ? 'text-red-400' :
                  data.forecast_summary.demand_level === 'medium' ? 'text-amber-400' :
                  'text-blue-400'
                }`}>
                  {data.forecast_summary.demand_level || 'Normal'}
                </p>
              </div>
            </div>
          )}

          {/* Top Priorities */}
          {topPriorities.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Top 3 Priorities
              </h4>
              <div className="space-y-2">
                {topPriorities.slice(0, 3).map((priority, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-400 font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{priority?.priority || 'Priority'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {priority?.time_sensitive && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">Time Sensitive</Badge>
                        )}
                        <span className="text-white/50 text-xs">{priority?.estimated_time || ''}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Opportunities */}
          {revenueOpportunities.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Revenue Opportunities
              </h4>
              <div className="space-y-2">
                {revenueOpportunities.map((opp, idx) => (
                  <div key={idx} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-medium text-sm flex-1">{opp?.opportunity || 'Opportunity'}</p>
                      <Badge className="bg-green-500/20 text-green-400 text-xs shrink-0">
                        {opp?.potential_value || 'High'}
                      </Badge>
                    </div>
                    <p className="text-white/60 text-xs mt-1">{opp?.how_to_capture || ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Alerts */}
          {riskAlerts.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Risk Alerts
              </h4>
              <div className="space-y-2">
                {riskAlerts.map((risk, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${
                    risk?.severity === 'high' || risk?.severity === 'critical'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{risk?.risk || 'Risk detected'}</span>
                      <Badge className={`text-xs ${
                        risk?.severity === 'high' || risk?.severity === 'critical'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {risk?.severity || 'medium'}
                      </Badge>
                    </div>
                    <p className="text-white/70 text-xs">{risk?.prevention || ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Focus */}
          {customerFocus.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Customer Focus
              </h4>
              <div className="space-y-2">
                {customerFocus.slice(0, 3).map((customer, idx) => (
                  <div key={idx} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-white font-medium text-sm">{customer?.customer || 'Customer'}</p>
                    <p className="text-white/60 text-xs mt-1">{customer?.reason || ''}</p>
                    <p className="text-purple-400 text-xs mt-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {customer?.action || 'Follow up'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* End of Day Goals */}
          {endOfDayGoals.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Success Metrics
              </h4>
              <ul className="space-y-1">
                {endOfDayGoals.map((goal, idx) => (
                  <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Motivational Note */}
          {briefing.motivational_note && (
            <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30 text-center">
              <p className="text-amber-400 text-sm italic">"{briefing.motivational_note}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
