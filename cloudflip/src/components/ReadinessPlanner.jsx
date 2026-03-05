
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Server,
  Shield,
  Target,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  Loader2,
  Crown,
  Zap,
  AlertCircle,
  BarChart,
  Sparkles,
  Info,
  X,
  Users // Added Users icon
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ReadinessPlanner({ open, onComplete, canSkip = false }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [showDiscountOffer, setShowDiscountOffer] = useState(false);

  // Form data
  const [infraBaseline, setInfraBaseline] = useState({
    environment_type: 'cloud_native',
    server_count: 0,
    storage_type: [],
    backup_methods: [],
    networking_setup: {
      vpn_enabled: false,
      vlan_configured: false,
      static_ips: false,
      load_balancing: false
    },
    security_stack: [],
    automation_level: 'manual',
    current_challenges: []
  });

  const [businessGoals, setBusinessGoals] = useState({
    top_priorities: [],
    compliance_requirements: [],
    budget_range: '1k_5k',
    pain_points: '',
    timeline: '1_3_months',
    team_size: 1,
    technical_expertise: 'intermediate'
  });

  const [readinessScore, setReadinessScore] = useState(null);
  const [planRecommendation, setPlanRecommendation] = useState(null);
  const [migrationPath, setMigrationPath] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);

        if (currentUser.current_org_id) {
          const orgs = await api.entities.Organization.filter({ id: currentUser.current_org_id });
          if (orgs.length > 0) {
            setOrganization(orgs[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    if (open) {
      loadUser();
    }
  }, [open]);

  const trackStep = async (stepNumber, action) => {
    if (!user?.current_org_id) return;

    try {
      await api.entities.UsageEvent.create({
        org_id: user.current_org_org_id,
        event: 'readiness_planner.step',
        actor_id: user.id,
        metadata: {
          step: stepNumber,
          action,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track step:', error);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!infraBaseline.environment_type) {
        toast.error('Please select your infrastructure type');
        return;
      }
      await trackStep(1, 'completed');
      setStep(2);
    } else if (step === 2) {
      if (businessGoals.top_priorities.length === 0) {
        toast.error('Please select at least one priority');
        return;
      }
      await trackStep(2, 'completed');

      if (!user?.current_org_id) {
        toast.error('Organization not found');
        return;
      }

      setLoading(true);
      try {
        const infraRecord = await api.entities.InfraBaseline.create({
          org_id: user.current_org_id,
          ...infraBaseline
        });

        const goalsRecord = await api.entities.BusinessGoals.create({
          org_id: user.current_org_id,
          ...businessGoals
        });

        const { data: readinessData } = await api.functions.invoke('calculateReadinessScore', {
          infraBaselineId: infraRecord.id,
          businessGoalsId: goalsRecord.id
        });

        if (readinessData && readinessData.readinessScore) {
          setReadinessScore(readinessData.readinessScore);
          setStep(3);
        } else {
          throw new Error('Invalid readiness data returned');
        }
      } catch (error) {
        console.error('Failed to calculate readiness:', error);
        toast.error('Failed to calculate readiness score. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      await trackStep(3, 'completed');

      if (!readinessScore) {
        toast.error('Readiness score not found');
        return;
      }

      setLoading(true);
      try {
        const goalsRecords = await api.entities.BusinessGoals.filter({ org_id: user.current_org_id });
        if (goalsRecords.length === 0) {
          throw new Error('Business goals not found');
        }

        const { data: recData } = await api.functions.invoke('recommendCloudFlipTier', {
          readinessScoreId: readinessScore.id,
          businessGoalsId: goalsRecords[0].id
        });

        if (recData && recData.recommendation) {
          setPlanRecommendation(recData.recommendation);
          setStep(4);
          // Show discount offer after a short delay
          setTimeout(() => setShowDiscountOffer(true), 1500);
        } else {
          throw new Error('Invalid recommendation data returned');
        }
      } catch (error) {
        console.error('Failed to generate recommendation:', error);
        toast.error('Failed to generate plan recommendation. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (step === 4) {
      await trackStep(4, 'completed');

      if (!readinessScore || !planRecommendation) {
        toast.error('Assessment data not found');
        return;
      }

      setLoading(true);
      try {
        const { data: pathData } = await api.functions.invoke('generateMigrationPlan', {
          readinessScoreId: readinessScore.id,
          recommendedTier: planRecommendation.recommended_tier
        });

        if (pathData && pathData.migrationPath) {
          setMigrationPath(pathData.migrationPath);
          setStep(5);
        } else {
          throw new Error('Invalid migration path data returned');
        }
      } catch (error) {
        console.error('Failed to generate migration path:', error);
        toast.error('Failed to generate migration plan. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
    trackStep(step, 'back');
  };

  const handleSkip = async () => {
    await trackStep(step, 'skipped');
    onComplete();
  };

  const handleComplete = async () => {
    await trackStep(5, 'completed');
    toast.success('Readiness assessment complete!');
    onComplete();
  };

  const togglePriority = (priority) => {
    const current = businessGoals.top_priorities;
    if (current.includes(priority)) {
      setBusinessGoals({
        ...businessGoals,
        top_priorities: current.filter(p => p !== priority)
      });
    } else {
      setBusinessGoals({
        ...businessGoals,
        top_priorities: [...current, priority]
      });
    }
  };

  const toggleCompliance = (req) => {
    const current = businessGoals.compliance_requirements;
    if (current.includes(req)) {
      setBusinessGoals({
        ...businessGoals,
        compliance_requirements: current.filter(r => r !== req)
      });
    } else {
      setBusinessGoals({
        ...businessGoals,
        compliance_requirements: [...current, req]
      });
    }
  };

  const toggleSecurity = (tool) => {
    const current = infraBaseline.security_stack;
    if (current.includes(tool)) {
      setInfraBaseline({
        ...infraBaseline,
        security_stack: current.filter(t => t !== tool)
      });
    } else {
      setInfraBaseline({
        ...infraBaseline,
        security_stack: [...current, tool]
      });
    }
  };

  const getMaturityDescription = (level) => {
    const descriptions = {
      initial: 'Your organization is at the beginning of its cloud journey. Basic processes are in place, but there\'s significant room for automation and optimization.',
      developing: 'You\'re making progress! Some processes are standardized, but manual intervention is still common. Focus on building consistency.',
      defined: 'Solid foundation! Processes are well-documented and repeatable. Ready to leverage advanced automation and AI capabilities.',
      managed: 'Excellent maturity! You have measurable metrics and optimize based on data. You\'re positioned to maximize CloudFlip\'s advanced features.',
      optimized: 'World-class! Continuous improvement is embedded in your culture. You\'re ready for full digital transformation and innovation.'
    };
    return descriptions[level] || '';
  };

  const allTierFeatures = {
    demo: [
      'Interactive demo mode with sample data',
      'Full platform preview (read-only)',
      'Explore all features risk-free',
      '7-day trial period',
      'Upgrade anytime'
    ],
    starter: [
      'Manual lead entry & CSV import',
      'Up to 100 leads/month',
      'Basic quote generator',
      'Invoice creation & tracking',
      'Email notifications',
      'Basic reporting',
      '14-day trial'
    ],
    pro: [
      'Everything in Starter, plus:',
      'Visual CRM pipeline',
      'Stripe payment processing',
      'Branded landing pages',
      'Advanced job scheduling',
      'Recurring jobs & templates',
      'Team assignments (up to 10 users)',
      'Calendar integrations',
      'Up to 500 leads/month',
      'Priority support',
      '30-day trial'
    ],
    partner: [
      'Everything in Pro, plus:',
      'Social media lead sync (Facebook, Instagram, Nextdoor, TikTok)',
      'AI quote generation',
      'AI Agent Inbox (24/7 automated responses)',
      'WhatsApp integration',
      'Smart reminders & follow-ups',
      'Sentiment analysis',
      'Privacy & consent management',
      'GDPR compliance tools',
      'Unlimited leads',
      'Up to 25 users',
      'Phone & email support',
      '30-day trial'
    ],
    elite: [
      'Everything in Partner, plus:',
      'White label branding (remove CloudFlip)',
      'Custom domain support',
      'Multi-agent routing & orchestration',
      'Full REST API access',
      'Advanced analytics & forecasting',
      'Contract & template builder',
      'Digital signatures',
      'Client approval portal',
      'Automated workflows',
      'Plugin Hub access',
      'Unlimited users',
      'Unlimited storage',
      'Dedicated account manager',
      '30-day trial'
    ]
  };

  if (open && (!user || !user.current_org_id)) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
            <p className="text-white">Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] p-0 bg-gradient-to-br from-[#06162a] via-[#0b213d] to-[#06162a] border-2 border-[#f4d35e]/30"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Close Button with Better Visibility */}
          <button
            onClick={() => canSkip && onComplete()}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
            disabled={!canSkip}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative w-full h-full flex flex-col max-h-[90vh]">
            {/* Header - Consistent padding */}
            <div className="p-6 border-b border-amber-500/20 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">CloudFlip Readiness Assessment</h2>
                  <p className="text-white/60 text-sm mt-1">Let's design your digital transformation roadmap</p>
                </div>
                {canSkip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSkip}
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Complete this later from your dashboard</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Step {step} of 5</span>
                  <span>{Math.round((step / 5) * 100)}% Complete</span>
                </div>
                <Progress value={(step / 5) * 100} className="h-2 bg-white/10" />
              </div>
            </div>

            {/* Content Area - Scrollable with proper constraints */}
            <div
              className="flex-1 overflow-y-auto p-6"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y'
              }}
            >
              <AnimatePresence mode="wait">
                {/* Step 1: Infrastructure Baseline */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Server className="w-8 h-8 text-amber-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Infrastructure Baseline</h3>
                        <p className="text-white/60 text-sm">Tell us about your current setup</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-white mb-3 block">Current Environment Type</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'on_prem', label: 'On-Premises', icon: Server, tooltip: 'Physical servers in your own data center' },
                            { value: 'hybrid', label: 'Hybrid Cloud', icon: Database, tooltip: 'Mix of on-premises and cloud services' },
                            { value: 'cloud_native', label: 'Cloud Native', icon: Zap, tooltip: 'Fully cloud-based infrastructure' },
                            { value: 'saas_mix', label: 'SaaS Mix', icon: TrendingUp, tooltip: 'Multiple software-as-a-service platforms' }
                          ].map((option) => {
                            const Icon = option.icon;
                            return (
                              <Tooltip key={option.value}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => setInfraBaseline({ ...infraBaseline, environment_type: option.value })}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                      infraBaseline.environment_type === option.value
                                        ? 'border-amber-500 bg-amber-500/10'
                                        : 'border-white/10 bg-white/5 hover:border-amber-500/50'
                                    }`}
                                  >
                                    <Icon className="w-6 h-6 text-amber-400 mb-2" />
                                    <p className="font-medium text-white text-sm">{option.label}</p>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{option.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="server_count" className="text-white">Approximate Server Count</Label>
                        <Input
                          id="server_count"
                          type="number"
                          value={infraBaseline.server_count}
                          onChange={(e) => setInfraBaseline({ ...infraBaseline, server_count: parseInt(e.target.value) || 0 })}
                          className="bg-white/5 border-amber-500/30 text-white mt-2"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label className="text-white mb-3 block">Security Stack (Select all that apply)</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'firewall', label: 'Firewall', tooltip: 'Network security barrier' },
                            { value: 'mfa', label: 'MFA', tooltip: 'Multi-factor authentication' },
                            { value: 'soc_tools', label: 'SOC Tools', tooltip: 'Security operations center tools' },
                            { value: 'encryption', label: 'Encryption', tooltip: 'Data encryption at rest/transit' },
                            { value: 'idp', label: 'IDP', tooltip: 'Identity provider (SSO)' },
                            { value: 'siem', label: 'SIEM', tooltip: 'Security information & event management' }
                          ].map((tool) => (
                            <Tooltip key={tool.value}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => toggleSecurity(tool.value)}
                                  className={`p-2 rounded-lg border transition-all text-sm ${
                                    infraBaseline.security_stack.includes(tool.value)
                                      ? 'border-green-500 bg-green-500/10 text-green-400'
                                      : 'border-white/10 bg-white/5 text-white/70 hover:border-amber-500/50'
                                  }`}
                                >
                                  {tool.label}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{tool.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-white mb-3 block">Automation Level</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { value: 'manual', label: 'Manual', tooltip: 'Most tasks done manually' },
                            { value: 'partially_automated', label: 'Partial', tooltip: 'Some automation in place' },
                            { value: 'mostly_automated', label: 'Mostly', tooltip: 'Most processes automated' },
                            { value: 'fully_automated', label: 'Full', tooltip: 'Comprehensive automation' }
                          ].map((level) => (
                            <Tooltip key={level.value}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setInfraBaseline({ ...infraBaseline, automation_level: level.value })}
                                  className={`p-3 rounded-lg border transition-all ${
                                    infraBaseline.automation_level === level.value
                                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                      : 'border-white/10 bg-white/5 text-white/70 hover:border-amber-500/50'
                                  }`}
                                >
                                  {level.label}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{level.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Business Goals */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Target className="w-8 h-8 text-amber-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Business Goals & Priorities</h3>
                        <p className="text-white/60 text-sm">Select all that apply (Top 3 recommended)</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-white">Your Priorities ({businessGoals.top_priorities.length} selected)</Label>
                          {businessGoals.top_priorities.length > 3 && (
                            <Badge className="bg-amber-500/20 text-amber-400">
                              <Info className="w-3 h-3 mr-1" />
                              Top 3 recommended
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'scale', label: 'Scale Operations', icon: TrendingUp, tooltip: 'Grow your business efficiently' },
                            { value: 'security', label: 'Security', icon: Shield, tooltip: 'Enhance data protection' },
                            { value: 'automation', label: 'Automation', icon: Zap, tooltip: 'Reduce manual work' },
                            { value: 'ai_integration', label: 'AI Integration', icon: Sparkles, tooltip: 'Leverage AI capabilities' },
                            { value: 'cost_optimization', label: 'Cost Optimization', icon: TrendingUp, tooltip: 'Reduce operational costs' },
                            { value: 'compliance', label: 'Compliance', icon: CheckCircle, tooltip: 'Meet regulatory requirements' },
                            { value: 'modernization', label: 'Modernization', icon: Database, tooltip: 'Update legacy systems' },
                            { value: 'disaster_recovery', label: 'Disaster Recovery', icon: Shield, tooltip: 'Business continuity planning' }
                          ].map((priority) => {
                            const Icon = priority.icon;
                            const isSelected = businessGoals.top_priorities.includes(priority.value);
                            return (
                              <Tooltip key={priority.value}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => togglePriority(priority.value)}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                      isSelected
                                        ? 'border-amber-500 bg-amber-500/10'
                                        : 'border-white/10 bg-white/5 hover:border-amber-500/50'
                                    }`}
                                  >
                                    <Icon className="w-5 h-5 text-amber-400 mb-2" />
                                    <p className="font-medium text-white text-sm">{priority.label}</p>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{priority.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Label className="text-white mb-3 block">Compliance Requirements</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'gdpr', label: 'GDPR', tooltip: 'EU data protection' },
                            { value: 'soc2', label: 'SOC2', tooltip: 'Security & availability' },
                            { value: 'hipaa', label: 'HIPAA', tooltip: 'Healthcare data privacy' },
                            { value: 'pci_dss', label: 'PCI DSS', tooltip: 'Payment card security' },
                            { value: 'iso27001', label: 'ISO27001', tooltip: 'Information security standard' },
                            { value: 'none', label: 'None', tooltip: 'No specific requirements' }
                          ].map((req) => (
                            <Tooltip key={req.value}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => toggleCompliance(req.value)}
                                  className={`p-2 rounded-lg border transition-all text-sm ${
                                    businessGoals.compliance_requirements.includes(req.value)
                                      ? 'border-green-500 bg-green-500/10 text-green-400'
                                      : 'border-white/10 bg-white/5 text-white/70 hover:border-amber-500/50'
                                  }`}
                                >
                                  {req.label}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{req.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white mb-2 block">Monthly Budget Range</Label>
                          <select
                            value={businessGoals.budget_range}
                            onChange={(e) => setBusinessGoals({ ...businessGoals, budget_range: e.target.value })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-amber-500/30 text-white"
                          >
                            <option value="under_500">Under $500</option>
                            <option value="500_1k">$500 - $1k</option>
                            <option value="1k_2.5k">$1k - $2.5k</option>
                            <option value="2.5k_5k">$2.5k - $5k</option>
                            <option value="5k_10k">$5k - $10k</option>
                            <option value="10k_25k">$10k - $25k</option>
                            <option value="25k_50k">$25k - $50k</option>
                            <option value="50k_100k">$50k - $100k</option>
                            <option value="100k_plus">$100k+</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-white mb-2 block">Migration Timeline</Label>
                          <select
                            value={businessGoals.timeline}
                            onChange={(e) => setBusinessGoals({ ...businessGoals, timeline: e.target.value })}
                            className="w-full p-3 rounded-lg bg-white/5 border border-amber-500/30 text-white"
                          >
                            <option value="immediate">Immediate (ASAP)</option>
                            <option value="1_2_weeks">1-2 Weeks</option>
                            <option value="2_4_weeks">2-4 Weeks</option>
                            <option value="1_3_months">1-3 Months</option>
                            <option value="3_6_months">3-6 Months</option>
                            <option value="6_9_months">6-9 Months</option>
                            <option value="9_12_months">9-12 Months</option>
                            <option value="12_plus_months">12+ Months</option>
                            <option value="flexible">Flexible</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="pain_points" className="text-white">Current Pain Points (Optional)</Label>
                        <Textarea
                          id="pain_points"
                          value={businessGoals.pain_points}
                          onChange={(e) => setBusinessGoals({ ...businessGoals, pain_points: e.target.value })}
                          className="bg-white/5 border-amber-500/30 text-white mt-2"
                          placeholder="Describe your biggest challenges..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Readiness Score & Benchmark */}
                {step === 3 && readinessScore && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <BarChart className="w-8 h-8 text-amber-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Cloud Maturity Assessment</h3>
                        <p className="text-white/60 text-sm">Your readiness score and benchmarks</p>
                      </div>
                    </div>

                    {/* Overall Score */}
                    <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50">
                      <CardContent className="p-6 text-center">
                        <div className="text-6xl font-bold text-amber-400 mb-2">
                          {readinessScore.overall_score}
                        </div>
                        <p className="text-white text-lg mb-2">Cloud Maturity Index</p>
                        <Badge className="bg-amber-500 text-[#0a1929] font-bold mb-4">
                          {readinessScore.maturity_level.toUpperCase()}
                        </Badge>

                        {/* Explanation */}
                        <div className="mt-4 p-4 bg-white/10 rounded-lg text-left">
                          <div className="flex items-start gap-2">
                            <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-white mb-2">What This Means:</p>
                              <p className="text-sm text-white/80 leading-relaxed">
                                {getMaturityDescription(readinessScore.maturity_level)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tier Progression Ring */}
                    <Card className="bg-white/5 border-[#f4d35e]/20">
                      <CardContent className="p-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#3cf7d4]" />
                          Your Tier Progression Path
                        </h4>
                        <div className="flex items-center justify-between gap-2">
                          {['Demo', 'Starter', 'Pro', 'Partner', 'Elite'].map((tier, idx) => {
                            const isCurrentScore =
                              (idx === 0 && readinessScore.overall_score < 30) ||
                              (idx === 1 && readinessScore.overall_score >= 30 && readinessScore.overall_score < 50) ||
                              (idx === 2 && readinessScore.overall_score >= 50 && readinessScore.overall_score < 75) ||
                              (idx === 3 && readinessScore.overall_score >= 75 && readinessScore.overall_score < 90) ||
                              (idx === 4 && readinessScore.overall_score >= 90);

                            return (
                              <React.Fragment key={tier}>
                                <div className={`flex flex-col items-center ${isCurrentScore ? 'scale-110' : ''}`}>
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                    isCurrentScore
                                      ? 'border-[#f4d35e] bg-[#f4d35e]/20 shadow-lg shadow-[#f4d35e]/50'
                                      : 'border-white/20 bg-white/5'
                                  }`}>
                                    {isCurrentScore ? (
                                      <CheckCircle className="w-6 h-6 text-[#f4d35e]" />
                                    ) : (
                                      <span className="text-white/60 text-xs">{idx + 1}</span>
                                    )}
                                  </div>
                                  <span className={`text-xs mt-2 ${isCurrentScore ? 'text-[#f4d35e] font-bold' : 'text-white/60'}`}>
                                    {tier}
                                  </span>
                                </div>
                                {idx < 4 && (
                                  <ChevronRight className="w-4 h-4 text-white/30" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dimension Scores */}
                    <div className="grid grid-cols-5 gap-3">
                      {Object.entries(readinessScore.dimension_scores).map(([key, value]) => (
                        <Card key={key} className="bg-white/5 border-amber-500/20">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-amber-400 mb-1">{value}</div>
                            <p className="text-xs text-white/70 capitalize">{key}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Industry Benchmark */}
                    <Card className="bg-white/5 border-amber-500/20">
                      <CardContent className="p-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-amber-400" />
                          Industry Benchmark
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-white/60 text-sm">Industry Average</p>
                            <p className="text-2xl font-bold text-white">{readinessScore.industry_benchmark.industry_average}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Your Percentile</p>
                            <p className="text-2xl font-bold text-green-400">{readinessScore.industry_benchmark.percentile}th</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Top Performers</p>
                            <p className="text-2xl font-bold text-white">{readinessScore.industry_benchmark.top_performers}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Readiness Gaps */}
                    {readinessScore.readiness_gaps.length > 0 && (
                      <Card className="bg-white/5 border-amber-500/20">
                        <CardContent className="p-6">
                          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            Areas for Improvement
                          </h4>
                          <div className="space-y-3">
                            {readinessScore.readiness_gaps.map((gap, idx) => (
                              <div key={idx} className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-white">{gap.category}</span>
                                  <Badge className={
                                    gap.severity === 'critical' ? 'bg-red-500' :
                                    gap.severity === 'high' ? 'bg-orange-500' :
                                    gap.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                  }>
                                    {gap.severity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-white/70 mb-2">{gap.description}</p>
                                <p className="text-xs text-amber-400">💡 {gap.recommendation}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Plan Recommendation */}
                {step === 4 && planRecommendation && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Crown className="w-8 h-8 text-amber-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Recommended Plan</h3>
                        <p className="text-white/60 text-sm">AI-powered tier recommendation</p>
                      </div>
                    </div>

                    {/* Recommended Tier - Enhanced with Features */}
                    <Card className="bg-gradient-to-br from-[#f4d35e]/20 to-[#f4d35e]/10 border-2 border-[#f4d35e]/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="w-6 h-6 text-[#f4d35e]" />
                              <h3 className="text-3xl font-bold text-[#f4d35e] capitalize">
                                {planRecommendation.recommended_tier} Plan
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm">AI Confidence:</span>
                              <Badge className="bg-green-500 text-white">
                                {Math.round(planRecommendation.confidence_score * 100)}%
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white/60 text-sm">Estimated Monthly</p>
                            <p className="text-4xl font-bold text-[#f4d35e]">
                              ${planRecommendation.estimated_monthly_cost}
                            </p>
                            {planRecommendation.plan_features?.trial_days && (
                              <Badge className="mt-2 bg-[#3cf7d4]/20 text-[#3cf7d4] border-[#3cf7d4]/30">
                                {planRecommendation.plan_features.trial_days}-day trial
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-white/80 leading-relaxed mb-4">{planRecommendation.reasoning}</p>

                        {/* Module Highlights */}
                        {planRecommendation.plan_features && (
                          <div className="grid grid-cols-2 gap-3 mt-4 p-4 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-[#3cf7d4]" />
                              <div>
                                <p className="text-xs text-white/60">AI Modules</p>
                                <p className="text-sm font-semibold text-white">
                                  {planRecommendation.plan_features.ai_modules?.length || 0} included
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#3cf7d4]" />
                              <div>
                                <p className="text-xs text-white/60">Users</p>
                                <p className="text-sm font-semibold text-white">
                                  {planRecommendation.plan_features.users_allowed === -1 ? 'Unlimited' : planRecommendation.plan_features.users_allowed}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-[#3cf7d4]" />
                              <div>
                                <p className="text-xs text-white/60">Storage</p>
                                <p className="text-sm font-semibold text-white">
                                  {planRecommendation.plan_features.storage_quota_gb || 'N/A'}GB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-[#3cf7d4]" />
                              <div>
                                <p className="text-xs text-white/60">Support</p>
                                <p className="text-sm font-semibold text-white capitalize">
                                  {planRecommendation.plan_features.support_level?.replace(/_/g, ' ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* ROI Projection */}
                    {planRecommendation.roi_projection && (
                      <Card className="bg-white/5 border-amber-500/20">
                        <CardContent className="p-6">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            ROI Projection
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-white/60 text-sm">Annual Savings</p>
                              <p className="text-2xl font-bold text-green-400">
                                ${planRecommendation.roi_projection.cost_savings.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/60 text-sm">Efficiency Gains</p>
                              <p className="text-sm font-medium text-white mt-2">
                                {planRecommendation.roi_projection.efficiency_gains}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/60 text-sm">Payback Period</p>
                              <p className="text-2xl font-bold text-amber-400">
                                {planRecommendation.roi_projection.payback_period_months} mo
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* All Available Tiers - Enhanced */}
                    <div>
                      <h4 className="text-white font-semibold mb-3 text-lg">Compare All CloudFlip Tiers</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {['demo', 'starter', 'pro', 'partner', 'elite'].map((tier) => {
                          const isRecommended = tier === planRecommendation.recommended_tier;
                          const tierPrices = { demo: 0, starter: 20, pro: 50, partner: 100, elite: 200 };

                          return (
                            <Card key={tier} className={`bg-white/5 border-2 ${isRecommended ? 'border-[#f4d35e] shadow-lg shadow-[#f4d35e]/30' : 'border-white/10'}`}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-bold text-white capitalize text-lg">{tier}</span>
                                  {isRecommended && (
                                    <Badge className="bg-[#f4d35e] text-[#0a1929]">
                                      <Crown className="w-3 h-3 mr-1" />
                                      Best Fit
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-2xl font-bold text-[#f4d35e] mb-3">
                                  ${tierPrices[tier]}<span className="text-sm text-white/60">/mo</span>
                                </p>
                                <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
                                  {allTierFeatures[tier].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <CheckCircle className="w-3 h-3 text-[#3cf7d4] mt-0.5 flex-shrink-0" />
                                      <span className="text-white/70">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Migration Path */}
                {step === 5 && migrationPath && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Your Migration Roadmap</h3>
                        <p className="text-white/60 text-sm">{migrationPath.total_estimated_weeks} weeks to completion</p>
                      </div>
                    </div>

                    {/* Migration Phases */}
                    <div className="space-y-4">
                      {migrationPath.phases.map((phase, idx) => (
                        <Card key={idx} className="bg-white/5 border-amber-500/20">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-white mb-1">
                                  Phase {phase.phase_number}: {phase.name}
                                </h4>
                                <p className="text-sm text-white/70">{phase.description}</p>
                              </div>
                              <Badge className="bg-blue-500/20 text-blue-400 whitespace-nowrap">
                                {phase.estimated_duration_days} days
                              </Badge>
                            </div>

                            <div className="space-y-3 mt-4">
                              <p className="text-xs font-semibold text-amber-400 uppercase">Key Tasks:</p>
                              {phase.tasks.slice(0, 3).map((task, tidx) => (
                                <div key={tidx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-white font-medium">{task.task_name}</p>
                                    <p className="text-white/60 text-xs">{task.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Success Metrics */}
                    <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50">
                      <CardContent className="p-6">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-400" />
                          Success Metrics
                        </h4>
                        <ul className="space-y-2">
                          {migrationPath.success_metrics.map((metric, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-white">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              {metric}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
                    <p className="text-white/70 mb-2">Analyzing your data...</p>
                    <p className="text-white/50 text-sm">This may take a moment</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation - Consistent padding */}
            <div className="p-6 border-t border-amber-500/20 flex justify-between items-center flex-shrink-0">
              <Button
                onClick={handleBack}
                disabled={step === 1 || loading}
                variant="outline"
                className="border-amber-500/30 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Back</span>
              </Button>

              <div className="flex items-center gap-2">
                {canSkip && step < 3 && (
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    className="text-white/60 hover:text-white hover:bg-white/5"
                  >
                    Skip for Now
                  </Button>
                )}

                {step < 5 ? (
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {step === 2 ? 'Calculate Score' : 'Next'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
                  >
                    Complete Assessment
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Discount Offer Popup */}
          <AnimatePresence>
            {showDiscountOffer && step === 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowDiscountOffer(false)}
              >
                <motion.div
                  initial={{ scale: 0.8, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 50 }}
                  className="relative max-w-lg w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Card className="bg-gradient-to-br from-amber-600 via-amber-500 to-orange-600 border-4 border-white/20 shadow-2xl">
                    <button
                      onClick={() => setShowDiscountOffer(false)}
                      className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <CardContent className="p-8 text-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Crown className="w-20 h-20 text-white mx-auto mb-4" />
                      </motion.div>

                      <h3 className="text-3xl font-bold text-white mb-2">
                        🎉 Limited Time Offer!
                      </h3>
                      <p className="text-white/90 text-lg mb-6">
                        Act Now & Save Big
                      </p>

                      <div className="bg-white/20 backdrop-blur rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-2 gap-4 text-white">
                          <div>
                            <p className="text-sm opacity-90">Starter & Pro</p>
                            <p className="text-4xl font-bold">10% OFF</p>
                          </div>
                          <div>
                            <p className="text-sm opacity-90">Partner & Elite</p>
                            <p className="text-4xl font-bold">20% OFF</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <p className="text-white font-semibold">Lock in your rate for 6 months!</p>
                          <p className="text-white/80 text-sm mt-1">Upgrade anytime, keep your discount</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button
                          size="lg"
                          className="w-full bg-white text-amber-600 hover:bg-white/90 font-bold text-lg py-6"
                          onClick={() => {
                            setShowDiscountOffer(false);
                            toast.success('Discount applied! Complete your assessment to claim.');
                          }}
                        >
                          Claim My Discount
                        </Button>
                        <button
                          onClick={() => setShowDiscountOffer(false)}
                          className="text-white/80 hover:text-white text-sm underline"
                        >
                          I'll decide later
                        </button>
                      </div>

                      <p className="text-white/70 text-xs mt-4">
                        Offer valid for new customers only. Terms apply.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Powered by MrTechSys Pill - Bottom Center */}
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#f4d35e]/90 to-[#f4d35e]/70 backdrop-blur border border-[#f4d35e]/50 shadow-lg">
              <div className="flex items-center gap-2">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/4f2a625b6_MrTechSys-Naked-Logo.png"
                  alt="MrTechSys"
                  className="w-4 h-4 object-contain"
                />
                <span className="text-[#0a1929] font-bold text-xs">Powered by MrTechSys</span>
                <Sparkles className="w-3 h-3 text-[#0a1929]" />
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
