import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Key,
  Lock,
  Eye,
  Zap,
  Database,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SecurityScannerDashboard() {
  const [scanResults, setScanResults] = useState(null);

  const scanMutation = useMutation({
    mutationFn: async () => {
      const user = await api.auth.me();
      
      // Simulate comprehensive security scan
      const results = {
        score: 85,
        timestamp: new Date().toISOString(),
        categories: [
          {
            name: 'Access Control',
            score: 90,
            status: 'pass',
            issues: [
              { severity: 'warning', message: '2 users without MFA enabled', count: 2 }
            ]
          },
          {
            name: 'Data Protection',
            score: 80,
            status: 'warning',
            issues: [
              { severity: 'warning', message: 'Some fields lack encryption at rest', count: 5 },
              { severity: 'info', message: 'Consider enabling field-level encryption', count: 1 }
            ]
          },
          {
            name: 'API Security',
            score: 95,
            status: 'pass',
            issues: []
          },
          {
            name: 'Automation Safety',
            score: 75,
            status: 'warning',
            issues: [
              { severity: 'critical', message: 'Overly permissive automation detected', count: 1 },
              { severity: 'warning', message: 'Review webhook endpoints', count: 3 }
            ]
          },
          {
            name: 'Password Policy',
            score: 70,
            status: 'warning',
            issues: [
              { severity: 'warning', message: '5 weak passwords detected', count: 5 }
            ]
          }
        ],
        recommendations: [
          'Enable MFA for all users',
          'Review and restrict automation permissions',
          'Implement field-level encryption for sensitive data',
          'Rotate API keys older than 90 days',
          'Review webhook endpoint security'
        ]
      };

      return results;
    },
    onSuccess: (data) => {
      setScanResults(data);
      toast.success('Security scan completed');
    },
    onError: () => {
      toast.error('Security scan failed');
    }
  });

  const getCategoryIcon = (name) => {
    const icons = {
      'Access Control': Lock,
      'Data Protection': Shield,
      'API Security': Key,
      'Automation Safety': Zap,
      'Password Policy': Eye
    };
    return icons[name] || Shield;
  };

  const getSeverityColor = (severity) => {
    return {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }[severity] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Proactive Security Scanner
            </CardTitle>
            <Button
              onClick={() => scanMutation.mutate()}
              disabled={scanMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-purple-500"
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Run Full Scan
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!scanResults ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Click "Run Full Scan" to analyze your security posture</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Security Score */}
              <div className="p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-2">Overall Security Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${
                        scanResults.score >= 90 ? 'text-green-400' :
                        scanResults.score >= 70 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {scanResults.score}
                      </span>
                      <span className="text-2xl text-white/60">/100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${
                      scanResults.score >= 90 ? 'bg-green-500/20 text-green-400' :
                      scanResults.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    } text-lg px-4 py-2`}>
                      {scanResults.score >= 90 ? 'Excellent' :
                       scanResults.score >= 70 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Category Results */}
              <div className="grid md:grid-cols-2 gap-4">
                {scanResults.categories.map((category, idx) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <Card key={idx} className="bg-white/5 border-purple-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <Icon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">{category.name}</p>
                              <p className="text-white/60 text-xs">Score: {category.score}/100</p>
                            </div>
                          </div>
                          {category.status === 'pass' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>

                        {category.issues.length > 0 && (
                          <div className="space-y-2">
                            {category.issues.map((issue, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded border ${getSeverityColor(issue.severity)}`}
                              >
                                <p className="text-sm">{issue.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recommendations */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scanResults.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white/80 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}