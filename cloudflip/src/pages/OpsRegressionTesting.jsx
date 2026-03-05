
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Play,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowLeft,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#f4d35e', '#3cf7d4', '#3b82f6', '#10b981', '#ef4444', '#a855f7'];

export default function OpsRegressionTesting() {
  const [user, setUser] = useState(null);
  const [selectedService, setSelectedService] = useState('all');
  const [runningTest, setRunningTest] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.entities.Service.filter({ org_id: user.current_org_id }),
    enabled: !!user
  });

  const { data: tests = [] } = useQuery({
    queryKey: ['regression-tests'],
    queryFn: () => api.entities.RegressionTest.filter({
      org_id: user.current_org_id
    }, '-started_at'),
    enabled: !!user
  });

  const { data: baselines = [] } = useQuery({
    queryKey: ['baselines'],
    queryFn: () => api.entities.BaselineSnapshot.filter({
      org_id: user.current_org_id
    }, '-captured_at', 10),
    enabled: !!user
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['multivariate-anomalies'],
    queryFn: () => api.entities.MultiVariateAnomaly.filter({
      org_id: user.current_org_id,
      status: { $in: ['detected', 'investigating'] }
    }, '-detected_at'),
    enabled: !!user
  });

  const handleRunTest = async () => {
    setRunningTest(true);
    try {
      const { data } = await api.functions.invoke('regressionTester', {
        orgId: user.current_org_id,
        serviceId: selectedService !== 'all' ? selectedService : null,
        baselineSnapshotId: baselines[0]?.id
      });

      queryClient.invalidateQueries({ queryKey: ['regression-tests'] });
      
      if (data.regressions_count > 0) {
        toast.error(`Test failed: ${data.regressions_count} regressions detected`);
      } else {
        toast.success('All regression tests passed!');
      }
    } catch (error) {
      toast.error('Test execution failed');
      console.error(error);
    } finally {
      setRunningTest(false);
    }
  };

  // Calculate stats
  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const passRate = tests.length > 0 ? (passedTests / tests.length) * 100 : 0;

  // Regression trend data
  const regressionTrend = tests.slice(0, 20).reverse().map(t => ({
    date: new Date(t.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    regressions: t.regressions?.length || 0,
    improvements: t.improvements?.length || 0
  }));

  // Test type distribution
  const typeDistribution = Object.entries(
    tests.reduce((acc, t) => {
      acc[t.test_type] = (acc[t.test_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Anomaly scatter data
  const anomalyScatter = anomalies.map(a => ({
    severity: a.severity_score,
    confidence: (a.ai_hypothesis?.confidence || 0) * 100,
    pattern: a.pattern_type
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link to={createPageUrl("LaunchControlCenter")}>
          <button className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Launch Control
          </button>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-[#f4d35e]" />
              Regression <span className="text-[#f4d35e]">Testing</span>
            </h1>
            <p className="text-white/70 mt-1">AI-powered performance regression detection</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-48 bg-white/5 border-[#f4d35e]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                <SelectItem value="all">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.service_id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleRunTest}
              disabled={runningTest || baselines.length === 0}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              {runningTest ? (
                <>Testing...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardContent className="p-6 text-center">
            <p className="text-white/60 text-sm mb-2">Pass Rate</p>
            <p className={`text-4xl font-bold ${passRate >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>
              {passRate.toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-green-500/20">
          <CardContent className="p-6 text-center">
            <p className="text-white/60 text-sm mb-2">Passed</p>
            <p className="text-4xl font-bold text-green-400">{passedTests}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-red-500/20">
          <CardContent className="p-6 text-center">
            <p className="text-white/60 text-sm mb-2">Failed</p>
            <p className="text-4xl font-bold text-red-400">{failedTests}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-purple-500/20">
          <CardContent className="p-6 text-center">
            <p className="text-white/60 text-sm mb-2">Anomalies</p>
            <p className="text-4xl font-bold text-purple-400">{anomalies.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Regression Trend */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Regression Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={regressionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 11 }} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="regressions" stroke="#ef4444" strokeWidth={2} name="Regressions" />
                <Line type="monotone" dataKey="improvements" stroke="#10b981" strokeWidth={2} name="Improvements" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Test Type Distribution */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Anomaly Severity Scatter */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white">Multi-Variate Anomaly Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                <XAxis 
                  dataKey="severity" 
                  name="Severity" 
                  tick={{ fill: '#fff' }}
                  label={{ value: 'Severity Score', position: 'bottom', fill: '#fff' }}
                />
                <YAxis 
                  dataKey="confidence" 
                  name="Confidence" 
                  tick={{ fill: '#fff' }}
                  label={{ value: 'AI Confidence %', angle: -90, position: 'left', fill: '#fff' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter data={anomalyScatter} fill="#f4d35e" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Baseline Timeline */}
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#3cf7d4]" />
              Available Baselines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {baselines.map((baseline) => (
                <div key={baseline.id} className="p-3 bg-white/5 rounded-lg border border-[#f4d35e]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{baseline.snapshot_id}</span>
                    <Badge className="bg-[#f4d35e]/20 text-[#f4d35e] text-xs">
                      {baseline.system_health_pct?.toFixed(0)}% health
                    </Badge>
                  </div>
                  <p className="text-white/60 text-xs">
                    {new Date(baseline.captured_at).toLocaleString()}
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    {baseline.services_state?.length || 0} services • {baseline.snapshot_type}
                  </p>
                </div>
              ))}

              {baselines.length === 0 && (
                <p className="text-white/60 text-center py-8 text-sm">
                  No baselines captured yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests */}
      <Card className="bg-white/5 border-[#f4d35e]/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Recent Regression Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tests.slice(0, 10).map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-lg border ${
                  test.status === 'passed' ? 'bg-green-500/10 border-green-500/30' :
                  test.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {test.status === 'passed' ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : test.status === 'failed' ? (
                      <XCircle className="w-6 h-6 text-red-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">{test.test_id}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(test.started_at).toLocaleString()} • {test.test_type}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${
                    test.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                    test.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  } border-0`}>
                    {test.status}
                  </Badge>
                </div>

                {/* Regressions */}
                {test.regressions && test.regressions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-red-400 text-sm font-medium mb-2">
                      <TrendingDown className="w-4 h-4 inline mr-1" />
                      Regressions Detected ({test.regressions.length})
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {test.regressions.map((reg, idx) => (
                        <div key={idx} className="p-2 bg-red-500/20 rounded text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-white/80">{reg.metric}</span>
                            <Badge className={`text-xs ${
                              reg.severity === 'critical' ? 'bg-red-600/30 text-red-300' :
                              reg.severity === 'major' ? 'bg-orange-600/30 text-orange-300' :
                              'bg-yellow-600/30 text-yellow-300'
                            }`}>
                              {reg.severity}
                            </Badge>
                          </div>
                          <p className="text-red-400 font-bold text-xs mt-1">
                            +{reg.delta_pct.toFixed(1)}% degradation
                          </p>
                          <p className="text-white/60 text-xs">
                            {reg.baseline_value.toFixed(2)} → {reg.current_value.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {test.improvements && test.improvements.length > 0 && (
                  <div className="mb-3">
                    <p className="text-green-400 text-sm font-medium mb-2">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      Improvements ({test.improvements.length})
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {test.improvements.map((imp, idx) => (
                        <div key={idx} className="p-2 bg-green-500/20 rounded text-sm">
                          <span className="text-white/80">{imp.metric}</span>
                          <p className="text-green-400 font-bold text-xs">
                            {imp.improvement_pct.toFixed(1)}% better
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                {test.ai_analysis && (
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 font-medium text-sm">AI Analysis</span>
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        {(test.ai_analysis.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <p className="text-white/80 text-sm mb-2">{test.ai_analysis.root_cause_hypothesis}</p>
                    <p className="text-white/70 text-xs">{test.ai_analysis.recommendation}</p>
                  </div>
                )}
              </div>
            ))}

            {tests.length === 0 && (
              <p className="text-white/60 text-center py-12">No regression tests run yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Multi-Variate Anomalies */}
      <Card className="bg-white/5 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white">Active Multi-Variate Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <p className="text-white/60 text-center py-8">No active anomalies detected</p>
          ) : (
            <div className="space-y-3">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{anomaly.pattern_type.replace(/_/g, ' ')}</h4>
                      <Badge className={`mt-1 text-xs ${
                        anomaly.severity_score >= 75 ? 'bg-red-500/20 text-red-400' :
                        anomaly.severity_score >= 50 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        Severity: {anomaly.severity_score}
                      </Badge>
                    </div>
                    <Badge className={`${
                      anomaly.status === 'detected' ? 'bg-red-500/20 text-red-400' :
                      anomaly.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {anomaly.status}
                    </Badge>
                  </div>
                  
                  {anomaly.correlated_metrics && (
                    <div className="space-y-2 mb-3">
                      {anomaly.correlated_metrics.slice(0, 3).map((metric, idx) => (
                        <div key={idx} className="p-2 bg-white/5 rounded text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="text-white/80">{metric.metric}</span>
                            <span className={`font-semibold ${
                              metric.deviation_pct > 0 ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {metric.deviation_pct > 0 ? '+' : ''}{metric.deviation_pct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-white/50">
                            <span>Baseline: {metric.baseline}</span>
                            <span>Current: {metric.current}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {anomaly.ai_hypothesis && (
                    <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                      <p className="text-blue-400 font-medium text-xs mb-1">AI Root Cause Analysis:</p>
                      <p className="text-white/80 text-xs mb-2">{anomaly.ai_hypothesis.root_cause}</p>
                      {anomaly.ai_hypothesis.recommended_investigation && (
                        <div className="mt-2">
                          <p className="text-white/60 text-xs mb-1">Investigate:</p>
                          <ul className="space-y-1">
                            {anomaly.ai_hypothesis.recommended_investigation.slice(0, 3).map((step, idx) => (
                              <li key={idx} className="text-white/70 text-xs flex items-start gap-1">
                                <span className="text-blue-400">→</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
