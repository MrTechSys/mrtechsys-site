import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function FindingsTimeline({ findings }) {
  const sortedFindings = [...findings].sort((a, b) => 
    new Date(b.detected_at || b.created_date) - new Date(a.detected_at || a.created_date)
  );

  const severityColors = {
    critical: 'border-red-500/50 bg-red-500/10',
    high: 'border-orange-500/50 bg-orange-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    low: 'border-blue-500/50 bg-blue-500/10',
    info: 'border-cyan-500/50 bg-cyan-500/10'
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Findings Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-transparent" />

          <div className="space-y-4">
            {sortedFindings.map((finding, idx) => (
              <div key={finding.id} className="relative pl-14">
                {/* Timeline Dot */}
                <div className={`absolute left-4 top-3 w-4 h-4 rounded-full border-2 ${
                  finding.status === 'resolved' ? 'bg-green-500 border-green-400' :
                  finding.status === 'in_progress' ? 'bg-yellow-500 border-yellow-400 animate-pulse' :
                  'bg-red-500 border-red-400'
                }`} />

                <div className={`p-4 rounded-lg border-2 ${severityColors[finding.severity] || severityColors.medium}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={
                          finding.severity === 'critical' ? 'bg-red-500/30 text-red-400' :
                          finding.severity === 'high' ? 'bg-orange-500/30 text-orange-400' :
                          finding.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-400' :
                          'bg-blue-500/30 text-blue-400'
                        }>
                          {finding.severity?.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-white/70 capitalize">
                          {finding.category}
                        </Badge>
                        <Badge className={
                          finding.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          finding.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }>
                          {finding.status}
                        </Badge>
                      </div>
                      <h4 className="text-white font-semibold mb-1">{finding.title}</h4>
                      <p className="text-white/70 text-sm">{finding.description}</p>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-white/50 text-xs">
                        {finding.detected_at && format(new Date(finding.detected_at), 'MMM d, yyyy')}
                      </p>
                      {finding.risk_score && (
                        <p className="text-xl font-bold text-red-400 mt-1">
                          {finding.risk_score}
                        </p>
                      )}
                    </div>
                  </div>

                  {finding.recommendation && (
                    <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                      <p className="text-blue-400 text-xs">
                        💡 {finding.recommendation}
                      </p>
                    </div>
                  )}

                  {finding.status === 'resolved' && finding.resolved_at && (
                    <div className="mt-2 flex items-center gap-2 text-green-400 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Resolved {format(new Date(finding.resolved_at), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sortedFindings.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-white font-semibold">No compliance findings</p>
                <p className="text-white/60 text-sm mt-1">All controls are passing</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}