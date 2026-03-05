
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle,
  Loader2,
  X,
  Wrench,
  Home,
  Scissors,
  UtensilsCrossed,
  Hammer,
  Shirt,
  Car,
  Paintbrush,
  Leaf,
  Wifi,
  Building,
  Heart,
  GraduationCap,
  Scale,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/api/apiClient";

const INDUSTRY_PATHWAYS = {
  hvac: { name: 'HVAC', icon: Wrench, tagline: 'Smart Climate Solutions', feature: { title: 'Seasonal Campaign Automation', description: 'Auto-trigger AC tune-up campaigns in spring, furnace checks in fall', visual: '🌡️ → 📧 → 💰' } },
  plumbing: { name: 'Plumbing', icon: Wrench, tagline: 'Emergency Dispatch & Billing', feature: { title: 'Emergency Response Routing', description: 'Smart dispatch based on tech location, availability, and job urgency', visual: '🚨 → 📍 → 👷' } },
  electrical: { name: 'Electrical', icon: Zap, tagline: 'Power & Safety Solutions', feature: { title: 'Safety Inspection Scheduler', description: 'Automated compliance checks and certificate management', visual: '⚡ → 📋 → ✅' } },
  roofing: { name: 'Roofing', icon: Home, tagline: 'Weather-Proof Solutions', feature: { title: 'Storm Response System', description: 'Automated lead capture during weather events', visual: '🌧️ → 📞 → 🏠' } },
  landscaping: { name: 'Landscaping', icon: Leaf, tagline: 'Outdoor Living Experts', feature: { title: 'Seasonal Service Plans', description: 'Automated billing for recurring maintenance', visual: '🌱 → 📅 → 💵' } },
  pest_control: { name: 'Pest Control', icon: Home, tagline: 'Preventive & Emergency Services', feature: { title: 'Recurring Treatment Automation', description: 'Scheduled visits with automated reminders', visual: '🐛 → 📆 → ✅' } },
  cleaning: { name: 'Cleaning Services', icon: Sparkles, tagline: 'Commercial & Residential', feature: { title: 'Booking & Crew Dispatch', description: 'Online booking with automated crew assignment', visual: '🧹 → 👷 → ✨' } },
  locksmith: { name: 'Locksmith', icon: Home, tagline: 'Security & Emergency Access', feature: { title: 'Emergency Dispatch System', description: 'Priority routing for urgent calls', visual: '🔐 → 🚨 → 🔑' } },
  painting: { name: 'Painting', icon: Paintbrush, tagline: 'Interior & Exterior Pros', feature: { title: 'Visual Quote Builder', description: 'Photo-based estimates with AI color matching', visual: '🎨 → 📸 → 💰' } },
  flooring: { name: 'Flooring', icon: Home, tagline: 'Quality Installation Services', feature: { title: 'Material Calculator', description: 'Automated measurements and pricing', visual: '📐 → 🧮 → 💵' } },
  carpentry: { name: 'Carpentry', icon: Hammer, tagline: 'Custom Woodwork Solutions', feature: { title: 'Project Timeline Manager', description: 'Milestone tracking with client updates', visual: '🪚 → 📊 → ✅' } },
  pool_service: { name: 'Pool Service', icon: Wrench, tagline: 'Maintenance & Repairs', feature: { title: 'Chemical Balance Tracking', description: 'Automated testing schedules and reports', visual: '🏊 → 🧪 → 📈' } },
  appliance_repair: { name: 'Appliance Repair', icon: Wrench, tagline: 'Fast & Reliable Fixes', feature: { title: 'Parts Inventory System', description: 'Real-time stock tracking and ordering', visual: '🔧 → 📦 → ✅' } },
  auto_repair: { name: 'Auto Repair', icon: Car, tagline: 'Complete Vehicle Care', feature: { title: 'Service History Tracker', description: 'Digital maintenance records for customers', visual: '🚗 → 📋 → 🔧' } },
  salon: { name: 'Salon & Spa', icon: Scissors, tagline: 'Beauty & Wellness Services', feature: { title: 'Online Booking System', description: 'Real-time availability and stylist selection', visual: '💇 → 📅 → ✨' } },
  restaurant: { name: 'Restaurant', icon: UtensilsCrossed, tagline: 'Reservation & Review Management', feature: { title: 'Review Response AI', description: 'Automated responses to reviews with sentiment analysis', visual: '⭐ → 🤖 → 💬' } },
  retail: { name: 'Retail Store', icon: Building, tagline: 'Inventory & POS Management', feature: { title: 'Smart Inventory Alerts', description: 'Low stock notifications and reorder automation', visual: '📦 → 🔔 → 🛒' } },
  gym: { name: 'Gym & Fitness', icon: Heart, tagline: 'Membership & Class Management', feature: { title: 'Member Portal', description: 'Class booking, billing, and workout tracking', visual: '💪 → 📱 → 📊' } },
  dental: { name: 'Dental', icon: Heart, tagline: 'Patient Appointment Management', feature: { title: 'Automated Recall Campaigns', description: '6-month checkup reminders with online booking', visual: '📅 → 📧 → 🦷' } },
  healthcare: { name: 'Healthcare', icon: Heart, tagline: 'HIPAA-Compliant Patient Management', feature: { title: 'Secure Patient Portal', description: 'Encrypted communication and record management', visual: '👨‍⚕️ → 📋 → ✅' } },
  legal: { name: 'Legal Services', icon: Scale, tagline: 'Case & Document Management', feature: { title: 'Client Portal', description: 'Secure document sharing and billing', visual: '⚖️ → 📄 → 💼' } },
  education: { name: 'Education & Tutoring', icon: GraduationCap, tagline: 'Student Management System', feature: { title: 'Progress Tracking', description: 'Attendance, grades, and parent communication', visual: '📚 → 📊 → 👨‍🎓' } },
  it_services: { name: 'IT Services', icon: Wifi, tagline: 'Technical Support & Management', feature: { title: 'Ticket Management System', description: 'Priority routing and SLA tracking', visual: '💻 → 🎫 → ✅' } },
  real_estate: { name: 'Real Estate', icon: Building, tagline: 'Property Management', feature: { title: 'Listing & Lead Management', description: 'Automated follow-ups and property tours', visual: '🏘️ → 📞 → 🤝' } },
  insurance: { name: 'Insurance Agency', icon: Shield, tagline: 'Policy & Claims Management', feature: { title: 'Renewal Automation', description: 'Policy expiration alerts and renewal campaigns', visual: '📄 → 🔔 → 📧' } },
  consulting: { name: 'Consulting', icon: Building, tagline: 'Professional Services', feature: { title: 'Project & Time Tracking', description: 'Billable hours with client reporting', visual: '⏰ → 💼 → 💵' } }
};

const COMMAND_CENTER_MODULES = [
  { name: 'CRM', icon: '👥', color: 'cyan' },
  { name: 'Quotes', icon: '📄', color: 'purple' },
  { name: 'Jobs', icon: '📅', color: 'amber' },
  { name: 'Analytics', icon: '📊', color: 'green' },
  { name: 'DevOps', icon: '🛡️', color: 'red' },
  { name: 'AI Agents', icon: '🤖', color: 'pink' }
];

export default function IntroVideo({ open, onComplete, canSkip = false }) {
  const [scene, setScene] = useState('awakening');
  const [selectedPathways, setSelectedPathways] = useState([]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  useEffect(() => {
    if (open && scene === 'awakening') {
      const timer = setTimeout(() => {
        setScene('vertical_select');
        fetchAISuggestion();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, scene]);

  const fetchAISuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const user = await api.auth.me();
      if (user?.current_org_id) {
        const orgs = await api.entities.Organization.filter({ id: user.current_org_id });
        if (orgs.length > 0 && orgs[0].industry) {
          const industry = orgs[0].industry.toLowerCase();
          const matchedPathway = Object.keys(INDUSTRY_PATHWAYS).find(key => 
            industry.includes(key) || key.includes(industry.split(' ')[0])
          );
          if (matchedPathway) {
            setAiSuggestion(matchedPathway);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestion:', error);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handlePathwayToggle = (pathway) => {
    setSelectedPathways(prev => 
      prev.includes(pathway) 
        ? prev.filter(p => p !== pathway)
        : [...prev, pathway]
    );
  };

  const handleSkip = async () => {
    try {
      const user = await api.auth.me();
      await api.auth.updateMe({
        data: {
          ...user.data,
          intro_completed: true,
          intro_skipped: true
        }
      });
    } catch (error) {
      console.error('Failed to save skip status:', error);
    }
    onComplete();
  };

  const handleNext = async () => {
    if (scene === 'awakening') {
      setScene('vertical_select');
    } else if (scene === 'vertical_select') {
      // Save selected industries
      try {
        const user = await api.auth.me();
        const industries = [...selectedPathways];
        if (customIndustry.trim()) {
          industries.push(`custom:${customIndustry.trim()}`);
        }
        await api.auth.updateMe({
          data: {
            ...user.data,
            selected_industries: industries
          }
        });
      } catch (error) {
        console.error('Failed to save industries:', error);
      }
      setScene('vertical_feature');
    } else if (scene === 'vertical_feature') {
      setScene('command_center');
    } else if (scene === 'command_center') {
      setScene('personalization');
    } else if (scene === 'personalization') {
      setScene('launchpad');
    } else if (scene === 'launchpad') {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      const user = await api.auth.me();
      await api.auth.updateMe({
        data: {
          ...user.data,
          intro_completed: true
        }
      });
    } catch (error) {
      console.error('Failed to save completion status:', error);
    }
    onComplete();
  };

  const handleBack = () => {
    if (scene === 'vertical_select') setScene('awakening');
    else if (scene === 'vertical_feature') setScene('vertical_select');
    else if (scene === 'command_center') setScene('vertical_feature');
    else if (scene === 'personalization') setScene('command_center');
    else if (scene === 'launchpad') setScene('personalization');
  };

  const primaryPathway = INDUSTRY_PATHWAYS[selectedPathways[0]];
  const canProceed = selectedPathways.length > 0 || customIndustry.trim().length > 0;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-[#0a1929] via-[#1a2744] to-[#0f1f3a] border-2 border-amber-500/30 p-0 overflow-hidden flex flex-col"
        hideClose={!canSkip}
      >
        {canSkip && (
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="sm" // Changed size from "icon" to "sm" for better visibility if text is added
            className="absolute top-4 right-4 z-50 text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5 mr-1" /> Skip Intro
          </Button>
        )}

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {scene === 'awakening' && <AwakeningScene key="awakening" />}
            
            {scene === 'vertical_select' && (
              <VerticalSelectionScene
                key="vertical_select"
                selectedPathways={selectedPathways}
                onToggle={handlePathwayToggle}
                aiSuggestion={aiSuggestion}
                loading={loadingSuggestion}
                customIndustry={customIndustry}
                onCustomChange={setCustomIndustry}
              />
            )}
            
            {scene === 'vertical_feature' && primaryPathway && (
              <VerticalFeatureScene
                key="vertical_feature"
                pathway={primaryPathway}
              />
            )}
            
            {scene === 'command_center' && (
              <CommandCenterScene key="command_center" />
            )}
            
            {scene === 'personalization' && (
              <PersonalizationScene
                key="personalization"
                pathway={primaryPathway}
              />
            )}
            
            {scene === 'launchpad' && <LaunchPadScene key="launchpad" />}
          </AnimatePresence>
        </div>

        <div className="flex-shrink-0 p-6 bg-gradient-to-t from-[#0a1929] to-transparent border-t border-white/5">
          <div className="flex items-center justify-between">
            {scene !== 'awakening' && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white"
              >
                ← Back
              </Button>
            )}
            <div className="flex-1" />
            {scene !== 'awakening' && (
              <Button
                onClick={handleNext}
                disabled={scene === 'vertical_select' && !canProceed}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold disabled:opacity-50"
              >
                {scene === 'launchpad' ? 'Start Your Journey' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===== SCENE COMPONENTS =====

function AwakeningScene() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[500px] flex items-center justify-center p-12"
    >
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 1 }}
          className="relative"
        >
          <motion.div
            className="w-48 h-48 mx-auto relative"
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/5fae4ab52_image.png"
              alt="CloudFlip"
              className="w-full h-full object-contain"
              style={{
                filter: 'brightness(1.5) drop-shadow(0 0 60px rgba(6, 182, 212, 1)) drop-shadow(0 0 100px rgba(168, 85, 247, 0.9))',
              }}
            />
          </motion.div>
          
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border-2 border-cyan-500/20 rounded-full"
              animate={{
                scale: [1, 2, 2],
                opacity: [0.5, 0, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6
              }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">CloudFlip</span>
          </h1>
          <p className="text-xl text-white/70">
            AI-Powered Business Operations Platform
          </p>
          <Badge className="mt-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by MrTechSys
          </Badge>
        </motion.div>
      </div>
    </motion.div>
  );
}

function VerticalSelectionScene({ selectedPathways, onToggle, aiSuggestion, loading, customIndustry, onCustomChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="p-8 min-h-[500px]"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          Choose Your Industry Pathways
        </h2>
        <p className="text-white/60">
          Select one or more industries that match your business (you can select multiple)
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mr-2" />
          <span className="text-cyan-400 text-sm">AI is analyzing your business...</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto mb-6">
        {Object.entries(INDUSTRY_PATHWAYS).map(([key, industry]) => {
          const IconComponent = industry.icon;
          const isSelected = selectedPathways.includes(key);
          return (
            <Card
              key={key}
              onClick={() => onToggle(key)}
              className={`cursor-pointer transition-all hover:scale-105 ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-500 ring-2 ring-amber-400/50'
                  : aiSuggestion === key
                  ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500 ring-2 ring-cyan-400/50'
                  : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              <CardContent className="p-4 text-center">
                <IconComponent className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                <h3 className="text-white font-bold mb-1 text-base">{industry.name}</h3>
                <p className="text-white/60 text-xs mb-2">{industry.tagline}</p>
                {isSelected && (
                  <Badge className="bg-amber-500/30 text-amber-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                )}
                {!isSelected && aiSuggestion === key && (
                  <Badge className="bg-cyan-500/20 text-cyan-400">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Suggested
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-3">
          <p className="text-white/60 text-sm">Don't see your industry?</p>
        </div>
        <Input
          placeholder="Enter your industry (e.g., Photography, Catering, etc.)"
          value={customIndustry}
          onChange={(e) => onCustomChange(e.target.value)}
          className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
        />
      </div>

      {selectedPathways.length === 0 && !customIndustry.trim() && (
        <div className="text-center mt-6">
          <p className="text-amber-400 text-sm">Please select at least one industry to continue</p>
        </div>
      )}
    </motion.div>
  );
}

function VerticalFeatureScene({ pathway }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="p-12 min-h-[500px] flex items-center"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {pathway.name} Solutions
          </h2>
          <p className="text-white/60">{pathway.tagline}</p>
        </div>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">{pathway.feature.title}</h3>
            </div>
            <p className="text-white/70 mb-6">{pathway.feature.description}</p>
            
            <div className="text-center">
              <div className="inline-block p-6 bg-white/5 rounded-xl border border-amber-500/20">
                <p className="text-4xl tracking-wider">{pathway.feature.visual}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function CommandCenterScene() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="p-12 min-h-[500px]"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Unified Command Center
        </h2>
        <p className="text-white/60">
          All your business operations in one intelligent dashboard
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {COMMAND_CENTER_MODULES.map((module, idx) => (
          <motion.div
            key={module.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-amber-500/30 hover:scale-105 transition-transform">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">{module.icon}</div>
                <p className="text-amber-400 font-semibold">{module.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function PersonalizationScene({ pathway }) {
  const recommendedModules = [
    { name: 'Smart Lead Scraper', icon: '🎯' },
    { name: 'AI Email Campaigns', icon: '📧' },
    { name: 'Automated Quotes', icon: '📄' },
    { name: 'Review Manager', icon: '⭐' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-12 min-h-[500px]"
    >
      <div className="text-center mb-8">
        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">
          Your Personalized Dashboard
        </h2>
        <p className="text-white/60">
          Based on your {pathway?.name} business
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {recommendedModules.map((module, idx) => (
          <motion.div
            key={module.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-purple-500/30 hover:border-purple-500/60 transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="text-3xl">{module.icon}</div>
                <div>
                  <p className="text-white font-semibold">{module.name}</p>
                  <Badge className="bg-purple-500/20 text-purple-400 mt-1">
                    Recommended
                  </Badge>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function LaunchPadScene() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-12 min-h-[500px] flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="mb-8"
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/5fae4ab52_image.png"
            alt="CloudFlip"
            className="w-64 h-64 mx-auto object-contain"
            style={{
              filter: 'brightness(1.5) drop-shadow(0 0 60px rgba(6, 182, 212, 1)) drop-shadow(0 0 100px rgba(168, 85, 247, 0.9))',
            }}
          />
        </motion.div>

        <h2 className="text-4xl font-bold text-white mb-4">
          You're All Set! 🚀
        </h2>
        <p className="text-xl text-white/70 mb-8">
          Let's flip your business to the cloud
        </p>
      </div>
    </motion.div>
  );
}
