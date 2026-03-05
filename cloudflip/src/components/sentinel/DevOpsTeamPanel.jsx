import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Shield,
  Activity,
  Database,
  Zap,
  TrendingUp,
  FileText,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const agentIcons = {
  'Sentinel-SRE': Shield,
  'Log Analyzer': FileText,
  'Trace Analyzer': Activity,
  'Release Manager': Zap,
  'Data Integrity Agent': Database,
  'Capacity Planner': TrendingUp
};

const phaseConfig = {
  'detection_diagnosis': {
    title: 'Detection & Diagnosis',
    icon: Eye,
    color: 'text-blue-400'
  },
  'root_cause_analysis': {
    title: 'Root Cause Analysis',
    icon: Activity,
    color: 'text-purple-400'
  },
  'remediation_planning': {
    title: 'Remediation Planning',
    icon: FileText,
    color: 'text-amber-400'
  },
  'auto_remediation': {
    title: 'Auto-Remediation',
    icon: Zap,
    color: 'text-green-400'
  },
  'verification': {
    title: 'Verification',
    icon: CheckCircle,
    color: 'text-emerald-400'
  }
};

export default function DevOpsTeamPanel({ activeIncidents = [] }) {
  const [executing, setExecuting] = useState(false);
  const [gameplan, setGameplan] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState({});

  const handleExecuteGameplan = async () => {
    setExecuting(true);
    
    try {
      const endpoints = activeIncidents.flatMap(inc => {
        const match = inc.summary?.match(/\/api\/[^\s]+/);
        return match ? [{ url: match[0], name: inc.title, critical: true }] : [];
      });

      const response = await api.functions.invoke('devOpsTeamOrchestrator', {
        issue_type: 'API Endpoint Outages',
        affected_endpoints: endpoints,
        auto_remediate: true,
        create_incident: true
      });

      setGameplan(response.data.gameplan);
      
      if (response.data.summary.status === 'resolved') {
        toast.success(`✅ All endpoints resolved! (${response.data.summary.duration_seconds}s)`);
      } else {
        toast.warning(`⚠️ Partial fix: ${response.data.summary.endpoints_fixed} fixed, ${response.data.summary.endpoints_still_failing} still failing`);
      }

    } catch (error) {
      toast.error('DevOps team execution failed: ' + error.message);
      console.error('DevOps error:', error);
    } finally {
      setExecuting(false);
    }
  };

  const togglePhase = (phase) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phase]: !prev[phase]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'in_progress':
      case 'partially_resolved':
        return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            DevOps Team AI
          </div>
          <Badge className={`${gameplan?.status === 'resolved' ? 'bg-green-500' : gameplan?.status === 'partially_resolved' ? 'bg-amber-500' : 'bg-blue-500'} text-white`}>
            {gameplan ? `${gameplan.agents_deployed.length} Agents Active` : 'Ready'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameplan && activeIncidents.length > 0 && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white font-medium mb-2">
                  {activeIncidents.length} Active Incident{activeIncidents.length > 1 ? 's' : ''} Detected
                </p>
                <div className="space-y-1 mb-3">
                  {activeIncidents.slice(0, 3).map((inc, idx) => (
                    <p key={idx} className="text-sm text-white/70">
                      • {inc.title}
                    </p>
                  ))}
                </div>
                <Button
                  onClick={handleExecuteGameplan}
                  disabled={executing}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  {executing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deploying Team...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Deploy DevOps Team
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {gameplan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
                <div className="text-xs text-white/60 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(gameplan.status)}
                  <span className="text-sm font-medium text-white capitalize">
                    {gameplan.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
                <div className="text-xs text-white/60 mb-1">Duration</div>
                <div className="text-sm font-bold text-amber-400">
                  {gameplan.duration_seconds}s
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
                <div className="text-xs text-white/60 mb-1">Fixed</div>
                <div className="text-sm font-bold text-green-400">
                  {gameplan.verification_results?.fixed || 0}
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
                <div className="text-xs text-white/60 mb-1">Still Failing</div>
                <div className="text-sm font-bold text-red-400">
                  {gameplan.verification_results?.still_failing || 0}
                </div>
              </div>
            </div>

            {/* Success Rate */}
            {gameplan.verification_results && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Success Rate</span>
                  <span className="text-sm font-bold text-amber-400">
                    {gameplan.verification_results.success_rate}%
                  </span>
                </div>
                <Progress 
                  value={parseFloat(gameplan.verification_results.success_rate)} 
                  className="h-2 bg-white/10"
                />
              </div>
            )}

            {/* Deployed Agents */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Deployed Agents</h4>
              <div className="flex flex-wrap gap-2">
                {gameplan.agents_deployed.map((agent, idx) => {
                  const AgentIcon = agentIcons[agent] || Users;
                  return (
                    <Badge 
                      key={idx}
                      className="bg-blue-500/20 text-blue-300 border-blue-500/30 flex items-center gap-1"
                    >
                      <AgentIcon className="w-3 h-3" />
                      {agent}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Phases */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white mb-3">Execution Phases</h4>
              {gameplan.phases.map((phase, idx) => {
                const config = phaseConfig[phase.phase] || { title: phase.phase, icon: Activity, color: 'text-white' };
                const PhaseIcon = config.icon;
                const isExpanded = expandedPhases[phase.phase];
                const completedTasks = phase.tasks.filter(t => t.status === 'completed').length;
                const totalTasks = phase.tasks.length;

                return (
                  <Collapsible key={idx} open={isExpanded} onOpenChange={() => togglePhase(phase.phase)}>
                    <Card className="bg-white/5 border-amber-500/20">
                      <CollapsibleTrigger asChild>
                        <button className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <PhaseIcon className={`w-5 h-5 ${config.color}`} />
                            <div className="text-left">
                              <p className="text-white font-medium text-sm">{config.title}</p>
                              <p className="text-white/60 text-xs">
                                {completedTasks}/{totalTasks} tasks completed
                              </p>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-white/60 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 space-y-2 border-t border-white/10 pt-2">
                          {phase.tasks.map((task, taskIdx) => (
                            <div key={taskIdx} className="flex items-start gap-2 p-2 bg-white/5 rounded">
                              {getStatusIcon(task.status)}
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm capitalize">
                                  {task.task.replace(/_/g, ' ')}
                                </p>
                                {task.agent && (
                                  <p className="text-white/50 text-xs">Agent: {task.agent}</p>
                                )}
                                {task.error && (
                                  <p className="text-red-400 text-xs mt-1">Error: {task.error}</p>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Root Cause Hypothesis */}
                          {phase.root_cause_hypothesis && (
                            <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                              <p className="text-purple-300 font-medium text-sm mb-2">
                                🔍 Root Cause Hypothesis
                              </p>
                              <p className="text-white text-sm mb-1">
                                <strong>Primary Cause:</strong> {phase.root_cause_hypothesis.primary_cause}
                              </p>
                              <p className="text-white/70 text-xs mb-2">
                                <strong>Confidence:</strong> {(phase.root_cause_hypothesis.confidence * 100).toFixed(0)}%
                              </p>
                              {phase.root_cause_hypothesis.contributing_factors?.length > 0 && (
                                <div>
                                  <p className="text-white/70 text-xs mb-1">Contributing Factors:</p>
                                  <ul className="text-white/60 text-xs space-y-1 ml-4">
                                    {phase.root_cause_hypothesis.contributing_factors.map((factor, i) => (
                                      <li key={i}>• {factor}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Remediation Plan */}
                          {phase.remediation_plan && (
                            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                              <p className="text-amber-300 font-medium text-sm mb-2">
                                🔧 Remediation Plan
                              </p>
                              <p className="text-white/70 text-xs mb-3">{phase.remediation_plan.summary}</p>
                              <div className="space-y-2">
                                {phase.remediation_plan.actions.map((action, i) => (
                                  <div key={i} className="p-2 bg-white/5 rounded">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                                        Priority {action.priority}
                                      </Badge>
                                      {action.automation_available && (
                                        <Badge className="bg-green-500/20 text-green-300 text-xs">
                                          <Zap className="w-2 h-2 mr-1" />
                                          Auto
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-white text-xs font-medium capitalize mb-1">
                                      {action.action_type.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-white/60 text-xs">
                                      {action.steps.join(' → ')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>

            {/* Remediation Actions Taken */}
            {gameplan.remediation_actions && gameplan.remediation_actions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Actions Executed</h4>
                <div className="space-y-2">
                  {gameplan.remediation_actions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-amber-500/20">
                      {action.success ? (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium capitalize">
                          {action.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-white/60 text-xs mt-1">{action.details}</p>
                        {action.instructions && (
                          <p className="text-amber-400 text-xs mt-2">
                            ℹ️ {action.instructions}
                          </p>
                        )}
                        <Badge className="bg-purple-500/20 text-purple-300 text-xs mt-2">
                          {action.mode}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Results */}
            {gameplan.verification_results && (
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                <h4 className="text-green-300 font-medium text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Verification Complete
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-white/60">Endpoints Fixed</p>
                    <p className="text-white font-bold text-lg">{gameplan.verification_results.fixed}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Still Failing</p>
                    <p className="text-white font-bold text-lg">{gameplan.verification_results.still_failing}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {!gameplan && activeIncidents.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
            <p className="text-white/60 text-sm">
              DevOps Team standing by. No active incidents detected.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}