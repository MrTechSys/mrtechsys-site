
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Activity,
  BarChart3,
  AlertTriangle,
  Database,
  Settings,
  Code,
  FileText,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

// Import existing security/compliance components
import BehaviorAnomalyMonitor from "../components/security/BehaviorAnomalyMonitor";
import ThreatIntelligenceMonitor from "../components/security/ThreatIntelligenceMonitor";
import IncidentPlaybookManager from "../components/security/IncidentPlaybookManager";
import SignatureRuleManager from "../components/security/SignatureRuleManager";
import CorrelationRuleBuilder from "../components/security/CorrelationRuleBuilder";
import AlertWorkflowManager from "../components/security/AlertWorkflowManager";
import SecuritySetupPanel from "../components/security/SecuritySetupPanel";

export default function SecurityComplianceCenter() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents', user?.current_org_id],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      return await api.entities.Incident.filter({
        org_id: user.current_org_id
      }, '-opened_at', 10);
    },
    enabled: !!user?.current_org_id
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['behavior-anomalies-count', user?.current_org_id],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      return await api.entities.BehaviorAnomaly.filter({
        org_id: user.current_org_id,
        status: 'active'
      });
    },
    enabled: !!user?.current_org_id
  });

  const { data: threats = [] } = useQuery({
    queryKey: ['threats-count'],
    queryFn: async () => {
      return await api.entities.ThreatIntelligence.filter({
        is_blacklisted: true
      }, '-last_seen', 20);
    }
  });

  const { data: complianceControls = [] } = useQuery({
    queryKey: ['compliance-controls', user?.current_org_id],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      return await api.entities.ComplianceControl.filter({
        org_id: user.current_org_id,
        status: 'active'
      });
    },
    enabled: !!user?.current_org_id
  });

  const activeIncidents = incidents.filter(i => i.status !== 'closed');
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-amber-400" />
          Security & Compliance <span className="text-amber-400">Center</span>
        </h1>
        <p className="text-white/70 mt-2">
          Unified SIEM, IDS/IPS, and compliance monitoring platform
        </p>
      </div>

      {/* Top-Level Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Critical</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{activeIncidents.length}</p>
            <p className="text-white/60 text-xs mt-1">Active Incidents</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-400">Anomalies</Badge>
            </div>
            <p className="text-3xl font-bold text-orange-400">{criticalAnomalies.length}</p>
            <p className="text-white/60 text-xs mt-1">Critical Behavior</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Blocked</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">{threats.length}</p>
            <p className="text-white/60 text-xs mt-1">Threat IPs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Compliance</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">{complianceControls.length}</p>
            <p className="text-white/60 text-xs mt-1">Active Controls</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Setup Panel */}
      <SecuritySetupPanel />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-white/5">
          <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20">
            <BarChart3 className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-blue-500/20">
            <Database className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="threats" className="data-[state=active]:bg-red-500/20">
            <Shield className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Threats</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="data-[state=active]:bg-orange-500/20">
            <AlertTriangle className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Incidents</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-green-500/20">
            <FileText className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="devsecops" className="data-[state=active]:bg-purple-500/20">
            <Code className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">DevSecOps</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Core SIEM Modules */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Core SIEM Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl("SystemAnalytics")}>
                  <Card className="p-3 bg-white/5 hover:bg-white/10 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">System Analytics</p>
                          <p className="text-white/60 text-xs">Log aggregation & visualization</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </div>
                  </Card>
                </Link>

                <Link to={createPageUrl("SOC2CommandCenter")}>
                  <Card className="p-3 bg-white/5 hover:bg-white/10 border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">SOC 2 Center</p>
                          <p className="text-white/60 text-xs">Compliance reporting & controls</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </div>
                  </Card>
                </Link>

                <Link to={createPageUrl("SLADashboard")}>
                  <Card className="p-3 bg-white/5 hover:bg-white/10 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">SLA Monitoring</p>
                          <p className="text-white/60 text-xs">Service-level compliance</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </div>
                  </Card>
                </Link>

                <Link to={createPageUrl("TenantSecurityProfile")}>
                  <Card className="p-3 bg-white/5 hover:bg-white/10 border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-white font-medium">Security Profile</p>
                          <p className="text-white/60 text-xs">Policy enforcement & audit</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </div>
                  </Card>
                </Link>
              </CardContent>
            </Card>

            {/* IDS/IPS Layer */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  IDS/IPS Layer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl("SentinelSRE")}>
                  <Card className="p-3 bg-white/5 hover:bg-white/10 border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white font-medium">Sentinel-SRE Agent</p>
                          <p className="text-white/60 text-xs">Real-time traffic monitoring</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </div>
                  </Card>
                </Link>

                <Link to={createPageUrl("SecurityCommandCenter")}>
                  <Card className="p-3 bg-white/5 hover:bg-white/10 border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-white font-medium">Security Command</p>
                          <p className="text-white/60 text-xs">Auto-blocking & playbooks</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </div>
                  </Card>
                </Link>

                <Card className="p-3 bg-white/5 border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium text-sm">Signature Detection</p>
                        <p className="text-white/60 text-xs">Snort/Suricata rules engine</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Active</Badge>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* DevSecOps Integration */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                DevSecOps Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                <Link to={createPageUrl("CICDPipeline")}>
                  <Card className="p-3 bg-white/5 hover:bg-white/10 border-white/10 hover:border-purple-500/30 transition-all cursor-pointer">
                    <p className="text-white font-medium text-sm mb-1">CI/CD Security</p>
                    <p className="text-white/60 text-xs">Pipeline vulnerability scanning</p>
                  </Card>
                </Link>

                <Link to={createPageUrl("APIPlayground")}>
                  <Card className="p-3 bg-white/5 hover:bg-white/10 border-white/10 hover:border-purple-500/30 transition-all cursor-pointer">
                    <p className="text-white font-medium text-sm mb-1">API Security</p>
                    <p className="text-white/60 text-xs">Endpoint testing & compliance</p>
                  </Card>
                </Link>

                <Link to={createPageUrl("AutoDocumentation")}>
                  <Card className="p-3 bg-white/5 hover:bg-white/10 border-white/10 hover:border-purple-500/30 transition-all cursor-pointer">
                    <p className="text-white font-medium text-sm mb-1">Auto Documentation</p>
                    <p className="text-white/60 text-xs">Compliance traceability</p>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Log Aggregation & Normalization</CardTitle>
                <Link to={createPageUrl("SystemAnalytics")}>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-500">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Full View
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 text-sm mb-4">
                View real-time logs from CloudFlip services, external systems, and correlation analysis.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-blue-500/10 border-blue-500/30">
                  <p className="text-blue-400 font-semibold mb-2">Supported Sources</p>
                  <ul className="space-y-1 text-sm text-white/70">
                    <li>• CloudFlip Services</li>
                    <li>• AWS CloudWatch</li>
                    <li>• Azure Monitor</li>
                    <li>• GCP Logging</li>
                    <li>• Firewall Logs</li>
                    <li>• Endpoint Agents</li>
                  </ul>
                </Card>
                <Card className="p-4 bg-green-500/10 border-green-500/30">
                  <p className="text-green-400 font-semibold mb-2">Features</p>
                  <ul className="space-y-1 text-sm text-white/70">
                    <li>• Auto normalization</li>
                    <li>• Field mapping</li>
                    <li>• Real-time ingestion</li>
                    <li>• 90-day retention</li>
                    <li>• Full-text search</li>
                  </ul>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-6">
          <SignatureRuleManager />
          <CorrelationRuleBuilder />
          <BehaviorAnomalyMonitor />
          <ThreatIntelligenceMonitor />
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          <AlertWorkflowManager />
          <IncidentPlaybookManager />
          
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Recent Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incidents.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-green-400/40 mx-auto mb-3" />
                  <p className="text-white/60">No incidents reported</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={
                              incident.severity === 'sev1' ? 'bg-red-500/20 text-red-400' :
                              incident.severity === 'sev2' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }>
                              {incident.severity.toUpperCase()}
                            </Badge>
                            <Badge className={
                              incident.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                              'bg-blue-500/20 text-blue-400'
                            }>
                              {incident.status}
                            </Badge>
                          </div>
                          <p className="text-white font-medium">{incident.title}</p>
                          <p className="text-white/60 text-sm mt-1">{incident.summary}</p>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {format(new Date(incident.opened_at), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">SOC 2 Compliance Dashboard</CardTitle>
                <Link to={createPageUrl("SOC2CommandCenter")}>
                  <Button className="bg-gradient-to-r from-green-600 to-green-500">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Full View
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 text-sm mb-4">
                Monitor compliance controls, evidence collection, and audit readiness.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-green-500/10 border-green-500/30">
                  <p className="text-green-400 font-bold text-2xl">{complianceControls.length}</p>
                  <p className="text-white/60 text-sm">Active Controls</p>
                </Card>
                <Card className="p-4 bg-blue-500/10 border-blue-500/30">
                  <p className="text-blue-400 font-bold text-2xl">98%</p>
                  <p className="text-white/60 text-sm">Compliance Score</p>
                </Card>
                <Card className="p-4 bg-purple-500/10 border-purple-500/30">
                  <p className="text-purple-400 font-bold text-2xl">Audit Ready</p>
                  <p className="text-white/60 text-sm">Status</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DevSecOps Tab */}
        <TabsContent value="devsecops" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Link to={createPageUrl("CICDPipeline")}>
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <Database className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">CI/CD Pipeline Security</h3>
                  <p className="text-white/60 text-sm">Automated security scanning in your deployment pipeline</p>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl("APIPlayground")}>
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <Code className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">API Security Testing</h3>
                  <p className="text-white/60 text-sm">Test endpoints for compliance violations</p>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl("DevOpsPlanner")}>
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">DevOps Planner</h3>
                  <p className="text-white/60 text-sm">Roadmap security requirements</p>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl("AutoDocumentation")}>
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <FileText className="w-12 h-12 text-amber-400 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">Auto Documentation</h3>
                  <p className="text-white/60 text-sm">Compliance audit trails</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
