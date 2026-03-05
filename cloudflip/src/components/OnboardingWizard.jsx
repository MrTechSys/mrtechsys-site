
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Stethoscope,
  Wrench,
  UtensilsCrossed,
  Droplet,
  Shield,
  Users,
  Camera,
  DollarSign,
  Building,
  ShoppingBag,
  Scale,
  GraduationCap,
  Briefcase,
  Sparkles,
  Loader2,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
  Music,
  X,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const industryOptions = [
  { 
    id: "healthcare", 
    label: "Healthcare", 
    description: "HIPAA-Compliant Patient Management",
    icon: Stethoscope,
    color: "from-red-500 to-pink-500"
  },
  { 
    id: "hvac", 
    label: "HVAC", 
    description: "Smart Climate Solutions",
    icon: Wrench,
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "restaurant", 
    label: "Restaurant", 
    description: "Reservation & Review Management",
    icon: UtensilsCrossed,
    color: "from-orange-500 to-red-500"
  },
  { 
    id: "plumbing", 
    label: "Plumbing", 
    description: "Emergency Dispatch & Billing",
    icon: Droplet,
    color: "from-blue-600 to-blue-400"
  },
  { 
    id: "dental", 
    label: "Dental", 
    description: "Patient Appointment Management",
    icon: Stethoscope,
    color: "from-cyan-500 to-blue-500"
  },
  { 
    id: "cybersecurity", 
    label: "Cybersecurity", 
    description: "SIEM Workflow & Threat Response",
    icon: Shield,
    color: "from-purple-600 to-indigo-600"
  },
  { 
    id: "hr_payroll", 
    label: "HR & Payroll", 
    description: "Time Off, Payslips, Directory, Expenses",
    icon: Users,
    color: "from-indigo-500 to-purple-500"
  },
  { 
    id: "av_events", 
    label: "AV & Events", 
    description: "Booking, Dispatch, and Equipment Tracking",
    icon: Camera,
    color: "from-violet-500 to-purple-500"
  },
  { 
    id: "insurance", 
    label: "Insurance", 
    description: "Claims, Policy, and Compliance Automation",
    icon: DollarSign,
    color: "from-green-600 to-emerald-500"
  },
  { 
    id: "banking", 
    label: "Banking", 
    description: "KYC, Transactions, and Risk Monitoring",
    icon: Building,
    color: "from-slate-700 to-slate-500"
  },
  { 
    id: "retail", 
    label: "Retail", 
    description: "Inventory, POS, and Loyalty Programs",
    icon: ShoppingBag,
    color: "from-pink-600 to-rose-500"
  },
  { 
    id: "legal", 
    label: "Legal", 
    description: "Case Management & Compliance Tracking",
    icon: Scale,
    color: "from-slate-700 to-slate-500"
  },
  { 
    id: "education", 
    label: "Education", 
    description: "Student Records & Learning Modules",
    icon: GraduationCap,
    color: "from-blue-600 to-indigo-500"
  },
  { 
    id: "other", 
    label: "Other", 
    description: "Enter your industry manually below",
    icon: Briefcase,
    color: "from-gray-600 to-gray-400"
  }
];

export default function OnboardingWizard({ open, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [customIndustry, setCustomIndustry] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [generatedTagline, setGeneratedTagline] = useState("");
  const [permissions, setPermissions] = useState({
    location: false,
    notifications: false,
    camera: false,
    microphone: false,
  });
  const [canSkip, setCanSkip] = useState(true);

  // Load saved progress from localStorage
  useEffect(() => {
    if (open) {
      try {
        const saved = localStorage.getItem('cloudflip_onboarding_progress');
        if (saved) {
          const progress = JSON.parse(saved);
          if (progress.selectedIndustry) setSelectedIndustry(progress.selectedIndustry);
          if (progress.customIndustry) setCustomIndustry(progress.customIndustry);
          if (progress.businessName) setBusinessName(progress.businessName);
          if (progress.businessEmail) setBusinessEmail(progress.businessEmail);
          if (progress.businessPhone) setBusinessPhone(progress.businessPhone);
          if (progress.city) setCity(progress.city);
          if (progress.state) setState(progress.state);
          if (progress.generatedTagline) setGeneratedTagline(progress.generatedTagline);
          if (progress.step) setStep(progress.step);
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, [open]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (open) {
      const progress = {
        step,
        selectedIndustry,
        customIndustry,
        businessName,
        businessEmail,
        businessPhone,
        city,
        state,
        generatedTagline
      };
      localStorage.setItem('cloudflip_onboarding_progress', JSON.stringify(progress));
    }
  }, [step, selectedIndustry, customIndustry, businessName, businessEmail, businessPhone, city, state, generatedTagline, open]);

  const generateTaglineMutation = useMutation({
    mutationFn: async (industryName) => {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Generate a catchy, professional 4-6 word tagline for a ${industryName} business. Make it inspiring and memorable. Return ONLY the tagline text, no quotes.`,
      });
      return response;
    },
    onSuccess: (tagline) => {
      setGeneratedTagline(tagline);
      setStep(3);
    },
    onError: () => {
      toast.error("Failed to generate tagline");
      setStep(3);
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      
      let org;
      if (user.current_org_id) {
        const orgs = await api.entities.Organization.filter({ id: user.current_org_id });
        if (orgs.length > 0) {
          org = orgs[0];
          await api.entities.Organization.update(org.id, {
            industry: data.industryName,
            onboarding_completed: true,
            settings: {
              ...(org.settings || {}),
              brand_name: data.businessName,
              tagline: data.tagline,
              reply_email: data.businessEmail,
              sms_from: data.businessPhone,
            }
          });
        }
      }

      await api.auth.updateMe({
        data: {
          ...(user.data || {}),
          onboarding_completed: true,
          business_location: {
            city: data.city,
            state: data.state
          }
        }
      });

      // Clear progress from localStorage
      localStorage.removeItem('cloudflip_onboarding_progress');
      localStorage.setItem('cloudflip_onboarding_completed', 'true');

      return { user, org };
    },
    onSuccess: () => {
      toast.success("Setup complete! Welcome to CloudFlip 🎉");
      onComplete();
    },
    onError: (error) => {
      console.error("Onboarding error:", error);
      toast.error("Setup failed. Please try again.");
    }
  });

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedIndustry) {
        toast.error("Please select your industry");
        return;
      }
      if (selectedIndustry.id === 'other' && !customIndustry.trim()) {
        toast.error("Please enter your industry");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!businessName) {
        toast.error("Please enter your business name");
        return;
      }
      const industryName = selectedIndustry.id === 'other' ? customIndustry : selectedIndustry.label;
      generateTaglineMutation.mutate(industryName);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      await requestPermission('location');
      await requestPermission('notifications');
      await requestPermission('camera');
      await requestPermission('microphone');
      setStep(5);
    }
  };

  const requestPermission = async (type) => {
    try {
      if (type === 'location' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setPermissions(p => ({ ...p, location: true })),
          () => setPermissions(p => ({ ...p, location: false }))
        );
      } else if (type === 'notifications' && 'Notification' in window) {
        const result = await Notification.requestPermission();
        setPermissions(p => ({ ...p, notifications: result === 'granted' }));
      } else if (type === 'camera' && navigator.mediaDevices) {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          setPermissions(p => ({ ...p, camera: true }));
        } catch {
          setPermissions(p => ({ ...p, camera: false }));
        }
      } else if (type === 'microphone' && navigator.mediaDevices) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setPermissions(p => ({ ...p, microphone: true }));
        } catch {
          setPermissions(p => ({ ...p, microphone: false }));
        }
      }
    } catch (error) {
      console.error(`Permission error for ${type}:`, error);
    }
  };

  const handleComplete = () => {
    const industryName = selectedIndustry.id === 'other' ? customIndustry : selectedIndustry.label;
    completeMutation.mutate({
      industryName,
      businessName,
      businessEmail,
      businessPhone,
      city,
      state,
      tagline: generatedTagline,
      permissions
    });
  };

  const handleClose = async () => {
    try {
      const user = await api.auth.me();
      
      // Save skipped status
      await api.auth.updateMe({
        data: {
          ...(user.data || {}),
          onboarding_skipped: true,
          onboarding_completed: true
        }
      });

      // Mark org as onboarding completed
      if (user.current_org_id) {
        const orgs = await api.entities.Organization.filter({ id: user.current_org_id });
        if (orgs.length > 0) {
          await api.entities.Organization.update(orgs[0].id, {
            onboarding_completed: true
          });
        }
      }

      localStorage.setItem('cloudflip_onboarding_completed', 'true');
      toast.info("Onboarding skipped. You can restart it anytime from Settings.");
      onComplete();
    } catch (error) {
      console.error('Error closing onboarding:', error);
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('cloudflip_onboarding_skipped', 'true');
    toast.info("Onboarding skipped for now. You can restart it anytime from Settings.");
    onComplete(); // Call onComplete to signal parent to close the dialog
  };

  const handleReopenFromSettings = () => {
    // This function can be called from settings panel
    localStorage.removeItem('cloudflip_onboarding_completed');
    localStorage.removeItem('cloudflip_onboarding_skipped');
    setStep(1); // Reset to the first step
    // The parent component would then need to set `open(true)` to re-open the wizard.
  };

  const isStep1Valid = selectedIndustry && (selectedIndustry.id !== 'other' || customIndustry.trim());

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // If the dialog closes by means other than the explicit buttons, and it's skippable, call handleSkip
      if (!isOpen && canSkip) {
        handleSkip();
      }
    }}>
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0a1929] via-[#0f2744] to-[#0a1929] border-amber-500/30"
        hideClose={true}
      >
        {/* Gold X Button */}
        <Button
          onClick={handleClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
        >
          <X className="w-5 h-5" />
        </Button>

        {canSkip && step < 5 && ( // Show skip button for steps 1-4
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-4 right-12 z-50 text-white/60 hover:text-white"
          >
            Skip for now
          </Button>
        )}

        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            Welcome to <span className="text-amber-400">CloudFlip</span>
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Step {step} of 5 - Let's set up your business
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
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
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Choose Your Industry Pathway</h3>
                <p className="text-white/60">We'll customize CloudFlip to match your business needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto pr-2">
                {industryOptions.map((industry) => {
                  const Icon = industry.icon;
                  const isSelected = selectedIndustry?.id === industry.id;
                  
                  return (
                    <Card
                      key={industry.id}
                      onClick={() => setSelectedIndustry(industry)}
                      className={`cursor-pointer transition-all hover:scale-[1.02] ${
                        isSelected
                          ? `bg-gradient-to-br ${industry.color} border-2 border-amber-400 shadow-lg shadow-amber-500/20`
                          : 'bg-[#0f2744]/50 border border-amber-500/20 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
                          {isSelected && (
                            <CheckCircle className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <h4 className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-white/90'}`}>
                          {industry.label}
                        </h4>
                        <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-white/60'}`}>
                          {industry.description}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {selectedIndustry?.id === 'other' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Label className="text-white mb-2 block">Enter Your Industry</Label>
                  <Input
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="e.g., Construction, Photography, Consulting..."
                    className="bg-[#0f2744]/50 border-amber-500/30 text-white placeholder:text-white/40"
                    autoFocus
                  />
                </motion.div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-[#0a1929] font-bold px-8"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                {selectedIndustry?.icon && <selectedIndustry.icon className="w-8 h-8 text-amber-400" />}
                <div>
                  <h3 className="text-xl font-bold text-white">Tell us about your business</h3>
                  <p className="text-white/60 text-sm">
                    We'll personalize CloudFlip for {selectedIndustry?.id === 'other' ? customIndustry : selectedIndustry?.label}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">Business Name *</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., MrTechSys"
                    className="bg-[#0f2744]/50 border-amber-500/30 text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      Business Email
                    </Label>
                    <Input
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="contact@yourbusiness.com"
                      className="bg-[#0f2744]/50 border-amber-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-400" />
                      Business Phone
                    </Label>
                    <Input
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="bg-[#0f2744]/50 border-amber-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-400" />
                      City
                    </Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Austin"
                      className="bg-[#0f2744]/50 border-amber-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">State</Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="TX"
                      className="bg-[#0f2744]/50 border-amber-500/30 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!businessName || generateTaglineMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-[#0a1929] font-bold px-8"
                >
                  {generateTaglineMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Your AI-Generated Tagline</h3>
                <p className="text-white/60 text-sm">Here's a professional tagline for your business</p>
              </div>

              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/40 p-6">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white mb-2">
                    {businessName}
                  </p>
                  <p className="text-lg text-amber-400 italic">
                    "{generatedTagline || 'Generating your perfect tagline...'}"
                  </p>
                </div>
              </Card>

              <div>
                <Label className="text-white">Customize Your Tagline (Optional)</Label>
                <Input
                  value={generatedTagline}
                  onChange={(e) => setGeneratedTagline(e.target.value)}
                  placeholder="Your custom tagline..."
                  className="bg-[#0f2744]/50 border-amber-500/30 text-white"
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-[#0a1929] font-bold px-8"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Enable Key Features</h3>
                <p className="text-white/60 text-sm">Grant permissions for the best experience</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    permissions.location
                      ? 'bg-green-500/20 border-green-500/40'
                      : 'bg-[#0f2744]/50 border-amber-500/20 hover:border-amber-500/50'
                  }`}
                  onClick={() => requestPermission('location')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-red-400" />
                      <div>
                        <p className="text-white font-medium">Location</p>
                        <p className="text-white/60 text-xs">Local lead discovery</p>
                      </div>
                    </div>
                    {permissions.location && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    permissions.notifications
                      ? 'bg-green-500/20 border-green-500/40'
                      : 'bg-[#0f2744]/50 border-amber-500/20 hover:border-amber-500/50'
                  }`}
                  onClick={() => requestPermission('notifications')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Notifications</p>
                        <p className="text-white/60 text-xs">Get alerts for leads</p>
                      </div>
                    </div>
                    {permissions.notifications && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    permissions.camera
                      ? 'bg-green-500/20 border-green-500/40'
                      : 'bg-[#0f2744]/50 border-amber-500/20 hover:border-amber-500/50'
                  }`}
                  onClick={() => requestPermission('camera')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="w-6 h-6 text-cyan-400" />
                      <div>
                        <p className="text-white font-medium">Camera</p>
                        <p className="text-white/60 text-xs">Video meetings</p>
                      </div>
                    </div>
                    {permissions.camera && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    permissions.microphone
                      ? 'bg-green-500/20 border-green-500/40'
                      : 'bg-[#0f2744]/50 border-amber-500/20 hover:border-amber-500/50'
                  }`}
                  onClick={() => requestPermission('microphone')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Music className="w-6 h-6 text-amber-400" />
                      <div>
                        <p className="text-white font-medium">Microphone</p>
                        <p className="text-white/60 text-xs">Voice commands</p>
                      </div>
                    </div>
                    {permissions.microphone && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                </Card>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(3)}
                  className="text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-[#0a1929] font-bold px-8"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">You're All Set!</h3>
                <p className="text-white/60">Ready to transform your business with AI</p>
              </div>

              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {selectedIndustry?.icon && <selectedIndustry.icon className="w-5 h-5 text-amber-400" />}
                    <p className="text-white">
                      <strong>{businessName}</strong>
                    </p>
                  </div>
                  <p className="text-amber-400 italic">"{generatedTagline}"</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge className="bg-white/10 text-white">
                      {selectedIndustry?.id === 'other' ? customIndustry : selectedIndustry?.label}
                    </Badge>
                    {city && state && (
                      <Badge className="bg-white/10 text-white">{city}, {state}</Badge>
                    )}
                    {permissions.location && (
                      <Badge className="bg-green-500/20 text-green-400">Location Enabled</Badge>
                    )}
                    {permissions.notifications && (
                      <Badge className="bg-purple-500/20 text-purple-400">Notifications On</Badge>
                    )}
                  </div>
                </div>
              </Card>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm text-center">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  <strong>Next:</strong> Explore your personalized dashboard and start managing your business!
                </p>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(4)}
                  className="text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold px-8"
                >
                  {completeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Launch CloudFlip
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
