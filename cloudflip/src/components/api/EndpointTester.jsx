import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Terminal, 
  Code, 
  Shield, 
  Workflow, 
  Zap 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DataFlowVisualizer from './DataFlowVisualizer';

export default function EndpointTester({ user, onApiCall }) {
  const [endpointType, setEndpointType] = useState('entity');
  const [entityName, setEntityName] = useState('Lead');
  const [operation, setOperation] = useState('list');
  const [functionName, setFunctionName] = useState('scoreLeadAI');
  const [params, setParams] = useState('{}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [complianceWarnings, setComplianceWarnings] = useState([]);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [lastExecutedCall, setLastExecutedCall] = useState(null);
  const [suggestedScenarios, setSuggestedScenarios] = useState([]);

  const entities = ['Lead', 'Quote', 'Job', 'Invoice', 'Contact', 'Deal', 'Ticket', 'Task', 'ComplianceControl', 'EvidenceItem', 'ComplianceMetric', 'ComplianceAuditLog'];
  const operations = ['list', 'filter', 'create', 'update', 'delete'];
  const functions = [
    'scoreLeadAI',
    'generateAIEmail',
    'lccAssistant',
    'generateAIInsights',
    'calculateReadinessScore',
    'collectComplianceEvidence',
    'reviewEvidenceAI',
    'scenarioSimulator',
    'complianceAuditor',
    'slaMonitor',
    'drHealthCheck'
  ];

  const checkCompliance = async () => {
    if (!params.trim() || params === '{}') {
      toast.warning('Enter parameters to check compliance');
      return;
    }

    setIsCheckingCompliance(true);

    try {
      const parsedParams = JSON.parse(params);
      
      const { data } = await api.functions.invoke('complianceAuditor', {
        requestData: parsedParams,
        regulations: ['gdpr', 'pci', 'hipaa']
      });

      if (data.success) {
        const allWarnings = [...data.issues, ...data.warnings];
        setComplianceWarnings(allWarnings);
        
        if (allWarnings.length === 0) {
          toast.success('✅ No compliance issues detected!');
        } else {
          const criticalCount = allWarnings.filter(w => w.severity === 'critical').length;
          if (criticalCount > 0) {
            toast.error(`⚠️ ${criticalCount} critical compliance issue(s) found!`);
          } else {
            toast.warning(`${allWarnings.length} compliance warning(s) found`);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to check compliance');
      console.error('Compliance check error:', error);
    } finally {
      setIsCheckingCompliance(false);
    }
  };

  useEffect(() => {
    const scenarios = {
      Lead: [
        "Create this lead, send a welcome email, and update status to 'contacted'",
        "Create lead, score with AI, enroll in nurture workflow",
        "Create lead, generate AI response, create follow-up task"
      ],
      Contact: [
        "Create contact, link to a deal, add interaction activity",
        "Update contact lifecycle stage, create email draft, log CRM activity",
        "Create contact, assign to sales rep, schedule follow-up"
      ],
      Quote: [
        "Create quote, send to client, convert to invoice when accepted",
        "Create quote, generate PDF, send email notification",
        "Create quote, client accepts, create job from quote"
      ],
      Invoice: [
        "Create invoice, send payment reminder, mark as paid when payment received",
        "Create invoice, process payment, generate receipt",
        "Update invoice status, send confirmation email, update client record"
      ],
      Job: [
        "Create job, assign team members, create task checklist",
        "Schedule job, send client notification, create calendar event",
        "Create job, break into tasks, track progress to completion"
      ]
    };

    setSuggestedScenarios(scenarios[entityName] || []);
  }, [entityName]);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let result;
      let resultId = null;
      const parsedParams = JSON.parse(params);

      if (endpointType === 'entity') {
        switch (operation) {
          case 'list':
            result = await api.entities[entityName].list(
              parsedParams.sortBy || '-created_date',
              parsedParams.limit || 20
            );
            break;
          case 'filter':
            result = await api.entities[entityName].filter(
              parsedParams.query || {},
              parsedParams.sortBy,
              parsedParams.limit
            );
            break;
          case 'create':
            result = await api.entities[entityName].create(parsedParams.data || {});
            resultId = result?.id;
            break;
          case 'update':
            result = await api.entities[entityName].update(
              parsedParams.id,
              parsedParams.data || {}
            );
            resultId = parsedParams.id;
            break;
          case 'delete':
            result = await api.entities[entityName].delete(parsedParams.id);
            resultId = parsedParams.id;
            break;
        }

        if (onApiCall && resultId) {
          onApiCall(entityName, resultId, operation);
        }

        setLastExecutedCall({ entityType: entityName, entityId: resultId, action: operation });
      } else {
        const { data } = await api.functions.invoke(functionName, parsedParams);
        result = data;
      }

      setResponse(result);
      toast.success('Request successful!');
    } catch (err) {
      setError(err.message || 'Request failed');
      toast.error('Request failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    toast.success('Response copied to clipboard');
  };

  const getParamsPlaceholder = () => {
    if (endpointType === 'entity') {
      switch (operation) {
        case 'list':
          return '{\n  "sortBy": "-created_date",\n  "limit": 20\n}';
        case 'filter':
          if (entityName === 'ComplianceControl') {
            return '{\n  "query": { "category": "security", "status": "active" },\n  "sortBy": "-created_date",\n  "limit": 10\n}';
          } else if (entityName === 'EvidenceItem') {
            return '{\n  "query": { "status": "approved" },\n  "sortBy": "-collected_at",\n  "limit": 10\n}';
          }
          return '{\n  "query": { "status": "new" },\n  "sortBy": "-created_date",\n  "limit": 10\n}';
        case 'create':
          if (entityName === 'ComplianceControl') {
            return '{\n  "data": {\n    "control_id": "SEC-1.1",\n    "category": "security",\n    "name": "Access Control",\n    "owner": "admin@example.com"\n  }\n}';
          } else if (entityName === 'EvidenceItem') {
            return '{\n  "data": {\n    "control_id": "control-id-here",\n    "name": "Q4 2024 Audit",\n    "file_url": "https://...",\n    "file_type": "report"\n  }\n}';
          }
          return '{\n  "data": {\n    "name": "John Doe",\n    "email": "john@example.com"\n  }\n}';
        case 'update':
          return '{\n  "id": "entity-id-here",\n  "data": {\n    "status": "qualified"\n  }\n}';
        case 'delete':
          return '{\n  "id": "entity-id-here"\n}';
      }
    } else {
      switch (functionName) {
        case 'collectComplianceEvidence':
          return '{\n  "controlId": "control-id-here",\n  "source": "github"\n}';
        case 'reviewEvidenceAI':
          return '{\n  "evidenceId": "evidence-id-here"\n}';
        case 'scoreLeadAI':
          return '{\n  "leadId": "lead-id-here",\n  "message": "I need HVAC repair ASAP",\n  "source": "web"\n}';
        case 'generateAIEmail':
          return '{\n  "relatedType": "lead",\n  "relatedId": "lead-id-here",\n  "purpose": "follow_up"\n}';
        case 'lccAssistant':
          return '{\n  "command": "/lcc status",\n  "params": { "service": "api" }\n}';
        default:
          return '{}';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-[#f4d35e]" />
              Request Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Endpoint Type</Label>
              <Select value={endpointType} onValueChange={setEndpointType}>
                <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                  <SelectItem value="entity">Entity API</SelectItem>
                  <SelectItem value="function">Backend Function</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {endpointType === 'entity' ? (
              <>
                <div>
                  <Label className="text-white">Entity</Label>
                  <Select value={entityName} onValueChange={setEntityName}>
                    <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                      {entities.map(e => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Operation</Label>
                  <Select value={operation} onValueChange={setOperation}>
                    <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                      {operations.map(op => (
                        <SelectItem key={op} value={op}>{op}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div>
                <Label className="text-white">Function</Label>
                <Select value={functionName} onValueChange={setFunctionName}>
                  <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                    {functions.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white">Parameters (JSON)</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={checkCompliance}
                  disabled={isCheckingCompliance}
                  className="border-[#f4d35e]/30 text-[#f4d35e] hover:bg-[#f4d35e]/10"
                >
                  {isCheckingCompliance ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      Check Compliance
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={params}
                onChange={(e) => {
                  setParams(e.target.value);
                  if (complianceWarnings.length > 0) {
                    setComplianceWarnings([]);
                  }
                }}
                placeholder={getParamsPlaceholder()}
                rows={8}
                className="bg-white/5 border-[#f4d35e]/30 text-white font-mono text-sm"
              />

              <AnimatePresence>
                {complianceWarnings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2"
                  >
                    {complianceWarnings.slice(0, 5).map((warning, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-3 rounded-lg border ${
                          warning.severity === 'critical' 
                            ? 'bg-red-500/10 border-red-500/30' 
                            : 'bg-yellow-500/10 border-yellow-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            warning.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                          }`} />
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${
                              warning.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {warning.message}
                            </p>
                            {warning.suggestion && (
                              <p className="text-white/70 text-xs mt-1">{warning.suggestion}</p>
                            )}
                            {warning.regulations && (
                              <div className="flex gap-1 mt-2">
                                {warning.regulations.map(reg => (
                                  <Badge key={reg} className="bg-white/10 text-white text-xs uppercase">
                                    {reg}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              onClick={handleExecute}
              disabled={loading || complianceWarnings.some(w => w.severity === 'critical')}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute Request
                </>
              )}
            </Button>

            {complianceWarnings.some(w => w.severity === 'critical') && (
              <p className="text-red-400 text-xs text-center">
                ⚠️ Fix critical compliance issues before executing
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#f4d35e]" />
                Response
              </CardTitle>
              {response && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyResponse}
                  className="border-[#f4d35e]/30 text-white hover:bg-white/10"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!response && !error && (
              <div className="text-center py-12">
                <Code className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">Execute a request to see the response</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-red-400">Error</span>
                </div>
                <pre className="text-sm text-red-300 whitespace-pre-wrap">{error}</pre>
              </div>
            )}

            {response && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-400">Success</span>
                  <Badge className="bg-green-500/20 text-green-400 ml-auto">
                    {Array.isArray(response) ? `${response.length} records` : 'Object'}
                  </Badge>
                </div>
                <pre className="bg-[#0a1929] p-4 rounded-lg text-xs text-[#3cf7d4] overflow-x-auto max-h-[500px] overflow-y-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {lastExecutedCall && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DataFlowVisualizer 
            entityType={lastExecutedCall.entityType}
            entityId={lastExecutedCall.entityId}
            action={lastExecutedCall.action}
          />
        </motion.div>
      )}

      {suggestedScenarios.length > 0 && response && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-[#f4d35e]" />
                Try These Multi-Step Scenarios
              </CardTitle>
              <p className="text-white/60 text-sm">
                Based on your {entityName} operation, here are suggested workflow simulations
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {suggestedScenarios.map((scenario, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer"
                    onClick={() => {
                      toast.success('Scenario copied! Go to Scenarios tab to run it.');
                      navigator.clipboard.writeText(scenario);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-white/80 text-sm">{scenario}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}