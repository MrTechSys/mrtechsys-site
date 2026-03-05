
import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Loader2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ComplianceAuditor() {
  const [requestData, setRequestData] = useState('');
  const [responseData, setResponseData] = useState('');
  const [regulations, setRegulations] = useState(['gdpr', 'pci', 'hipaa']);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState(null);

  const handleRunAudit = async () => {
    if (!requestData && !responseData) {
      toast.error('Please provide request or response data to audit');
      return;
    }

    setIsAuditing(true);
    setAuditResults(null);

    try {
      let reqData = null;
      let resData = null;

      if (requestData.trim()) {
        try {
          reqData = JSON.parse(requestData);
        } catch {
          toast.error('Invalid JSON in request data');
          setIsAuditing(false);
          return;
        }
      }

      if (responseData.trim()) {
        try {
          resData = JSON.parse(responseData);
        } catch {
          toast.error('Invalid JSON in response data');
          setIsAuditing(false);
          return;
        }
      }

      const { data } = await api.functions.invoke('complianceAuditor', {
        requestData: reqData,
        responseData: resData,
        regulations: regulations, // Using existing state variable 'regulations'
        endpoint: 'api-playground-test' // New parameter
      });

      if (data.success) {
        setAuditResults(data);
        
        // Updated toast notification logic
        if (data.status === 'compliant') {
          toast.success(`✅ Compliant! Score: ${data.compliance_score}/100`);
        } else if (data.summary.critical_issues > 0) {
          toast.error(`🚨 ${data.summary.critical_issues} critical issue(s) found!`);
        } else { // This implies data.summary.warnings > 0 or other status
          toast.warning(`⚠️ ${data.summary.warnings} warning(s) found`);
        }

        // Auto-create findings in dashboard
        if (data.summary.critical_issues > 0 || data.summary.warnings > 0) {
          toast.info('📊 Findings logged to Compliance Dashboard');
        }
      } else {
        // Handle cases where data.success is false from the API
        toast.error('Audit failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Audit failed: ' + error.message); // Updated error message
      console.error('Audit error:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const toggleRegulation = (reg) => {
    setRegulations(prev => 
      prev.includes(reg) 
        ? prev.filter(r => r !== reg)
        : [...prev, reg]
    );
  };

  const exampleData = {
    request: {
      name: "John Doe",
      email: "john@example.com",
      phone: "555-123-4567",
      ssn: "123-45-6789"
    },
    response: {
      id: "lead_123",
      name: "John Doe",
      email: "john@example.com",
      phone: "555-123-4567",
      created_date: "2024-11-08T12:00:00Z"
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/5 border-[#f4d35e]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#f4d35e]" />
            Privacy Guardian - Compliance Auditor
          </CardTitle>
          <p className="text-white/60 text-sm">
            Automatically detect GDPR, HIPAA, and PCI compliance issues in API requests and responses
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Regulations Selection */}
          <div>
            <Label className="text-white mb-3 block">Select Regulations to Check</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="gdpr"
                  checked={regulations.includes('gdpr')}
                  onCheckedChange={() => toggleRegulation('gdpr')}
                  className="border-[#f4d35e]/30"
                />
                <Label htmlFor="gdpr" className="text-white cursor-pointer">
                  <Badge className="bg-blue-500/20 text-blue-400">GDPR</Badge>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hipaa"
                  checked={regulations.includes('hipaa')}
                  onCheckedChange={() => toggleRegulation('hipaa')}
                  className="border-[#f4d35e]/30"
                />
                <Label htmlFor="hipaa" className="text-white cursor-pointer">
                  <Badge className="bg-purple-500/20 text-purple-400">HIPAA</Badge>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pci"
                  checked={regulations.includes('pci')}
                  onCheckedChange={() => toggleRegulation('pci')}
                  className="border-[#f4d35e]/30"
                />
                <Label htmlFor="pci" className="text-white cursor-pointer">
                  <Badge className="bg-green-500/20 text-green-400">PCI-DSS</Badge>
                </Label>
              </div>
            </div>
          </div>

          {/* Request Data */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white">Request Payload (JSON)</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRequestData(JSON.stringify(exampleData.request, null, 2))}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                Load Example
              </Button>
            </div>
            <Textarea
              value={requestData}
              onChange={(e) => setRequestData(e.target.value)}
              placeholder='{"name": "John Doe", "email": "john@example.com", "ssn": "123-45-6789"}'
              rows={6}
              className="bg-black/20 border-[#f4d35e]/30 text-white placeholder:text-white/40 font-mono text-xs"
            />
          </div>

          {/* Response Data */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white">Response Payload (JSON)</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setResponseData(JSON.stringify(exampleData.response, null, 2))}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                Load Example
              </Button>
            </div>
            <Textarea
              value={responseData}
              onChange={(e) => setResponseData(e.target.value)}
              placeholder='{"id": "123", "name": "John Doe", "email": "john@example.com"}'
              rows={6}
              className="bg-black/20 border-[#f4d35e]/30 text-white placeholder:text-white/40 font-mono text-xs"
            />
          </div>

          <Button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            {isAuditing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Auditing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Run Compliance Audit
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audit Results */}
      <AnimatePresence>
        {auditResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Compliance Score */}
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-2">Compliance Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${
                        auditResults.compliance_score >= 90 ? 'text-green-400' :
                        auditResults.compliance_score >= 70 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {auditResults.compliance_score}
                      </span>
                      <span className="text-2xl text-white/60">/100</span>
                    </div>
                  </div>
                  <Badge className={`text-lg px-4 py-2 ${
                    auditResults.status === 'compliant' ? 'bg-green-500/20 text-green-400' :
                    auditResults.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {auditResults.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{auditResults.summary.critical_issues}</p>
                    <p className="text-white/60 text-xs">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{auditResults.summary.warnings}</p>
                    <p className="text-white/60 text-xs">Warnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{auditResults.summary.suggestions}</p>
                    <p className="text-white/60 text-xs">Suggestions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{auditResults.summary.total_findings}</p>
                    <p className="text-white/60 text-xs">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critical Issues */}
            {auditResults.issues.length > 0 && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Critical Issues ({auditResults.issues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {auditResults.issues.map((issue, idx) => (
                    <div key={idx} className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-400 font-semibold mb-1">{issue.message}</p>
                          <div className="flex gap-2 mb-2">
                            {issue.regulations.map(reg => (
                              <Badge key={reg} className="bg-red-500/20 text-red-300 text-xs uppercase">
                                {reg}
                              </Badge>
                            ))}
                          </div>
                          <div className="p-3 bg-black/20 rounded mt-2">
                            <p className="text-white/70 text-sm">
                              <strong className="text-white">Fix:</strong> {issue.suggestion}
                            </p>
                          </div>
                          {issue.count > 0 && (
                            <p className="text-red-300 text-xs mt-2">
                              Found {issue.count} occurrence(s)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {auditResults.warnings.length > 0 && (
              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-yellow-400" />
                    Warnings ({auditResults.warnings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {auditResults.warnings.map((warning, idx) => (
                    <div key={idx} className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-yellow-400 font-semibold mb-1">{warning.message}</p>
                          <div className="flex gap-2 mb-2">
                            {warning.regulations.map(reg => (
                              <Badge key={reg} className="bg-yellow-500/20 text-yellow-300 text-xs uppercase">
                                {reg}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-white/70 text-sm">{warning.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {auditResults.suggestions.length > 0 && (
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                    Best Practice Suggestions ({auditResults.suggestions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {auditResults.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-blue-400 font-semibold mb-1">{suggestion.message}</p>
                          <p className="text-white/70 text-sm">{suggestion.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
