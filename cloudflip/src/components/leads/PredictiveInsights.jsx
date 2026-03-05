import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  AlertCircle,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { toast } from 'sonner';

export default function PredictiveInsights({ leads, orgId }) {
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  const { data: topLeads } = useQuery({
    queryKey: ['top-leads-predictive', orgId],
    queryFn: () => {
      const scoredLeads = leads
        .filter(l => l.score && l.score >= 60)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5);
      return scoredLeads;
    },
    enabled: !!orgId && leads.length > 0
  });

  const { data: prediction, isLoading: predictLoading } = useQuery({
    queryKey: ['lead-prediction', selectedLeadId],
    queryFn: async () => {
      const { data } = await api.functions.invoke('predictLeadConversion', {
        leadId: selectedLeadId,
        orgId
      });
      return data;
    },
    enabled: !!selectedLeadId
  });

  // 30-day trend simulation
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    leads: Math.floor(Math.random() * 10) + 15,
    conversion: Math.floor(Math.random() * 30) + 20
  }));

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Predictive Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 30-Day Trend */}
        <div className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-white font-semibold text-sm">30-Day Lead Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#fff" tick={{ fontSize: 10 }} />
              <YAxis stroke="#fff" tick={{ fontSize: 10 }} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #8b5cf6' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="leads" stroke="#8b5cf6" fillOpacity={1} fill="url(#leadGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Leads for Prediction */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-semibold text-sm">High-Potential Leads</span>
          </div>
          <div className="space-y-2">
            {(topLeads || []).map(lead => (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedLeadId === lead.id
                    ? 'bg-cyan-500/20 border-cyan-500'
                    : 'bg-white/5 border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{lead.name}</p>
                    <p className="text-white/60 text-xs">{lead.source}</p>
                  </div>
                  <Badge className={
                    lead.score >= 80 ? 'bg-green-500/20 text-green-400' :
                    lead.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }>
                    Score: {lead.score}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Results */}
        {selectedLeadId && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            {predictLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin mr-2" />
                <span className="text-purple-400">AI analyzing lead...</span>
              </div>
            ) : prediction ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-bold text-sm">AI Prediction</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-white/5 rounded">
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round((prediction.predictions?.conversion_probability || 0) * 100)}%
                    </p>
                    <p className="text-white/60 text-xs mt-1">Conversion</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded">
                    <p className="text-2xl font-bold text-amber-400">
                      ${Math.round(prediction.predictions?.estimated_ltv || 0)}
                    </p>
                    <p className="text-white/60 text-xs mt-1">Est. LTV</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded">
                    <p className="text-2xl font-bold text-cyan-400">
                      {prediction.predictions?.expected_close_days || 0}d
                    </p>
                    <p className="text-white/60 text-xs mt-1">Time to close</p>
                  </div>
                </div>

                {prediction.insights?.recommended_actions && (
                  <div className="mt-3">
                    <p className="text-white/70 text-xs font-semibold mb-2">Recommended Actions:</p>
                    <ul className="space-y-1">
                      {prediction.insights.recommended_actions.slice(0, 3).map((action, idx) => (
                        <li key={idx} className="text-white/80 text-xs flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {prediction.insights?.risk_factors?.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-400 text-xs font-semibold">Risk Factors:</p>
                        <p className="text-white/70 text-xs mt-1">
                          {prediction.insights.risk_factors.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/50">Confidence:</span>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {Math.round((prediction.predictions?.confidence || 0) * 100)}%
                  </Badge>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {!selectedLeadId && (topLeads || []).length === 0 && (
          <div className="text-center py-8 text-white/60">
            <Brain className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
            <p className="text-sm">No high-quality leads for prediction yet</p>
            <p className="text-xs text-white/50 mt-1">Leads with score ≥60 will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}