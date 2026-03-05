import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function RiskMatrix({ findings }) {
  // Define risk matrix axes
  const severityLevels = ['critical', 'high', 'medium', 'low'];
  const likelihoodLevels = ['very_high', 'high', 'medium', 'low'];

  // Calculate risk distribution
  const matrixData = severityLevels.map(severity => ({
    severity,
    likelihoods: likelihoodLevels.map(likelihood => {
      // Estimate likelihood based on recurrence and other factors
      const matchingFindings = findings.filter(f => {
        if (f.severity !== severity || f.status !== 'open') return false;
        
        // Simple likelihood estimation
        const recurrence = f.recurrence_count || 1;
        const estimatedLikelihood = 
          recurrence > 3 ? 'very_high' :
          recurrence > 1 ? 'high' :
          f.risk_score > 75 ? 'medium' : 'low';
        
        return estimatedLikelihood === likelihood;
      });

      return {
        likelihood,
        count: matchingFindings.length,
        findings: matchingFindings
      };
    })
  }));

  // Calculate risk score for color coding
  const getRiskScore = (severity, likelihood) => {
    const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
    const likelihoodWeight = { very_high: 4, high: 3, medium: 2, low: 1 };
    
    return severityWeight[severity] * likelihoodWeight[likelihood];
  };

  const getColor = (score) => {
    if (score >= 12) return 'bg-red-500/60 border-red-500';
    if (score >= 8) return 'bg-orange-500/60 border-orange-500';
    if (score >= 4) return 'bg-yellow-500/60 border-yellow-500';
    return 'bg-green-500/60 border-green-500';
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Risk Assessment Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Headers */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <div className="text-white/70 text-xs font-semibold uppercase">
                Severity / Likelihood
              </div>
              {likelihoodLevels.map(level => (
                <div key={level} className="text-white/70 text-xs font-semibold uppercase text-center">
                  {level.replace('_', ' ')}
                </div>
              ))}
            </div>

            {/* Matrix Grid */}
            <div className="space-y-2">
              {matrixData.map(row => (
                <div key={row.severity} className="grid grid-cols-5 gap-2">
                  <div className="text-white text-sm capitalize py-2 flex items-center font-medium">
                    {row.severity}
                  </div>
                  {row.likelihoods.map((cell, idx) => {
                    const riskScore = getRiskScore(row.severity, cell.likelihood);
                    const colorClass = getColor(riskScore);

                    return (
                      <div
                        key={idx}
                        className={`${colorClass} rounded-lg p-3 border-2 relative group cursor-pointer transition-all hover:scale-105`}
                      >
                        <div className="text-center">
                          <p className="text-white font-bold text-2xl">{cell.count}</p>
                          <p className="text-white/80 text-xs mt-1">
                            Risk: {riskScore}
                          </p>
                        </div>

                        {/* Tooltip with findings */}
                        {cell.count > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-72">
                            <div className="bg-[#0a1929] border border-cyan-500/50 rounded-lg p-3 shadow-xl max-h-64 overflow-y-auto">
                              <p className="text-white font-semibold text-xs mb-2">
                                {cell.count} Finding{cell.count > 1 ? 's' : ''}
                              </p>
                              <div className="space-y-2">
                                {cell.findings.slice(0, 5).map(finding => (
                                  <div key={finding.id} className="text-xs">
                                    <p className="text-white font-medium">{finding.title}</p>
                                    <p className="text-white/60 mt-1 line-clamp-2">
                                      {finding.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500/60 border-2 border-red-500 rounded" />
                <span className="text-white/70">Critical Risk (12-16)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500/60 border-2 border-orange-500 rounded" />
                <span className="text-white/70">High Risk (8-11)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500/60 border-2 border-yellow-500 rounded" />
                <span className="text-white/70">Medium Risk (4-7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/60 border-2 border-green-500 rounded" />
                <span className="text-white/70">Low Risk (1-3)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}