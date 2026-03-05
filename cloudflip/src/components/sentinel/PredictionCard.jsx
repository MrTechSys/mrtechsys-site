import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  AlertTriangle, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  Loader2,
  Shield,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/api/apiClient';
import { toast } from 'sonner';

const severityConfig = {
  sev1: { color: 'bg-red-500/20 text-red-400 border-red-500/40', icon: '🔴', label: 'Critical' },
  sev2: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: '🟠', label: 'High' },
  sev3: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', icon: '🟡', label: 'Medium' },
  sev4: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: '🔵', label: 'Low' }
};

const randomRadius = () => {
  const radiuses = ['rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl'];
  return radiuses[Math.floor(Math.random() * radiuses.length)];
};

export default function PredictionCard({ prediction, onActionComplete }) {
  const [executing, setExecuting] = useState(false);
  const config = severityConfig[prediction.predicted_severity] || severityConfig.sev3;

  const handleExecuteResponse = async () => {
    setExecuting(true);
    try {
      const { data } = await api.functions.invoke('autoIncidentResponse', {
        predictionId: prediction.prediction_id,
        autoExecute: true
      });

      if (data.success) {
        toast.success(`✅ ${data.actions_taken.length} action(s) executed!`);
        
        // Show integration status
        const integrations = data.integration_status;
        const connected = Object.entries(integrations).filter(([k, v]) => v).map(([k]) => k);
        const missing = Object.entries(integrations).filter(([k, v]) => !v).map(([k]) => k);
        
        if (connected.length > 0) {
          toast.success(`🔗 Notified: ${connected.join(', ')}`);
        }
        if (missing.length > 0) {
          toast.info(`💡 Not configured: ${missing.join(', ')} - Set up in Settings`);
        }

        if (onActionComplete) onActionComplete();
      }
    } catch (error) {
      toast.error('Failed to execute response');
      console.error(error);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${randomRadius()} overflow-hidden`}
    >
      <Card className={`border-2 ${config.color} bg-gradient-to-br from-white/5 to-transparent backdrop-blur`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={`${config.color} text-sm px-3 py-1 ${randomRadius()}`}>
                  {config.icon} {config.label}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 text-sm px-3 py-1 rounded-full">
                  {(prediction.probability * 100).toFixed(0)}% likely
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 text-sm px-3 py-1 rounded-full">
                  {(prediction.confidence * 100).toFixed(0)}% confident
                </Badge>
              </div>
              <CardTitle className="text-white text-xl capitalize">
                {prediction.incident_type.replace(/_/g, ' ')}
              </CardTitle>
              <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expected in ~{prediction.time_to_incident} hour(s)
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Triggering Signals */}
          {prediction.triggering_signals && prediction.triggering_signals.length > 0 && (
            <div className={`p-3 bg-white/5 ${randomRadius()} border border-cyan-500/30`}>
              <p className="text-cyan-400 font-semibold text-xs mb-2">📊 Triggering Signals:</p>
              <div className="space-y-1">
                {prediction.triggering_signals.map((signal, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-white/70">{signal.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono">{signal.current_value}</span>
                      <Badge className={`text-xs ${randomRadius()} ${
                        signal.trend.includes('+') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {signal.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Impact */}
          {prediction.predicted_impact && (
            <div className="grid grid-cols-2 gap-3">
              {prediction.predicted_impact.affected_users && (
                <div className={`p-3 bg-red-500/10 ${randomRadius()} border border-red-500/30`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-red-400" />
                    <p className="text-red-400 text-xs font-semibold">Affected Users</p>
                  </div>
                  <p className="text-white font-bold text-lg">{prediction.predicted_impact.affected_users}</p>
                </div>
              )}
              {prediction.predicted_impact.estimated_downtime_minutes > 0 && (
                <div className={`p-3 bg-orange-500/10 ${randomRadius()} border border-orange-500/30`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <p className="text-orange-400 text-xs font-semibold">Est. Downtime</p>
                  </div>
                  <p className="text-white font-bold text-lg">{prediction.predicted_impact.estimated_downtime_minutes}m</p>
                </div>
              )}
              {prediction.predicted_impact.revenue_at_risk > 0 && (
                <div className={`p-3 bg-yellow-500/10 ${randomRadius()} border border-yellow-500/30 col-span-2`}>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <p className="text-yellow-400 text-xs font-semibold">Revenue at Risk</p>
                  </div>
                  <p className="text-white font-bold text-lg">${prediction.predicted_impact.revenue_at_risk}</p>
                </div>
              )}
            </div>
          )}

          {/* Remediation Steps */}
          {prediction.remediation_steps && prediction.remediation_steps.length > 0 && (
            <div className={`p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 ${randomRadius()} border border-green-500/30`}>
              <p className="text-green-400 font-semibold text-sm mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Preventive Actions:
              </p>
              <ol className="space-y-2">
                {prediction.remediation_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 font-bold text-sm">{idx + 1}.</span>
                    <div className="flex-1">
                      <p className="text-white/90 text-sm">{step.step}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${randomRadius()} ${
                          step.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          step.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {step.priority}
                        </Badge>
                        {step.automation_available && (
                          <Badge className={`bg-cyan-500/20 text-cyan-400 text-xs ${randomRadius()}`}>
                            <Zap className="w-3 h-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                        <span className="text-white/60 text-xs">💡 {step.estimated_impact}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleExecuteResponse}
              disabled={executing}
              className={`flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold ${randomRadius()}`}
            >
              {executing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute Response
                </>
              )}
            </Button>
          </div>

          {/* Similar Incidents */}
          {prediction.similar_incidents && prediction.similar_incidents.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                View {prediction.similar_incidents.length} Similar Past Incident(s)
              </summary>
              <div className={`mt-3 space-y-2 ${randomRadius()} overflow-hidden`}>
                {prediction.similar_incidents.map((inc, idx) => (
                  <div key={idx} className={`p-3 bg-white/5 ${randomRadius()} border border-white/10`}>
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-cyan-400 text-xs">{inc.incident_id}</code>
                      <Badge className="bg-white/10 text-white text-xs">
                        {inc.actual_severity}
                      </Badge>
                    </div>
                    <p className="text-white/70 text-xs">{inc.resolution}</p>
                    <p className="text-white/50 text-xs mt-1">
                      {new Date(inc.occurred_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}