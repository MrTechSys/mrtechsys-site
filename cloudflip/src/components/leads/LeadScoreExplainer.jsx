import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Mail,
  Link as LinkIcon,
  DollarSign
} from 'lucide-react';

export default function LeadScoreExplainer({ lead }) {
  if (!lead?.metadata?.score_breakdown) {
    return (
      <Card className="bg-white/5 border-amber-500/20">
        <CardContent className="p-4 text-center">
          <Brain className="w-8 h-8 text-cyan-400/50 mx-auto mb-2" />
          <p className="text-white/60 text-sm">No scoring details available</p>
          <p className="text-white/50 text-xs mt-1">Run AI scoring to see breakdown</p>
        </CardContent>
      </Card>
    );
  }

  const breakdown = lead.metadata.score_breakdown;
  const engagement = lead.metadata.engagement_stats || {};
  const enrichment = lead.metadata.company_enrichment || {};

  const factors = [
    { 
      name: 'Contact Quality', 
      score: breakdown.contact_quality || 0,
      max: 20,
      icon: CheckCircle,
      color: 'cyan'
    },
    { 
      name: 'Company Fit', 
      score: breakdown.company_fit || 0,
      max: 20,
      icon: DollarSign,
      color: 'purple'
    },
    { 
      name: 'Engagement', 
      score: breakdown.engagement || 0,
      max: 30,
      icon: TrendingUp,
      color: 'green'
    },
    { 
      name: 'Intent Signals', 
      score: breakdown.intent_signals || 0,
      max: 20,
      icon: Brain,
      color: 'amber'
    },
    { 
      name: 'Source Reliability', 
      score: breakdown.source_reliability || 0,
      max: 10,
      icon: CheckCircle,
      color: 'blue'
    }
  ];

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-cyan-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          AI Score Breakdown: {lead.score}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Factors */}
        <div className="space-y-3">
          {factors.map(factor => {
            const Icon = factor.icon;
            const percentage = (factor.score / factor.max) * 100;
            
            return (
              <div key={factor.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-${factor.color}-400`} />
                    <span className="text-white text-sm">{factor.name}</span>
                  </div>
                  <Badge className={`bg-${factor.color}-500/20 text-${factor.color}-400`}>
                    {factor.score}/{factor.max}
                  </Badge>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Reasoning */}
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-cyan-400 text-xs font-semibold mb-1">
            <Brain className="w-3 h-3 inline mr-1" />
            AI Reasoning:
          </p>
          <p className="text-white/80 text-sm">{lead.ai_summary || 'No reasoning available'}</p>
        </div>

        {/* Engagement Metrics */}
        {engagement.emails_opened > 0 || engagement.links_clicked > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-white/5 rounded">
              <Mail className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-400">{engagement.emails_opened || 0}</p>
              <p className="text-white/60 text-xs">Opened</p>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <LinkIcon className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-400">{engagement.links_clicked || 0}</p>
              <p className="text-white/60 text-xs">Clicked</p>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <TrendingUp className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-cyan-400">{engagement.high_intent_signals || 0}</p>
              <p className="text-white/60 text-xs">Signals</p>
            </div>
          </div>
        ) : null}

        {/* Company Enrichment */}
        {enrichment.company_size && (
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-purple-400 text-xs font-semibold mb-2">Company Intelligence:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-white/50">Size:</span>
                <span className="text-white ml-2">{enrichment.company_size}</span>
              </div>
              <div>
                <span className="text-white/50">Industry:</span>
                <span className="text-white ml-2">{enrichment.industry || 'N/A'}</span>
              </div>
              {enrichment.funding_rounds && (
                <div>
                  <span className="text-white/50">Funding:</span>
                  <span className="text-white ml-2">{enrichment.funding_rounds}</span>
                </div>
              )}
              {enrichment.revenue_range && (
                <div>
                  <span className="text-white/50">Revenue:</span>
                  <span className="text-white ml-2">{enrichment.revenue_range}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Red Flags */}
        {lead.metadata?.red_flags?.length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 text-xs font-semibold mb-1">Red Flags:</p>
                <ul className="space-y-1">
                  {lead.metadata.red_flags.map((flag, idx) => (
                    <li key={idx} className="text-white/70 text-xs">• {flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/50">Confidence:</span>
          <Badge className="bg-cyan-500/20 text-cyan-400">
            {Math.round((lead.confidence || 0) * 100)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}