
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Save,
  AlertTriangle,
  CheckCircle,
  Settings,
  Target,
  Zap,
  Users,
  Lock,
  Clock,
  Bell,
  Sparkles,
  FileText,
  Search,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const COMPLIANCE_FRAMEWORKS = {
  soc2: {
    name: 'SOC 2 Type II',
    icon: '🏢',
    description: 'Trust Services Criteria - Security, Availability, Confidentiality, Privacy, Processing Integrity',
    controls: [
      { id: 'CC6.1', category: 'security', name: 'Logical Access Controls', automated: true },
      { id: 'CC6.2', category: 'security', name: 'System Monitoring', automated: true },
      { id: 'CC7.2', category: 'availability', name: 'System Availability', automated: false },
      { id: 'CC8.1', category: 'confidentiality', name: 'Data Classification', automated: false },
      { id: 'PI1.1', category: 'privacy', name: 'Privacy Notice', automated: false }
    ]
  },
  gdpr: {
    name: 'GDPR',
    icon: '🇪🇺',
    description: 'EU General Data Protection Regulation',
    controls: [
      { id: 'GDPR-7.1', category: 'privacy', name: 'Data Subject Rights', automated: false },
      { id: 'GDPR-32', category: 'security', name: 'Data Security Measures', automated: true },
      { id: 'GDPR-33', category: 'confidentiality', name: 'Breach Notification', automated: true },
      { id: 'GDPR-25', category: 'security', name: 'Privacy by Design', automated: false }
    ]
  },
  hipaa: {
    name: 'HIPAA',
    icon: '🏥',
    description: 'Health Insurance Portability and Accountability Act',
    controls: [
      { id: 'HIPAA-164.308', category: 'security', name: 'Security Management Process', automated: true },
      { id: 'HIPAA-164.312', category: 'confidentiality', name: 'Technical Safeguards', automated: true },
      { id: 'HIPAA-164.530', category: 'privacy', name: 'Privacy Rule Compliance', automated: false }
    ]
  },
  pci_dss: {
    name: 'PCI DSS',
    icon: '💳',
    description: 'Payment Card Industry Data Security Standard',
    controls: [
      { id: 'PCI-1.1', category: 'security', name: 'Firewall Configuration', automated: true },
      { id: 'PCI-3.4', category: 'confidentiality', name: 'Card Data Encryption', automated: true },
      { id: 'PCI-10.1', category: 'security', name: 'Audit Logging', automated: true }
    ]
  },
  iso27001: {
    name: 'ISO 27001',
    icon: '🔐',
    description: 'Information Security Management System',
    controls: [
      { id: 'A.5.1', category: 'security', name: 'Information Security Policies', automated: false },
      { id: 'A.9.2', category: 'security', name: 'User Access Management', automated: true },
      { id: 'A.12.3', category: 'availability', name: 'Backup & Recovery', automated: true }
    ]
  }
};

export default function TenantSecurityProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    profile_name: '',
    industry_vertical: 'other',
    data_sensitivity_level: 'internal',
    regulatory_requirements: ['soc2'],
    custom_controls: [],
    risk_thresholds: {
      critical_finding_auto_escalate: false,
      high_finding_sla_hours: 24,
      medium_finding_sla_hours: 72,
      low_finding_sla_hours: 168,
      auto_remediate_low: false,
      auto_remediate_medium: false,
      max_security_alert_risk_score: 70
    },
    monitoring_preferences: {
      real_time_alerts: false,
      alert_channels: [],
      alert_contacts: [],
      daily_digest: false,
      weekly_report: false,
      evidence_auto_collect: false
    },
    compliance_targets: {
      target_overall_score: 85,
      min_control_coverage_pct: 95,
      max_open_critical_findings: 0,
      max_open_high_findings: 3,
      evidence_approval_rate_target: 90
    },
    auto_remediation_config: {
      enabled: false,
      allowed_severities: [],
      sentinel_integration: false,
      approval_required_for_medium: false,
      max_auto_remediation_per_day: 10,
      rollback_on_failure: false
    }
  });
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['security-profile', user?.current_org_id],
    queryFn: async () => {
      if (!user?.current_org_id) return null; // Keep this check as it's for fetching the profile
      const profiles = await api.entities.TenantSecurityProfile.filter({ 
        org_id: user?.current_org_id,
        is_active: true
      });
      
      if (profiles.length > 0) {
        const p = profiles[0];
        setFormData(prevData => ({
          ...prevData,
          profile_name: p.profile_name ?? prevData.profile_name,
          industry_vertical: p.industry_vertical ?? prevData.industry_vertical,
          data_sensitivity_level: p.data_sensitivity_level ?? prevData.data_sensitivity_level,
          regulatory_requirements: p.regulatory_requirements ?? prevData.regulatory_requirements,
          custom_controls: p.custom_controls ?? prevData.custom_controls,
          risk_thresholds: {
            ...prevData.risk_thresholds,
            ...(p.risk_thresholds || {})
          },
          monitoring_preferences: {
            ...prevData.monitoring_preferences,
            ...(p.monitoring_preferences || {})
          },
          compliance_targets: {
            ...prevData.compliance_targets,
            ...(p.compliance_targets || {})
          },
          auto_remediation_config: {
            ...prevData.auto_remediation_config,
            ...(p.auto_remediation_config || {})
          }
        }));
        return p;
      }
      return null;
    },
    enabled: !!user?.current_org_id
  });

  const { data: adminSettings = [] } = useQuery({
    queryKey: ['admin-settings', user?.current_org_id], // Add user.current_org_id to key to ensure re-fetch on org change
    queryFn: async () => {
      // The outline changed `enabled: !!user?.current_org_id` to `!!user`.
      // The original code had `if (!user?.current_org_id) return [];`
      // The outline then removed this check and added a filter.
      // Combining the previous approach with the new filter.
      if (!user?.current_org_id) return [];
      const settings = await api.entities.AdminSettings.filter({
        org_id: user.current_org_id,
      });
      return settings;
    },
    enabled: !!user?.current_org_id // Revert to original `enabled` state based on `current_org_id`
  });

  const currentAdminSettings = adminSettings[0] || {};

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // The `if (!user?.current_org_id)` check was removed in the outline,
      // but `enabled: !!user?.current_org_id` on the queryFn should prevent this from running if not available.
      // For mutation, it's safer to ensure user context.
      if (!user?.current_org_id) {
        throw new Error("User organization not found.");
      }
      if (profile?.id) {
        return await api.entities.TenantSecurityProfile.update(profile.id, {
          ...data,
          last_updated_by: user.id
        });
      } else {
        return await api.entities.TenantSecurityProfile.create({
          org_id: user.current_org_id,
          ...data,
          created_by: user.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-profile'] });
      toast.success("Security profile saved!");
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error("Failed to save profile");
    }
  });

  const generateAIControlsMutation = useMutation({
    mutationFn: async () => {
      // The `if (!user?.current_org_id)` check was removed in the outline.
      // Assuming user.current_org_id will be available if this mutation is triggered.
      if (!user?.current_org_id) { // Re-adding for robustness
        throw new Error("User organization not found.");
      }
      const { data } = await api.functions.invoke('aiComplianceAuditor', {
        action: 'map_controls',
        org_id: user.current_org_id,
        industry_vertical: formData.industry_vertical,
        data_sensitivity: formData.data_sensitivity_level,
        frameworks: formData.regulatory_requirements
      });
      return data;
    },
    onSuccess: (data) => {
      setAiSuggestions(data);
      toast.success("AI generated compliance roadmap!");
    },
    onError: (error) => {
      console.error('AI generation error:', error);
      toast.error("AI analysis failed - continuing with manual config");
    }
  });

  const updateAdminSettingsMutation = useMutation({
    mutationFn: async (updates) => {
      // The `if (!user?.current_org_id)` check was removed in the outline.
      // Assuming user.current_org_id will be available if this mutation is triggered.
      if (!user?.current_org_id) { // Re-adding for robustness
        throw new Error("User organization not found.");
      }
      if (currentAdminSettings.id) {
        return await api.entities.AdminSettings.update(currentAdminSettings.id, updates);
      } else {
        return await api.entities.AdminSettings.create({
          org_id: user.current_org_id,
          ...updates
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success("Settings updated!");
    },
    onError: (error) => { // Added missing onError from original code
      console.error('Admin settings update error:', error);
      toast.error("Failed to update settings");
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleAddCustomControl = () => {
    setFormData(prevData => ({
      ...prevData,
      custom_controls: [...prevData.custom_controls, {
        control_id: `CUSTOM-${Date.now()}`,
        name: '',
        category: 'security',
        description: '',
        test_procedure: '',
        frequency: 'monthly',
        automated: false,
        required: true
      }]
    }));
  };

  const handleRemoveControl = (index) => {
    setFormData(prevData => ({
      ...prevData,
      custom_controls: prevData.custom_controls.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateControl = (index, field, value) => {
    setFormData(prevData => {
      const updated = [...prevData.custom_controls];
      updated[index][field] = value;
      return {
        ...prevData,
        custom_controls: updated
      };
    });
  };

  const handleGenerateAIControls = async () => {
    setLoadingAI(true);
    try {
      await generateAIControlsMutation.mutateAsync();
    } finally {
      setLoadingAI(false);
    }
  };

  const mappedControls = formData.regulatory_requirements.flatMap(fw => 
    COMPLIANCE_FRAMEWORKS[fw]?.controls || []
  );

  const totalControls = mappedControls.length + formData.custom_controls.length;
  const automatedControls = [
    ...mappedControls.filter(c => c.automated),
    ...formData.custom_controls.filter(c => c.automated)
  ].length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            Security <span className="text-amber-400">Profile</span>
          </h1>
          <p className="text-white/70 mt-1">
            Configure tenant-specific security controls and compliance baselines
          </p>
        </div>
        {profile && (
          <Badge className="bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Profile Active
          </Badge>
        )}
      </div>

      {/* Control Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Controls</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">{totalControls}</p>
            <p className="text-white/60 text-xs mt-1">Total controls mapped</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Automated</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">{automatedControls}</p>
            <p className="text-white/60 text-xs mt-1">AI-automated controls</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Frameworks</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">{formData.regulatory_requirements.length}</p>
            <p className="text-white/60 text-xs mt-1">Active frameworks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400">Coverage</Badge>
            </div>
            <p className="text-3xl font-bold text-amber-400">
              {totalControls > 0 ? Math.round((automatedControls / totalControls) * 100) : 0}%
            </p>
            <p className="text-white/60 text-xs mt-1">Automation coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* API Optimization Settings */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            API Usage Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex-1">
              <Label htmlFor="batch-telemetry" className="text-white font-medium">Batch Telemetry Events</Label>
              <p className="text-white/60 text-sm mt-1">
                Reduce API calls by 95% (30-minute batching)
              </p>
            </div>
            <Switch
              id="batch-telemetry"
              checked={currentAdminSettings.api_throttling?.batch_telemetry !== false}
              onCheckedChange={(checked) =>
                updateAdminSettingsMutation.mutate({
                  api_throttling: {
                    ...currentAdminSettings.api_throttling,
                    batch_telemetry: checked
                  }
                })
              }
              disabled={updateAdminSettingsMutation.isPending}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-400 text-xs font-semibold mb-1">Current Usage</p>
              <p className="text-white text-sm">See <Link to={createPageUrl("BillingDashboard")} className="text-cyan-400 underline">Billing Dashboard</Link> for details</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-400 text-xs font-semibold mb-1">Optimization</p>
              <p className="text-white text-sm">~99% API reduction enabled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/5">
            <TabsTrigger value="general" className="text-white data-[state=active]:bg-cyan-500/20">General</TabsTrigger>
            <TabsTrigger value="frameworks" className="text-white data-[state=active]:bg-green-500/20">Frameworks</TabsTrigger>
            <TabsTrigger value="thresholds" className="text-white data-[state=active]:bg-amber-500/20">Risk Thresholds</TabsTrigger>
            <TabsTrigger value="monitoring" className="text-white data-[state=active]:bg-blue-500/20">Monitoring</TabsTrigger>
            <TabsTrigger value="targets" className="text-white data-[state=active]:bg-purple-500/20">Targets</TabsTrigger>
            <TabsTrigger value="automation" className="text-white data-[state=active]:bg-pink-500/20">Auto-Remediation</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Profile Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Profile Name</Label>
                  <Input
                    name="profile_name"
                    value={formData.profile_name}
                    onChange={(e) => setFormData({...formData, profile_name: e.target.value})}
                    placeholder="e.g., Financial Services High Security"
                    className="bg-white/5 border-amber-500/30 text-white"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Industry Vertical</Label>
                    <Select name="industry_vertical" value={formData.industry_vertical} onValueChange={(val) => setFormData({...formData, industry_vertical: val})}>
                      <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial_services">Financial Services</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="professional_services">Professional Services</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Data Sensitivity Level</Label>
                    <Select name="data_sensitivity_level" value={formData.data_sensitivity_level} onValueChange={(val) => setFormData({...formData, data_sensitivity_level: val})}>
                      <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                        <SelectItem value="highly_confidential">Highly Confidential</SelectItem>
                        <SelectItem value="regulated">Regulated (PII/PHI/PCI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Frameworks Tab */}
          <TabsContent value="frameworks" className="space-y-4">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    Compliance Frameworks
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={handleGenerateAIControls}
                    disabled={loadingAI || formData.regulatory_requirements.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-purple-500"
                    size="sm"
                  >
                    {loadingAI ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Gap Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm mb-1 font-semibold">
                    📋 Select Your Compliance Frameworks
                  </p>
                  <p className="text-white/70 text-xs">
                    Choose one or more frameworks. AI will automatically map required controls to your organization.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(COMPLIANCE_FRAMEWORKS).map(([key, framework]) => (
                    <Card
                      key={key}
                      onClick={() => {
                        setFormData(prevData => ({
                          ...prevData,
                          regulatory_requirements: prevData.regulatory_requirements.includes(key) 
                            ? prevData.regulatory_requirements.filter(f => f !== key)
                            : [...prevData.regulatory_requirements, key]
                        }));
                      }}
                      className={`cursor-pointer transition-all ${
                        formData.regulatory_requirements.includes(key)
                          ? 'bg-green-500/20 border-green-500'
                          : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{framework.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold">{framework.name}</h3>
                              {formData.regulatory_requirements.includes(key) && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <p className="text-white/60 text-xs mb-2">{framework.description}</p>
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {framework.controls.length} controls
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Mapped Controls Preview */}
                {mappedControls.length > 0 && (
                  <Card className="bg-white/5 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        Mapped Controls ({mappedControls.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {mappedControls.map((control, idx) => (
                          <div key={idx} className="p-2 bg-white/5 rounded border border-white/10 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                                  {control.id}
                                </Badge>
                                <span className="text-white text-sm font-medium">{control.name}</span>
                              </div>
                              <p className="text-white/50 text-xs mt-1 capitalize">{control.category}</p>
                            </div>
                            {control.automated && (
                              <Badge className="bg-green-500/20 text-green-400">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Custom Controls */}
                <Card className="bg-white/5 border-amber-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 text-amber-400" />
                        Custom Controls ({formData.custom_controls.length})
                      </CardTitle>
                      <Button
                        type="button"
                        onClick={handleAddCustomControl}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {formData.custom_controls.length === 0 ? (
                      <p className="text-white/60 text-center py-4 text-sm">
                        No custom controls yet. Add industry-specific controls for your organization.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {formData.custom_controls.map((control, idx) => (
                          <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <Input
                                placeholder="Control name"
                                value={control.name}
                                onChange={(e) => handleUpdateControl(idx, 'name', e.target.value)}
                                className="bg-white/5 border-white/20 text-white text-sm"
                              />
                              <Button
                                type="button"
                                onClick={() => handleRemoveControl(idx)}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-2 mb-2">
                              <Select
                                value={control.category}
                                onValueChange={(val) => handleUpdateControl(idx, 'category', val)}
                              >
                                <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="security">Security</SelectItem>
                                  <SelectItem value="availability">Availability</SelectItem>
                                  <SelectItem value="confidentiality">Confidentiality</SelectItem>
                                  <SelectItem value="privacy">Privacy</SelectItem>
                                  <SelectItem value="integrity">Processing Integrity</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={control.frequency}
                                onValueChange={(val) => handleUpdateControl(idx, 'frequency', val)}
                              >
                                <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm">
                                  <SelectValue placeholder="Frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                  <SelectItem value="annually">Annually</SelectItem>
                                  <SelectItem value="on_event">On Event</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Textarea
                              placeholder="Test procedure..."
                              value={control.test_procedure}
                              onChange={(e) => handleUpdateControl(idx, 'test_procedure', e.target.value)}
                              className="bg-white/5 border-white/20 text-white text-xs"
                              rows={2}
                            />
                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox
                                checked={control.automated}
                                onCheckedChange={(checked) => handleUpdateControl(idx, 'automated', checked)}
                                id={`custom-automated-${idx}`}
                                className="border-white/30"
                              />
                              <Label htmlFor={`custom-automated-${idx}`} className="text-white text-sm cursor-pointer">
                                Automated
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Suggestions */}
                {aiSuggestions && (
                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiSuggestions.gaps?.length > 0 ? (
                            aiSuggestions.gaps.map((gap, idx) => (
                                <div key={idx} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                                  <p className="text-yellow-400 text-sm font-semibold mb-1">
                                    ⚠️ {gap.area}
                                  </p>
                                  <p className="text-white/70 text-xs">{gap.recommendation}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-white/60 text-sm">No specific gaps identified. Your current profile looks good!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Thresholds Tab */}
          <TabsContent value="thresholds">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-400" />
                  Risk Thresholds & SLAs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">High Finding SLA (hours)</Label>
                    <Input
                      name="high_sla_hours"
                      type="number"
                      value={formData.risk_thresholds.high_finding_sla_hours}
                      onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        risk_thresholds: {...prevData.risk_thresholds, high_finding_sla_hours: parseInt(e.target.value) || 0}
                      }))}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Medium Finding SLA (hours)</Label>
                    <Input
                      name="medium_sla_hours"
                      type="number"
                      value={formData.risk_thresholds.medium_finding_sla_hours}
                      onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        risk_thresholds: {...prevData.risk_thresholds, medium_finding_sla_hours: parseInt(e.target.value) || 0}
                      }))}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Low Finding SLA (hours)</Label>
                    <Input
                      name="low_sla_hours"
                      type="number"
                      value={formData.risk_thresholds.low_finding_sla_hours}
                      onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        risk_thresholds: {...prevData.risk_thresholds, low_finding_sla_hours: parseInt(e.target.value) || 0}
                      }))}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Max Security Alert Risk Score</Label>
                  <Input
                    name="max_risk_score"
                    type="number"
                    value={formData.risk_thresholds.max_security_alert_risk_score}
                    onChange={(e) => setFormData(prevData => ({
                      ...prevData,
                      risk_thresholds: {...prevData.risk_thresholds, max_security_alert_risk_score: parseInt(e.target.value) || 0}
                    }))}
                    min={0}
                    max={100}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                  <p className="text-white/50 text-xs mt-1">
                    Alerts above this score trigger immediate escalation
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="auto_escalate_critical"
                      id="auto_escalate_critical"
                      checked={formData.risk_thresholds.critical_finding_auto_escalate}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        risk_thresholds: {...prevData.risk_thresholds, critical_finding_auto_escalate: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="auto_escalate_critical" className="text-white cursor-pointer">
                      Auto-escalate critical findings to security team
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="auto_remediate_low"
                      id="auto_remediate_low"
                      checked={formData.risk_thresholds.auto_remediate_low}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        risk_thresholds: {...prevData.risk_thresholds, auto_remediate_low: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="auto_remediate_low" className="text-white cursor-pointer">
                      Auto-remediate low severity findings
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="auto_remediate_medium"
                      id="auto_remediate_medium"
                      checked={formData.risk_thresholds.auto_remediate_medium}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        risk_thresholds: {...prevData.risk_thresholds, auto_remediate_medium: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="auto_remediate_medium" className="text-white cursor-pointer">
                      Auto-remediate medium severity findings
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Monitoring & Alerting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="real_time_alerts"
                      id="real_time_alerts"
                      checked={formData.monitoring_preferences.real_time_alerts}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        monitoring_preferences: {...prevData.monitoring_preferences, real_time_alerts: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="real_time_alerts" className="text-white cursor-pointer">
                      Enable real-time security alerts
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="daily_digest"
                      id="daily_digest"
                      checked={formData.monitoring_preferences.daily_digest}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        monitoring_preferences: {...prevData.monitoring_preferences, daily_digest: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="daily_digest" className="text-white cursor-pointer">
                      Daily security digest email
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="weekly_report"
                      id="weekly_report"
                      checked={formData.monitoring_preferences.weekly_report}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        monitoring_preferences: {...prevData.monitoring_preferences, weekly_report: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="weekly_report" className="text-white cursor-pointer">
                      Weekly compliance report
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="evidence_auto_collect"
                      id="evidence_auto_collect"
                      checked={formData.monitoring_preferences.evidence_auto_collect}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        monitoring_preferences: {...prevData.monitoring_preferences, evidence_auto_collect: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="evidence_auto_collect" className="text-white cursor-pointer">
                      Automatically collect remediation evidence
                    </Label>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-3 block">Alert Channels</Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['email', 'slack', 'teams', 'pagerduty', 'webhook'].map(channel => (
                      <div key={channel} className="flex items-center space-x-2">
                        <Checkbox
                          name="alert_channels"
                          value={channel}
                          id={channel}
                          checked={formData.monitoring_preferences.alert_channels?.includes(channel)}
                          onCheckedChange={(checked) => setFormData(prevData => {
                            const currentChannels = prevData.monitoring_preferences.alert_channels || [];
                            return {
                              ...prevData,
                              monitoring_preferences: {
                                ...prevData.monitoring_preferences,
                                alert_channels: checked
                                  ? [...currentChannels, channel]
                                  : currentChannels.filter(c => c !== channel)
                              }
                            };
                          })}
                          className="border-white/30"
                        />
                        <Label htmlFor={channel} className="text-white text-sm capitalize cursor-pointer">
                          {channel}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white">Alert Contact Emails (comma-separated)</Label>
                  <Input
                    name="alert_contacts"
                    value={formData.monitoring_preferences.alert_contacts?.join(', ')}
                    onChange={(e) => setFormData(prevData => ({
                      ...prevData,
                      monitoring_preferences: {...prevData.monitoring_preferences, alert_contacts: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}
                    }))}
                    placeholder="security@company.com, admin@company.com"
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Targets Tab */}
          <TabsContent value="targets">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Compliance Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Target Overall Score</Label>
                    <Input
                      name="target_score"
                      type="number"
                      value={formData.compliance_targets.target_overall_score}
                      onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        compliance_targets: {...prevData.compliance_targets, target_overall_score: parseInt(e.target.value) || 0}
                      }))}
                      min={0}
                      max={100}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Min Control Coverage %</Label>
                    <Input
                      name="min_coverage"
                      type="number"
                      value={formData.compliance_targets.min_control_coverage_pct}
                      onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        compliance_targets: {...prevData.compliance_targets, min_control_coverage_pct: parseInt(e.target.value) || 0}
                      }))}
                      min={0}
                      max={100}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Max Open Critical Findings</Label>
                    <Input
                      name="max_critical"
                      type="number"
                      value={formData.compliance_targets.max_open_critical_findings}
                      onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        compliance_targets: {...prevData.compliance_targets, max_open_critical_findings: parseInt(e.target.value) || 0}
                      }))}
                      min={0}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Max Open High Findings</Label>
                    <Input
                      name="max_high"
                      type="number"
                      value={formData.compliance_targets.max_open_high_findings}
                      onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        compliance_targets: {...prevData.compliance_targets, max_open_high_findings: parseInt(e.target.value) || 0}
                      }))}
                      min={0}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Evidence Approval Rate Target %</Label>
                    <Input
                      name="evidence_target"
                      type="number"
                      value={formData.compliance_targets.evidence_approval_rate_target}
                      onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        compliance_targets: {...prevData.compliance_targets, evidence_approval_rate_target: parseInt(e.target.value) || 0}
                      }))}
                      min={0}
                      max={100}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto-Remediation Tab */}
          <TabsContent value="automation">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  AI Auto-Remediation Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-400 text-sm mb-2 font-semibold">
                    🤖 AI-Powered Automatic Remediation
                  </p>
                  <p className="text-white/70 text-sm">
                    When enabled, low-risk security findings are automatically remediated by the SOC Security Team AI 
                    and Sentinel SRE agents. Evidence is collected and controls are updated without manual intervention.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    name="auto_remediation_enabled"
                    id="auto_remediation_enabled"
                    checked={formData.auto_remediation_config.enabled}
                    onCheckedChange={(checked) => setFormData(prevData => ({
                      ...prevData,
                      auto_remediation_config: {...prevData.auto_remediation_config, enabled: checked}
                    }))}
                    className="border-white/30"
                  />
                  <Label htmlFor="auto_remediation_enabled" className="text-white cursor-pointer font-semibold">
                    Enable AI Auto-Remediation
                  </Label>
                </div>

                <div>
                  <Label className="text-white mb-3 block">Auto-Remediate Severities</Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        name="auto_remediate_severities"
                        value="low"
                        id="severity_low"
                        checked={formData.auto_remediation_config.allowed_severities?.includes('low')}
                        onCheckedChange={(checked) => setFormData(prevData => {
                          const currentSeverities = prevData.auto_remediation_config.allowed_severities || [];
                          return {
                            ...prevData,
                            auto_remediation_config: {
                              ...prevData.auto_remediation_config,
                              allowed_severities: checked
                                ? [...currentSeverities, 'low']
                                : currentSeverities.filter(s => s !== 'low')
                            }
                          };
                        })}
                        className="border-white/30"
                      />
                      <Label htmlFor="severity_low" className="text-white cursor-pointer">
                        Low Severity (Recommended)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        name="auto_remediate_severities"
                        value="medium"
                        id="severity_medium"
                        checked={formData.auto_remediation_config.allowed_severities?.includes('medium')}
                        onCheckedChange={(checked) => setFormData(prevData => {
                          const currentSeverities = prevData.auto_remediation_config.allowed_severities || [];
                          return {
                            ...prevData,
                            auto_remediation_config: {
                              ...prevData.auto_remediation_config,
                              allowed_severities: checked
                                ? [...currentSeverities, 'medium']
                                : currentSeverities.filter(s => s !== 'medium')
                            }
                          };
                        })}
                        className="border-white/30"
                      />
                      <Label htmlFor="severity_medium" className="text-white cursor-pointer">
                        Medium Severity (With Approval)
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Max Auto-Remediations Per Day</Label>
                    <Input
                      name="max_per_day"
                      type="number"
                      value={formData.auto_remediation_config.max_auto_remediation_per_day}
                      onChange={(e) => setFormData(prevData => ({
                        ...prevData,
                        auto_remediation_config: {...prevData.auto_remediation_config, max_auto_remediation_per_day: parseInt(e.target.value) || 0}
                      }))}
                      min={1}
                      max={50}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="sentinel_integration"
                      id="sentinel_integration"
                      checked={formData.auto_remediation_config.sentinel_integration}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        auto_remediation_config: {...prevData.auto_remediation_config, sentinel_integration: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="sentinel_integration" className="text-white cursor-pointer">
                      Allow Sentinel SRE to auto-remediate infrastructure issues
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="approval_for_medium"
                      id="approval_for_medium"
                      checked={formData.auto_remediation_config.approval_required_for_medium}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        auto_remediation_config: {...prevData.auto_remediation_config, approval_required_for_medium: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="approval_for_medium" className="text-white cursor-pointer">
                      Require approval for medium severity auto-remediation
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="rollback_on_failure"
                      id="rollback_on_failure"
                      checked={formData.auto_remediation_config.rollback_on_failure}
                      onCheckedChange={(checked) => setFormData(prevData => ({
                        ...prevData,
                        auto_remediation_config: {...prevData.auto_remediation_config, rollback_on_failure: checked}
                      }))}
                      className="border-white/30"
                    />
                    <Label htmlFor="rollback_on_failure" className="text-white cursor-pointer">
                      Automatically rollback failed remediations
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button" // Change to button to prevent default form submission if any
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-green-600 to-green-500"
            size="lg"
          >
            {saveMutation.isPending ? (
              <>
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Security Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
