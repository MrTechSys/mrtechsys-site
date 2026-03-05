
import React from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Network,
  AlertTriangle,
  Shield,
  TrendingUp,
  Users,
  Target,
  Zap,
  ChevronRight,
  Loader2,
  Globe,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CrossModuleInsights() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cross-module-correlation'],
    queryFn: async () => {
      const response = await api.functions.invoke('crossModuleCorrelation', {});
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-[#3cf7d4]/30">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#3cf7d4] animate-spin mb-4" />
          <p className="text-white/70">AI correlating data across modules...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.success) {
    return null;
  }

  const insights = data.ai_insights || {};
  const correlations = Array.isArray(data.correlations) ? data.correlations : [];
  const criticalAlerts = Array.isArray(insights.critical_alerts) ? insights.critical_alerts : [];
  const riskAssessments = Array.isArray(insights.risk_assessments) ? insights.risk_assessments : [];
  const opportunityInsights = Array.isArray(insights.opportunity_insights) ? insights.opportunity_insights : [];
  const campaignEffectiveness = Array.isArray(insights.campaign_effectiveness) ? insights.campaign_effectiveness : [];
  const botMitigationRecs = Array.isArray(insights.bot_mitigation?.recommendations) ? insights.bot_mitigation.recommendations : [];

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-[#3cf7d4]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#3cf7d4]/20 to-purple-500/20 rounded-full blur-3xl" />
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Network className="w-6 h-6 text-[#3cf7d4]" />
              Cross-Module Intelligence
              <Badge className="bg-[#3cf7d4]/20 text-[#3cf7d4] ml-2">AI-Powered</Badge>
            </CardTitle>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white"
            >
              <Activity className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          <div className="p-4 bg-gradient-to-br from-[#3cf7d4]/10 to-blue-500/10 rounded-lg border border-[#3cf7d4]/30">
            <p className="text-white/90 text-sm leading-relaxed">
              {insights.overall_correlation_summary || 'Analyzing cross-module correlations...'}
            </p>
          </div>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Critical Cross-Module Alerts
              </h4>
              <div className="space-y-3">
                {criticalAlerts.map((alert, idx) => {
                  const severityColors = {
                    critical: { bg: 'from-red-500/10 to-orange-500/10', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-400' },
                    high: { bg: 'from-orange-500/10 to-amber-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-400' },
                    medium: { bg: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-400' }
                  };
                  const colors = severityColors[alert?.severity] || severityColors.medium;
                  const affectedEntities = Array.isArray(alert?.affected_entities) ? alert.affected_entities : [];

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 bg-gradient-to-br ${colors.bg} rounded-lg border ${colors.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-medium text-sm">{alert?.title || 'Alert'}</h4>
                            <Badge className={colors.badge}>
                              {alert?.severity || 'medium'}
                            </Badge>
                          </div>
                          <p className="text-white/70 text-xs mb-3">{alert?.description || ''}</p>
                          
                          {affectedEntities.length > 0 && (
                            <div className="mb-3">
                              <span className="text-white/50 text-xs">Affected: </span>
                              <span className="text-white/80 text-xs">{affectedEntities.join(', ')}</span>
                            </div>
                          )}

                          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded border border-amber-500/20">
                            <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-amber-400 text-xs font-medium mb-1">Recommended Action:</p>
                              <p className="text-white/80 text-xs">{alert?.recommended_action || 'Review required'}</p>
                            </div>
                          </div>

                          {alert?.estimated_impact && (
                            <div className="mt-2 text-xs text-white/50">
                              Impact: {alert.estimated_impact}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Risk Assessments */}
          {riskAssessments.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-400" />
                Entity Risk Assessments
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {riskAssessments.map((risk, idx) => {
                  const riskFactors = Array.isArray(risk?.risk_factors) ? risk.risk_factors : [];
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + idx * 0.05 }}
                      className="p-3 bg-white/5 rounded-lg border border-orange-500/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-white font-medium text-sm">{risk?.entity_name || 'Entity'}</span>
                          <p className="text-white/50 text-xs capitalize">{risk?.entity_type || 'unknown'}</p>
                        </div>
                        <Badge className={`text-xs ${
                          risk?.risk_level === 'critical' || risk?.risk_level === 'high' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {risk?.risk_level || 'medium'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs">
                        {riskFactors.slice(0, 2).map((factor, i) => (
                          <p key={i} className="text-white/60">• {factor}</p>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Opportunity Insights */}
          {opportunityInsights.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Growth Opportunities
              </h4>
              <div className="space-y-2">
                {opportunityInsights.map((opp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20"
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="text-white font-medium text-sm mb-1">{opp?.opportunity_type || 'Opportunity'}</h5>
                        <p className="text-white/70 text-xs mb-2">{opp?.description || ''}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 text-xs font-medium">{opp?.potential_value || 'High value'}</span>
                          <span className="text-white/50 text-xs">{opp?.action_to_take || 'Review'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Predictive Impacts */}
          <div className="grid md:grid-cols-3 gap-3">
            {insights.predictive_impacts?.security_on_sales && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium text-xs">Security → Sales</span>
                </div>
                <p className="text-white/70 text-xs">{insights.predictive_impacts.security_on_sales}</p>
              </div>
            )}

            {insights.predictive_impacts?.incident_on_satisfaction && (
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-medium text-xs">Incidents → Satisfaction</span>
                </div>
                <p className="text-white/70 text-xs">{insights.predictive_impacts.incident_on_satisfaction}</p>
              </div>
            )}

            {insights.predictive_impacts?.traffic_quality_on_pipeline && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium text-xs">Traffic → Pipeline</span>
                </div>
                <p className="text-white/70 text-xs">{insights.predictive_impacts.traffic_quality_on_pipeline}</p>
              </div>
            )}
          </div>

          {/* Campaign Effectiveness */}
          {campaignEffectiveness.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3">Campaign Performance</h4>
              <div className="space-y-2">
                {campaignEffectiveness.map((campaign, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1">
                      <span className="text-white font-medium text-sm">{campaign?.utm_source || 'Campaign'}</span>
                      <p className="text-white/60 text-xs mt-1">{campaign?.recommendation || ''}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/50 mb-1">Quality</div>
                      <div className={`text-lg font-bold ${
                        (campaign?.quality_score || 0) >= 80 ? 'text-green-400' :
                        (campaign?.quality_score || 0) >= 60 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {campaign?.quality_score || 0}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bot Mitigation */}
          {insights.bot_mitigation && (
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-medium text-sm">Bot Traffic Analysis</span>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400">
                  {(insights.bot_mitigation.bot_traffic_percentage || 0).toFixed(1)}% bot traffic
                </Badge>
              </div>
              <p className="text-white/70 text-xs mb-3">
                Estimated false leads: {insights.bot_mitigation.false_leads_estimated || 0}
              </p>
              <div className="space-y-1">
                {botMitigationRecs.map((rec, idx) => (
                  <p key={idx} className="text-white/80 text-xs flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    {rec}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-3">
        <Link to={createPageUrl("CRMContacts")}>
          <Button variant="outline" className="w-full border-[#3cf7d4]/30 text-white hover:bg-[#3cf7d4]/10">
            <Users className="w-4 h-4 mr-2" />
            Review CRM Data
          </Button>
        </Link>
        <Link to={createPageUrl("SecurityCommandCenter")}>
          <Button variant="outline" className="w-full border-red-500/30 text-white hover:bg-red-500/10">
            <Shield className="w-4 h-4 mr-2" />
            Security Center
          </Button>
        </Link>
        <Link to={createPageUrl("LiveAnalytics")}>
          <Button variant="outline" className="w-full border-blue-500/30 text-white hover:bg-blue-500/10">
            <Globe className="w-4 h-4 mr-2" />
            Traffic Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
}
