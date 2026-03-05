import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  Lock,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const INDUSTRY_CONFIGS = {
  financial_services: {
    icon: '🏦',
    recommended_frameworks: ['soc2', 'pci_dss', 'sox'],
    data_sensitivity: 'regulated',
    priority_controls: ['encryption', 'access_control', 'audit_logging'],
    guidance: 'Financial services require strict compliance with SOC2, PCI DSS for payment data, and SOX for public companies.'
  },
  healthcare: {
    icon: '🏥',
    recommended_frameworks: ['hipaa', 'soc2'],
    data_sensitivity: 'regulated',
    priority_controls: ['phi_protection', 'encryption', 'breach_notification'],
    guidance: 'Healthcare organizations must comply with HIPAA for patient data protection and privacy.'
  },
  technology: {
    icon: '💻',
    recommended_frameworks: ['soc2', 'iso27001'],
    data_sensitivity: 'confidential',
    priority_controls: ['access_control', 'encryption', 'incident_response'],
    guidance: 'Tech companies benefit from SOC2 Type II certification for customer trust and security.'
  },
  retail: {
    icon: '🛒',
    recommended_frameworks: ['pci_dss', 'soc2'],
    data_sensitivity: 'confidential',
    priority_controls: ['payment_security', 'data_encryption', 'access_control'],
    guidance: 'Retail businesses handling payments must comply with PCI DSS for card data security.'
  }
};

export default function PersonalizedSetupWizard({ open, onComplete, organization }) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    industry: organization?.industry || 'other',
    frameworks: [],
    data_sensitivity: 'internal',
    profile_name: '',
    enable_automation: true
  });
  const [aiRecommendations, setAiRecommendations] = useState(null);

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const industryConfig = INDUSTRY_CONFIGS[config.industry];
      
      const { data } = await api.functions.invoke('aiComplianceAuditor', {
        action: 'personalized_onboarding',
        org_id: organization?.id,
        industry: config.industry,
        data_sensitivity: config.data_sensitivity,
        frameworks: config.frameworks
      });
      
      return data;
    },
    onSuccess: (data) => {
      setAiRecommendations(data);
      setStep(3);
    },
    onError: (error) => {
      console.error('AI recommendation error:', error);
      setStep(3);
    }
  });

  const applyConfigMutation = useMutation({
    mutationFn: async () => {
      const industryConfig = INDUSTRY_CONFIGS[config.industry] || {};
      
      // Create security profile
      await api.entities.TenantSecurityProfile.create({
        org_id: organization.id,
        profile_name: config.profile_name || `${config.industry} Security Profile`,
        industry_vertical: config.industry,
        data_sensitivity_level: config.data_sensitivity,
        regulatory_requirements: config.frameworks.length > 0 
          ? config.frameworks 
          : industryConfig.recommended_frameworks || ['soc2'],
        risk_thresholds: {
          critical_finding_auto_escalate: true,
          high_finding_sla_hours: 24,
          medium_finding_sla_hours: 72,
          low_finding_sla_hours: 168,
          auto_remediate_low: config.enable_automation,
          auto_remediate_medium: false,
          max_security_alert_risk_score: 70
        },
        monitoring_preferences: {
          real_time_alerts: true,
          alert_channels: ['email'],
          alert_contacts: [organization.owner_email || ''],
          daily_digest: true,
          weekly_report: true,
          evidence_auto_collect: config.enable_automation
        },
        compliance_targets: {
          target_overall_score: 85,
          min_control_coverage_pct: 95,
          max_open_critical_findings: 0,
          max_open_high_findings: 3,
          evidence_approval_rate_target: 90
        },
        auto_remediation_config: {
          enabled: config.enable_automation,
          allowed_severities: ['low'],
          sentinel_integration: true,
          approval_required_for_medium: true,
          max_auto_remediation_per_day: 10,
          rollback_on_failure: true
        },
        is_active: true,
        created_by: organization.owner_id
      });

      return true;
    },
    onSuccess: () => {
      toast.success('Security profile configured!');
      onComplete();
    },
    onError: (error) => {
      console.error('Apply config error:', error);
      toast.error('Failed to apply configuration');
    }
  });

  const handleNext = () => {
    if (step === 1) {
      const industryConfig = INDUSTRY_CONFIGS[config.industry];
      if (industryConfig) {
        setConfig({
          ...config,
          frameworks: industryConfig.recommended_frameworks,
          data_sensitivity: industryConfig.data_sensitivity
        });
      }
      setStep(2);
    } else if (step === 2) {
      generateRecommendationsMutation.mutate();
    } else if (step === 3) {
      applyConfigMutation.mutate();
    }
  };

  const industryConfig = INDUSTRY_CONFIGS[config.industry];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Security Profile Setup - Step {step} of 3
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {step === 1 && 'Confirm your industry and compliance needs'}
            {step === 2 && 'Customize your security configuration'}
            {step === 3 && 'Review AI recommendations'}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <p className="text-blue-400 text-sm">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Based on your industry, we'll recommend the best compliance frameworks and controls.
                  </p>
                </CardContent>
              </Card>

              {industryConfig && (
                <Card className="bg-white/5 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-4xl">{industryConfig.icon}</span>
                      <div>
                        <h3 className="text-white font-bold capitalize mb-1">
                          {config.industry.replace('_', ' ')}
                        </h3>
                        <p className="text-white/70 text-sm">{industryConfig.guidance}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-500/20 text-green-400">
                        {industryConfig.recommended_frameworks.length} frameworks recommended
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {industryConfig.data_sensitivity} data
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <Label className="text-white mb-2 block">Profile Name</Label>
                <Input
                  value={config.profile_name}
                  onChange={(e) => setConfig({...config, profile_name: e.target.value})}
                  placeholder={`${config.industry} Security Profile`}
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-3 block">Recommended Frameworks</Label>
                <div className="space-y-2">
                  {(industryConfig?.recommended_frameworks || ['soc2']).map(fw => (
                    <Card key={fw} className="bg-green-500/10 border-green-500/30">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white uppercase text-sm font-medium">{fw.replace('_', ' ')}</span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">Recommended</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-semibold text-sm">AI Automation</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enable_automation}
                      onChange={(e) => setConfig({...config, enable_automation: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-white text-sm">
                      Enable AI auto-remediation for low-risk findings
                    </span>
                  </label>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card className="bg-cyan-500/10 border-cyan-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 font-bold">AI Configuration Summary</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Industry:</span>
                      <span className="text-white font-medium capitalize">{config.industry.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Frameworks:</span>
                      <span className="text-white font-medium">{config.frameworks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Data Sensitivity:</span>
                      <span className="text-white font-medium capitalize">{config.data_sensitivity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">AI Automation:</span>
                      <Badge className={config.enable_automation ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {config.enable_automation ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {aiRecommendations?.quick_wins && (
                <Card className="bg-purple-500/10 border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 font-bold text-sm">Quick Wins</span>
                    </div>
                    <ul className="space-y-2">
                      {aiRecommendations.quick_wins.map((win, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80">{win}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <p className="text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Your security profile is ready to deploy with AI-recommended settings!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              className="border-amber-500/30 text-white hover:bg-amber-500/10"
              disabled={generateRecommendationsMutation.isPending || applyConfigMutation.isPending}
            >
              Back
            </Button>
          )}
          <div className="flex-1" />
          <Button
            onClick={handleNext}
            disabled={generateRecommendationsMutation.isPending || applyConfigMutation.isPending}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
          >
            {applyConfigMutation.isPending ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : generateRecommendationsMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : step === 3 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}